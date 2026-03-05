const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { generateImage } = require('./generateImage');

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 静态文件服务
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'outputs', 'uploads'));
  },
  filename: function (req, file, cb) {
    // 确保文件名唯一
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 创建上传目录（如果不存在）
const uploadDir = path.join(__dirname, 'outputs', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ storage: storage });

// API路由
app.use('/api', require('./api/routes'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Markdown Snapper MCP服务运行正常' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Markdown Snapper MCP服务器运行在 http://localhost:${port}`);
  console.log(`健康检查: http://localhost:${port}/health`);
  console.log(`API文档: http://localhost:${port}/api/docs`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});
