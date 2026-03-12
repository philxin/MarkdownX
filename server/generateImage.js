const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const hljs = require('highlight.js');

/**
 * 将Markdown转换为HTML（带语法高亮）
 * @param {string} markdownContent - Markdown内容
 * @returns {string} - 转换后的HTML内容
 */
function convertMarkdownToHtml(markdownContent) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return '';
    }
  });
  return md.render(markdownContent);
}

/**
 * 根据主题获取模板
 * @param {string} theme - 主题名称
 * @returns {string} - 模板路径
 */
function getTemplateByTheme(theme) {
  const validThemes = ['notion', 'terminal', 'paper', 'memo', 'card', 'dark', 'minimal'];
  const themeName = validThemes.includes(theme) ? theme : 'notion';
  return path.join(__dirname, 'templates', `${themeName}.ejs`);
}

/**
 * 生成图片
 * @param {string} markdownContent - Markdown内容
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} - 生成的图片URL
 */
async function generateImage(markdownContent, options = {}) {
  const {
    theme = 'notion',
    format = 'png',
    width = 800,
    height = 600,
    quality = 90,
    baseUrl = ''  // 新增：服务器基础URL
  } = options;

  // 转换Markdown为HTML
  const htmlContent = convertMarkdownToHtml(markdownContent);

  // 获取模板
  const templatePath = getTemplateByTheme(theme);

  // 读取并渲染模板 (使用EJS以正确处理 <%- content %>)
  const template = fs.readFileSync(templatePath, 'utf-8');
  const renderedHtml = ejs.render(template, { content: htmlContent });

  // 确保输出目录存在
  const outputsDir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
  }

  // 创建临时HTML文件
  const tempHtmlPath = path.join(outputsDir, `temp-${uuidv4()}.html`);
  fs.writeFileSync(tempHtmlPath, renderedHtml, 'utf-8');

  // 生成图片文件名
  const outputFilename = `output-${Date.now()}.${format}`;
  const outputPath = path.join(outputsDir, outputFilename);

  // 使用Puppeteer生成图片
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // 打开临时HTML文件
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

    // 等待内容渲染完成
    await page.waitForSelector('.markdown-body', { timeout: 5000 });

    // 获取内容元素的尺寸
    const contentElement = await page.$('.markdown-body');
    const boundingBox = await contentElement.boundingBox();

    // 截图
    await page.screenshot({
      path: outputPath,
      type: format,
      quality: format === 'jpeg' ? quality : undefined,
      clip: {
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height
      }
    });

    // 清理临时文件
    fs.unlinkSync(tempHtmlPath);

    // 返回相对路径（用于URL）和绝对路径
    const relativeUrl = `/outputs/${outputFilename}`;
    return {
      filename: outputFilename,
      relativePath: path.join('outputs', outputFilename),
      absolutePath: path.resolve(outputPath),
      url: baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl,  // 如果有baseUrl则返回完整URL
      relativeUrl: relativeUrl  // 始终保留相对URL
    };
  } finally {
    await browser.close();
  }
}

module.exports = {
  generateImage,
  convertMarkdownToHtml
};
