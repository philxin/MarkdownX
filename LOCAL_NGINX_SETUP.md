# MarkdownX 本地 Nginx 配置说明

本文档说明如何在本地 Windows 环境配置 Nginx 反向代理。

## 配置概览

- **Nginx 路径**: `D:\develop\nginx-1.17.4`
- **监听端口**: 80
- **后端服务**: Node.js API (localhost:3000)
- **访问地址**: http://localhost

## 已配置的路由

### 1. API 接口
- **路径**: `/api/*`
- **代理到**: `http://127.0.0.1:3000/api/`
- **用途**: 所有 API 请求（生成图片、获取列表等）

### 2. 健康检查
- **路径**: `/health`
- **代理到**: `http://127.0.0.1:3000/health`
- **用途**: 服务健康状态检查

### 3. 静态文件（图片）
- **路径**: `/outputs/*`
- **文件目录**: `D:/MarkdownX/server/outputs/`
- **缓存策略**: 7天，immutable
- **用途**: 访问生成的图片文件

### 4. 默认页面
- **路径**: `/`
- **文件目录**: Nginx html 目录
- **用途**: Nginx 默认欢迎页面

## 启动服务

### 1. 启动 Node.js API 服务器

```bash
cd D:\MarkdownX
node server\index.js
```

或使用后台运行：
```bash
npm run start:api
```

### 2. 启动 Nginx

```bash
cd D:\develop\nginx-1.17.4
nginx.exe
```

### 3. 重新加载 Nginx 配置

修改配置后：
```bash
cd D:\develop\nginx-1.17.4
nginx.exe -s reload
```

### 4. 停止 Nginx

```bash
cd D:\develop\nginx-1.17.4
nginx.exe -s stop
```

## 测试验证

### 健康检查
```bash
curl http://localhost/health
```

预期返回：
```json
{"status":"ok","message":"Markdown Snapper MCP服务运行正常"}
```

### 生成图片
```bash
curl -X POST http://localhost/api/generate-from-text \
  -H "Content-Type: application/json" \
  -d "{\"markdown\":\"# 测试标题\",\"theme\":\"notion\"}"
```

预期返回：
```json
{
  "success": true,
  "message": "图片生成成功!",
  "data": {
    "filename": "output-xxx.png",
    "url": "http://localhost/outputs/output-xxx.png",
    "absolutePath": "D:\\MarkdownX\\server\\outputs\\output-xxx.png",
    "relativePath": "outputs\\output-xxx.png"
  }
}
```

### 访问图片
在浏览器中打开返回的 `url` 字段，例如：
```
http://localhost/outputs/output-1773295508995.png
```

### 获取图片列表
```bash
curl http://localhost/api/images
```

## Nginx 配置详情

配置文件位置：`D:\develop\nginx-1.17.4\conf\nginx.conf`

关键配置段：
```nginx
server {
    listen       80;
    server_name  localhost;

    # MarkdownX API 代理
    location /api/ {
        proxy_pass   http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # MarkdownX 健康检查
    location /health {
        proxy_pass   http://127.0.0.1:3000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # MarkdownX 静态文件（生成的图片）
    location /outputs/ {
        alias D:/MarkdownX/server/outputs/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # 默认页面
    location / {
        root   html;
        index  index.html index.htm;
    }
}
```

## 配置说明

### 超时设置
- `proxy_connect_timeout`: 60秒 - 连接后端超时
- `proxy_send_timeout`: 60秒 - 发送请求超时
- `proxy_read_timeout`: 60秒 - 读取响应超时

这些设置确保 Puppeteer 有足够时间渲染复杂的 Markdown 内容。

### 缓存策略
- 图片文件缓存 7 天
- `immutable` 标记表示文件内容不会改变
- 减少重复请求，提高性能

### 文件上传限制
全局配置中已设置：
```nginx
client_max_body_size 100m;
```

## 常见问题

### 1. 端口 80 被占用
**错误**: `bind() to 0.0.0.0:80 failed`

**解决方案**:
- 检查其他程序是否占用 80 端口
- 修改 Nginx 配置使用其他端口（如 8080）

### 2. 图片无法访问
**错误**: 404 Not Found

**检查**:
- 确认文件路径正确：`D:/MarkdownX/server/outputs/`
- 确认文件存在：`ls D:/MarkdownX/server/outputs/`
- 检查 Nginx 错误日志：`D:\develop\nginx-1.17.4\logs\error.log`

### 3. API 请求失败
**错误**: 502 Bad Gateway

**检查**:
- Node.js 服务是否运行：`curl http://localhost:3000/health`
- 检查端口 3000 是否被占用：`netstat -ano | grep 3000`

### 4. 配置修改不生效
**解决方案**:
```bash
# 测试配置
nginx.exe -t

# 重新加载
nginx.exe -s reload

# 如果还不行，重启 Nginx
nginx.exe -s stop
nginx.exe
```

## 性能优化建议

### 1. 启用 Gzip 压缩
在 `http` 块中添加：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. 增加 Worker 进程
```nginx
worker_processes auto;
```

### 3. 调整连接数
```nginx
events {
    worker_connections 2048;
}
```

## 与生产环境的差异

| 配置项 | 本地环境 | 生产环境 |
|--------|---------|---------|
| 监听地址 | localhost | 0.0.0.0 或域名 |
| HTTPS | 无 | 推荐启用 |
| 日志 | 默认位置 | 独立日志文件 |
| 进程管理 | 手动启动 | PM2 自动管理 |
| 防火墙 | 无需配置 | 需要开放端口 |

## 下一步

本地测试通过后，可以按照 `DEPLOYMENT.md` 文档部署到生产服务器。

主要区别：
1. 生产环境使用 PM2 管理 Node.js 进程
2. 配置域名和 HTTPS
3. 设置防火墙规则
4. 配置日志轮转
5. 设置开机自启动

## 测试结果

✅ 健康检查正常
✅ 图片生成 API 正常
✅ 图片列表 API 正常
✅ 静态文件访问正常
✅ URL 自动生成正确（http://localhost/outputs/xxx.png）
✅ 缓存策略生效

所有功能测试通过！
