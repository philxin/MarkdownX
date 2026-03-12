# MarkdownX 服务器部署指南

本文档提供在 Linux VPS 上部署 MarkdownX 服务的完整步骤。

## 目录

- [系统要求](#系统要求)
- [部署架构](#部署架构)
- [部署步骤](#部署步骤)
- [配置说明](#配置说明)
- [维护管理](#维护管理)
- [故障排查](#故障排查)

## 系统要求

### 硬件要求
- CPU: 1核心以上（推荐2核心）
- 内存: 1GB 以上（推荐2GB，Puppeteer 需要较多内存）
- 磁盘: 10GB 以上可用空间
- 网络: 稳定的互联网连接

### 软件要求
- 操作系统: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Node.js: 18.x 或更高版本
- Git: 用于克隆代码仓库
- Nginx: 反向代理服务器
- PM2: Node.js 进程管理器

## 部署架构

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
MarkdownX API (Port 3000)
    ↓
Puppeteer → Chromium
```

- **Nginx**: 反向代理，处理 SSL、静态文件服务
- **PM2**: 进程管理，自动重启、日志管理
- **MarkdownX API**: Express 应用，处理 Markdown 转换请求
- **Puppeteer**: 无头浏览器，渲染 HTML 为图片

## 部署步骤

### 1. 安装系统依赖

#### 1.1 更新系统包

```bash
sudo apt update
sudo apt upgrade -y
```

#### 1.2 安装 Node.js 18.x

```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应显示 v18.x.x
npm --version
```

#### 1.3 安装 Puppeteer 依赖

Puppeteer 需要 Chromium 及其系统依赖：

```bash
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

#### 1.4 安装 PM2

```bash
sudo npm install -g pm2
```

#### 1.5 安装 Nginx

```bash
sudo apt-get install -y nginx
```

### 2. 部署项目代码

#### 2.1 创建部署目录

```bash
sudo mkdir -p /var/www
cd /var/www
```

#### 2.2 克隆项目

```bash
# 使用 HTTPS
sudo git clone https://github.com/your-username/MarkdownX.git

# 或使用 SSH（需要配置 SSH 密钥）
# sudo git clone git@github.com:your-username/MarkdownX.git

cd MarkdownX
```

#### 2.3 设置权限

```bash
# 将项目所有权转移给当前用户
sudo chown -R $USER:$USER /var/www/MarkdownX
```

#### 2.4 安装依赖

```bash
npm install --production
```

这将安装所有生产环境依赖，包括 Puppeteer（会自动下载 Chromium）。

### 3. 配置环境变量

#### 3.1 创建 .env 文件

```bash
cp .env.example .env
nano .env  # 或使用 vim
```

#### 3.2 编辑配置

```env
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

根据实际需求调整配置。

### 4. 创建必要目录

```bash
mkdir -p logs
mkdir -p server/outputs/uploads
```

### 5. 启动应用（使用 PM2）

#### 5.1 启动服务

```bash
pm2 start ecosystem.config.js
```

#### 5.2 查看状态

```bash
pm2 status
pm2 logs markdownx-api
```

#### 5.3 设置开机自启

```bash
pm2 save
pm2 startup
```

执行 `pm2 startup` 后，会输出一条命令，复制并执行该命令以设置开机自启。

### 6. 配置 Nginx

#### 6.1 复制配置文件

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/markdownx
```

#### 6.2 编辑配置

```bash
sudo nano /etc/nginx/sites-available/markdownx
```

修改以下内容：
- `server_name`: 替换为你的域名或服务器 IP
- `/var/www/MarkdownX/server/outputs/`: 确认路径正确

#### 6.3 启用站点

```bash
sudo ln -s /etc/nginx/sites-available/markdownx /etc/nginx/sites-enabled/
```

#### 6.4 测试配置

```bash
sudo nginx -t
```

如果显示 "syntax is ok" 和 "test is successful"，则配置正确。

#### 6.5 重启 Nginx

```bash
sudo systemctl reload nginx
```

### 7. 配置防火墙

#### 7.1 允许 HTTP/HTTPS 流量

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### 7.2 启用防火墙（如果尚未启用）

```bash
sudo ufw enable
sudo ufw status
```

### 8. 验证部署

#### 8.1 健康检查

```bash
curl http://your-server-ip/health
```

应返回：
```json
{"status":"ok","message":"Markdown Snapper MCP服务运行正常"}
```

#### 8.2 测试 API

```bash
curl -X POST http://your-server-ip/api/generate-from-text \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 测试标题\n\n这是一个测试段落。\n\n```javascript\nconsole.log(\"Hello World\");\n```",
    "theme": "notion",
    "format": "png"
  }'
```

应返回包含图片路径的 JSON 响应。

#### 8.3 访问生成的图片

从上一步的响应中获取 `url` 字段，在浏览器中访问该 URL，应能看到生成的图片。

## 配置说明

### PM2 配置 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'markdownx-api',           // 应用名称
    script: './server/index.js',     // 启动脚本
    instances: 1,                    // 实例数量（单实例）
    exec_mode: 'fork',               // 执行模式
    env: {
      NODE_ENV: 'production',        // 环境变量
      PORT: 3000
    },
    error_file: './logs/err.log',    // 错误日志
    out_file: './logs/out.log',      // 输出日志
    max_restarts: 10,                // 最大重启次数
    min_uptime: '10s',               // 最小运行时间
    max_memory_restart: '500M'       // 内存限制
  }]
};
```

### Nginx 配置要点

- **client_max_body_size**: 限制上传文件大小（默认 10M）
- **proxy_read_timeout**: Puppeteer 渲染超时时间（默认 60s）
- **expires**: 静态文件缓存时间（默认 7 天）

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务监听端口 | 3000 |
| NODE_ENV | 运行环境 | production |
| MAX_FILE_SIZE | 最大上传文件大小（字节） | 10485760 (10MB) |

## 维护管理

### PM2 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs markdownx-api

# 重启应用
pm2 restart markdownx-api

# 停止应用
pm2 stop markdownx-api

# 删除应用
pm2 delete markdownx-api

# 监控应用
pm2 monit
```

### 更新代码

```bash
cd /var/www/MarkdownX

# 拉取最新代码
git pull origin main

# 安装新依赖（如果有）
npm install --production

# 重启应用
pm2 restart markdownx-api
```

### 清理旧文件

生成的图片会累积在 `server/outputs/` 目录，建议定期清理：

```bash
# 删除 7 天前的图片
find /var/www/MarkdownX/server/outputs -name "*.png" -mtime +7 -delete
find /var/www/MarkdownX/server/outputs -name "*.jpg" -mtime +7 -delete
```

可以设置 cron 任务自动清理：

```bash
crontab -e
```

添加：
```
0 2 * * * find /var/www/MarkdownX/server/outputs -name "*.png" -mtime +7 -delete
0 2 * * * find /var/www/MarkdownX/server/outputs -name "*.jpg" -mtime +7 -delete
```

### 日志管理

PM2 日志会持续增长，建议配置日志轮转：

```bash
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 故障排查

### 问题 1: Puppeteer 启动失败

**错误信息**:
```
Error: Failed to launch the browser process!
```

**解决方案**:
1. 确认已安装所有 Puppeteer 依赖（见步骤 1.3）
2. 检查是否有足够内存（至少 1GB）
3. 尝试使用系统 Chromium：

```bash
# 安装系统 Chromium
sudo apt-get install chromium-browser

# 在 .env 中配置
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 问题 2: 端口被占用

**错误信息**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
1. 查找占用端口的进程：
```bash
sudo lsof -i :3000
```

2. 杀死进程或更改端口：
```bash
# 杀死进程
sudo kill -9 <PID>

# 或在 .env 中更改端口
PORT=3001
```

### 问题 3: Nginx 502 Bad Gateway

**可能原因**:
- Node.js 应用未启动
- 端口配置错误
- 防火墙阻止

**解决方案**:
1. 检查应用状态：
```bash
pm2 status
pm2 logs markdownx-api
```

2. 检查端口监听：
```bash
sudo netstat -tlnp | grep 3000
```

3. 检查 Nginx 配置：
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/markdownx_error.log
```

### 问题 4: 图片无法访问

**可能原因**:
- 文件权限问题
- Nginx 配置路径错误

**解决方案**:
1. 检查文件权限：
```bash
ls -la /var/www/MarkdownX/server/outputs/
```

2. 确保 Nginx 有读取权限：
```bash
sudo chmod 755 /var/www/MarkdownX/server/outputs/
sudo chmod 644 /var/www/MarkdownX/server/outputs/*.png
```

3. 检查 Nginx 配置中的 `alias` 路径是否正确。

### 问题 5: 内存不足

**症状**:
- 应用频繁重启
- Puppeteer 渲染失败

**解决方案**:
1. 增加服务器内存（推荐至少 2GB）
2. 配置 swap 空间：

```bash
# 创建 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

3. 限制 PM2 内存使用（已在 ecosystem.config.js 中配置）。

### 查看系统资源

```bash
# CPU 和内存使用
htop

# 磁盘使用
df -h

# 应用资源使用
pm2 monit
```

## HTTPS 配置（可选）

### 使用 Let's Encrypt 免费证书

#### 1. 安装 Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
```

#### 2. 获取证书

```bash
sudo certbot --nginx -d your-domain.com
```

按提示操作，Certbot 会自动配置 Nginx。

#### 3. 自动续期

Let's Encrypt 证书有效期 90 天，设置自动续期：

```bash
sudo certbot renew --dry-run
```

Certbot 会自动添加 cron 任务进行续期。

## 监控和告警（可选）

### 使用 PM2 Plus

PM2 Plus 提供实时监控和告警功能：

```bash
pm2 link <secret_key> <public_key>
```

访问 https://app.pm2.io 注册并获取密钥。

### 使用 Uptime Robot

免费的外部监控服务，可监控服务可用性：
https://uptimerobot.com

## 性能优化建议

1. **启用 Gzip 压缩**（Nginx）
2. **配置 CDN**（如 Cloudflare）加速图片访问
3. **增加 PM2 实例数**（如果服务器有多核 CPU）
4. **使用 Redis 缓存**（缓存常用 Markdown 转换结果）
5. **定期清理旧文件**（避免磁盘占满）

## 安全建议

1. **配置防火墙**（只开放必要端口）
2. **启用 HTTPS**（保护数据传输）
3. **限制上传文件大小**（防止滥用）
4. **配置 rate limiting**（防止 DDoS）
5. **定期更新系统和依赖**（修复安全漏洞）
6. **使用非 root 用户运行应用**
7. **配置 fail2ban**（防止暴力破解）

## 支持

如遇到问题，请：
1. 查看应用日志：`pm2 logs markdownx-api`
2. 查看 Nginx 日志：`sudo tail -f /var/log/nginx/markdownx_error.log`
3. 提交 Issue 到项目仓库

## 许可证

MIT License
