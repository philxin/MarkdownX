const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateImage } = require('../generateImage');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'outputs', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 只接受markdown文件
    if (file.mimetype === 'text/markdown' || 
        path.extname(file.originalname).toLowerCase() === '.md') {
      cb(null, true);
    } else {
      cb(new Error('只接受Markdown文件!'));
    }
  }
});

// API文档
router.get('/docs', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    api: {
      name: "Markdown Snapper MCP API",
      version: "1.0.0",
      baseUrl: baseUrl,
      description: "将Markdown文档转换为精美图片的API",
      endpoints: [
        {
          path: "/api/generate-image",
          method: "POST",
          description: "将Markdown文件转换为图片",
          contentType: "multipart/form-data",
          parameters: [
            {
              name: "markdown",
              type: "file",
              required: true,
              description: "Markdown文件"
            },
            {
              name: "theme",
              type: "string",
              required: false,
              default: "notion",
              description: "图片主题风格 (notion, terminal, paper)"
            },
            {
              name: "format",
              type: "string",
              required: false,
              default: "png",
              description: "输出图片格式 (png, jpeg)"
            },
            {
              name: "width",
              type: "number",
              required: false,
              default: 800,
              description: "图片宽度 (像素)"
            },
            {
              name: "height",
              type: "number",
              required: false,
              default: 600,
              description: "图片高度 (像素)"
            }
          ],
          response: {
            success: {
              message: "图片生成成功!",
              data: {
                filename: "output-1633039813022.png",
                url: "/outputs/output-1633039813022.png",
                absolutePath: "D:\\MarkdownX\\server\\outputs\\output-1633039813022.png",
                relativePath: "outputs\\output-1633039813022.png"
              }
            },
            error: {
              success: false,
              error: "错误信息"
            }
          }
        },
        {
          path: "/api/generate-from-text",
          method: "POST",
          description: "直接将Markdown文本转换为图片",
          contentType: "application/json",
          parameters: [
            {
              name: "markdown",
              type: "string",
              required: true,
              description: "Markdown文本内容"
            },
            {
              name: "theme",
              type: "string",
              required: false,
              default: "notion",
              description: "图片主题风格 (notion, terminal, paper)"
            },
            {
              name: "format",
              type: "string",
              required: false,
              default: "png",
              description: "输出图片格式 (png, jpeg)"
            },
            {
              name: "width",
              type: "number",
              required: false,
              default: 800,
              description: "图片宽度 (像素)"
            },
            {
              name: "height",
              type: "number",
              required: false,
              default: 600,
              description: "图片高度 (像素)"
            },
            {
              name: "quality",
              type: "number",
              required: false,
              default: 90,
              description: "JPEG 质量 (1-100, 仅用于 JPEG 格式)"
            }
          ],
          response: {
            success: {
              message: "图片生成成功!",
              data: {
                filename: "output-1633039813022.png",
                url: "/outputs/output-1633039813022.png",
                absolutePath: "D:\\MarkdownX\\server\\outputs\\output-1633039813022.png",
                relativePath: "outputs\\output-1633039813022.png"
              }
            },
            error: {
              success: false,
              error: "错误信息"
            }
          }
        }
      ],
      examples: {
        curl: `curl -X POST ${baseUrl}/api/generate-from-text \\
  -H "Content-Type: application/json" \\
  -d '{"markdown":"# Hello World\\n\\n这是**粗体**文本","theme":"notion"}'`,
        browserUrl: `${baseUrl}/outputs/output-xxx.png`
      }
    }
  });
});

// 生成图片API
router.post('/generate-image', upload.single('markdown'), async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: '请提供Markdown文件' });
    }

    // 保存上传文件路径用于清理
    uploadedFilePath = req.file.path;

    // 读取上传的Markdown文件
    const markdownContent = fs.readFileSync(uploadedFilePath, 'utf-8');

    // 获取请求参数
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const options = {
      theme: req.body.theme || 'notion',
      format: req.body.format || 'png',
      width: parseInt(req.body.width) || 800,
      height: parseInt(req.body.height) || 600,
      quality: parseInt(req.body.quality) || 90,
      baseUrl: baseUrl
    };

    // 生成图片
    const result = await generateImage(markdownContent, options);

    // 返回图片信息
    res.status(200).json({
      success: true,
      message: '图片生成成功!',
      data: {
        filename: result.filename,
        url: result.url,
        absolutePath: result.absolutePath,
        relativePath: result.relativePath
      }
    });
  } catch (error) {
    console.error('生成图片时出错:', error);
    res.status(500).json({
      success: false,
      error: `生成图片时出错: ${error.message}`
    });
  } finally {
    // 确保删除临时上传的文件
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (err) {
        console.error('删除临时文件失败:', err);
      }
    }
  }
});

// 直接从文本生成图片API
router.post('/generate-from-text', express.json(), async (req, res) => {
  try {
    if (!req.body.markdown) {
      return res.status(400).json({ error: '请提供Markdown文本' });
    }

    // 获取请求参数
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const options = {
      theme: req.body.theme || 'notion',
      format: req.body.format || 'png',
      width: parseInt(req.body.width) || 800,
      height: parseInt(req.body.height) || 600,
      quality: parseInt(req.body.quality) || 90,
      baseUrl: baseUrl
    };

    // 生成图片
    const result = await generateImage(req.body.markdown, options);

    // 返回图片信息
    res.status(200).json({
      success: true,
      message: '图片生成成功!',
      data: {
        filename: result.filename,
        url: result.url,
        absolutePath: result.absolutePath,
        relativePath: result.relativePath
      }
    });
  } catch (error) {
    console.error('生成图片时出错:', error);
    res.status(500).json({
      success: false,
      error: `生成图片时出错: ${error.message}`
    });
  }
});

// 获取生成的图片列表
router.get('/images', (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const outputsDir = path.join(__dirname, '..', 'outputs');
    const files = fs.readdirSync(outputsDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
      })
      .map(file => {
        const filePath = path.join(outputsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `${baseUrl}/outputs/${file}`,
          relativeUrl: `/outputs/${file}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created); // 按创建时间倒序

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `获取图片列表失败: ${error.message}`
    });
  }
});

// 删除指定的图片
router.delete('/images/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'outputs', filename);

    // 安全检查：确保文件在 outputs 目录内
    const resolvedPath = path.resolve(filePath);
    const outputsDir = path.resolve(__dirname, '..', 'outputs');
    if (!resolvedPath.startsWith(outputsDir)) {
      return res.status(403).json({
        success: false,
        error: '非法的文件路径'
      });
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    // 删除文件
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `文件 ${filename} 已删除`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `删除文件失败: ${error.message}`
    });
  }
});

// 清理所有生成的图片
router.delete('/images', (req, res) => {
  try {
    const outputsDir = path.join(__dirname, '..', 'outputs');
    const files = fs.readdirSync(outputsDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
      });

    let deletedCount = 0;
    files.forEach(file => {
      const filePath = path.join(outputsDir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (err) {
        console.error(`删除文件 ${file} 失败:`, err);
      }
    });

    res.json({
      success: true,
      message: `已清理 ${deletedCount} 个图片文件`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `清理图片失败: ${error.message}`
    });
  }
});

module.exports = router;
