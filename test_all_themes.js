const fs = require('fs');
const path = require('path');

// 导入生成图片的模块
const { generateImage } = require('./server/generateImage');

// 所有主题列表
const themes = ['notion', 'terminal', 'paper', 'memo', 'card', 'dark', 'minimal'];

async function testAllThemes() {
  try {
    // 读取 example.md 文件
    const markdownPath = path.join(__dirname, 'examples', 'example.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

    console.log('开始测试所有主题...\n');
    console.log('========================================\n');

    // 为每个主题生成图片
    for (const theme of themes) {
      console.log(`正在生成 ${theme} 主题的图片...`);

      const result = await generateImage(markdownContent, {
        theme: theme,
        format: 'png'
      });

      console.log(`✅ ${theme} 主题生成成功！`);
      console.log(`   文件: ${result.filename}`);
      console.log(`   路径: ${result.absolutePath}`);
      console.log(`   URL: http://localhost:3000${result.url}\n`);
    }

    console.log('========================================');
    console.log('\n所有主题测试完成！');
    console.log(`共生成了 ${themes.length} 个主题的图片。`);

  } catch (error) {
    console.error('❌ 生成图片时出错:', error.message);
    console.error(error.stack);
  }
}

// 运行测试
testAllThemes();
