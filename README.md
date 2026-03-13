# MarkdownX

<div align="center">

MarkdownX 是一个强大的 Markdown 转图片服务，能够将 Markdown 文档转换成精美的图片格式。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-markdown--snapper--mcp-blue)](https://www.npmjs.com/package/markdown-snapper-mcp)

</div>

## ✨ 特性

- 🎨 **7种主题风格** - Notion、Terminal、Paper、Memo、Card、Dark、Minimal
- 📐 **自定义尺寸** - 灵活配置输出图片的宽度和高度
- 🖼️ **多格式支持** - 支持 PNG 和 JPEG 格式输出
- ⚡ **高性能渲染** - 基于 Puppeteer 的高性能渲染引擎
- 🛠️ **简单易用** - 提供简洁的 API 接口和 MCP 工具集成
- 🌍 **中文支持** - 完美支持中文和多种语言
- 🔧 **灵活配置** - 支持自定义图片质量和压缩选项

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/MarkdownX.git
cd MarkdownX

# 安装依赖
npm install
```

### 基本使用

1. **启动服务**

```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

2. **API 调用示例**

```javascript
const response = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    markdown: '# Hello MarkdownX\n\n这是一个测试示例。',
    theme: 'notion',
    width: 800,
    height: 600,
    format: 'png'
  }),
});

const result = await response.json();
console.log('生成的图片:', result.url);
```

3. **使用 MCP 工具**

本项目可作为 MCP (Model Context Protocol) 工具使用，详见 [MCP 配置示例](./mcp-config-example.json)。

## 📝 API 文档

### POST /api/generate

将 Markdown 文本转换为图片。

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| markdown | string | ✅ | - | Markdown 文本内容 |
| theme | string | ❌ | notion | 主题样式：`notion`, `terminal`, `paper`, `memo`, `card`, `dark`, `minimal` |
| format | string | ❌ | png | 输出格式：`png`, `jpeg` |
| width | number | ❌ | 800 | 图片宽度 (像素) |
| height | number | ❌ | 600 | 图片高度 (像素) |
| quality | number | ❌ | 90 | 图片质量 (1-100) |

#### 响应示例

```json
{
  "success": true,
  "url": "/outputs/image-123456.png",
  "filename": "image-123456.png",
  "absolutePath": "/path/to/outputs/image-123456.png"
}
```

### GET /health

健康检查端点。

#### 响应示例

```json
{
  "status": "ok",
  "message": "Markdown Snapper MCP服务运行正常"
}
```

## 🎨 主题预览

项目支持以下 7 种精美主题：

- **notion** - 经典 Notion 风格
- **terminal** - 终端代码风格
- **paper** - 纸质文档风格
- **memo** - 备忘录风格
- **card** - 卡片风格
- **dark** - 深色主题
- **minimal** - 极简主义风格

运行测试查看所有主题：

```bash
node test_all_themes.js
```

## 🛠️ 技术栈

- **Express.js** - Web 服务器框架
- **Puppeteer** - 无头浏览器渲染引擎
- **markdown-it** - 功能强大的 Markdown 解析器
- **EJS** - 模板引擎
- **Multer** - 文件上传处理

## 📁 项目结构

```
MarkdownX/
├── server/                 # 服务器端代码
│   ├── api/               # API 路由
│   ├── templates/         # HTML 模板
│   ├── generateImage.js   # 图片生成核心逻辑
│   ├── mcp_server.js      # MCP 服务器
│   └── index.js           # 服务入口
├── examples/              # 示例文件
├── test_*.js             # 测试脚本
├── package.json          # 项目配置
└── README.md             # 项目文档
```

## 🔧 配置

### MCP 配置

参考 `mcp-config-example.json` 文件配置 MCP 服务器：

```json
{
  "mcpServers": {
    "markdown-snapper": {
      "command": "node",
      "args": ["./server/mcp_server.js"]
    }
  }
}
```

### 端口配置

通过环境变量修改端口：

```bash
PORT=8080 npm start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

- **philxin** - *初始工作* - [philxin](https://github.com/philxin)

## 🙏 致谢

- [markdown-it](https://github.com/markdown-it/markdown-it) - 优秀的 Markdown 解析器
- [Puppeteer](https://github.com/puppeteer/puppeteer) - 强大的无头浏览器
- 所有贡献者

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️**

</div>
