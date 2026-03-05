const fs = require('fs');
const path = require('path');

// 导入生成图片的模块
const { generateImage } = require('./server/generateImage');

async function testGenerate() {
  try {
    // 读取 example.md 文件
    const markdownPath = path.join(__dirname, 'examples', 'example.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

    console.log('正在生成图片...');
    console.log('Markdown 内容预览:');
    console.log(markdownContent.substring(0, 100) + '...\n');

    // 生成图片（使用默认的 notion 主题）
    const result = await generateImage(markdownContent, {
      theme: 'minimal',
      format: 'png'
    });

    console.log('✅ 图片生成成功！');
    console.log('文件名:', result.filename);
    console.log('相对路径:', result.relativePath);
    console.log('绝对路径:', result.absolutePath);
    console.log('访问 URL:', `http://localhost:3000${result.url}`);

    // 检查文件是否存在
    if (fs.existsSync(result.absolutePath)) {
      const stats = fs.statSync(result.absolutePath);
      console.log('\n文件大小:', (stats.size / 1024).toFixed(2), 'KB');
      console.log('\n请查看生成的图片，确认中文是否正常显示。');
    } else {
      console.log('\n⚠️ 警告: 文件未找到');
    }

  } catch (error) {
    console.error('❌ 生成图片时出错:', error.message);
    console.error(error.stack);
  }
}

// 运行测试
testGenerate();
