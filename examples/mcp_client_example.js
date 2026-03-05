// MCP 客户端示例 - 调用 Markdown Snapper MCP 服务
const fetch = require('node-fetch');

// MCP 服务器地址
const MCP_SERVER_URL = 'http://localhost:3000';

// 示例 Markdown 内容
const markdownContent = `
# Markdown Snapper 测试

这是一个通过 **MCP 协议** 调用 Markdown Snapper 服务的示例。

## 功能特点

* 将 Markdown 转换为精美图片
* 支持多种主题风格
* 简单易用的 API 接口

> 这是引用文本

\`\`\`javascript
// 代码示例
console.log('Hello, Markdown Snapper!');
\`\`\`
`;

/**
 * 调用 MCP 服务将 Markdown 转换为图片
 * @param {string} markdown - Markdown 文本
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} - 返回结果
 */
async function convertMarkdownToImage(markdown, options = {}) {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp/markdown-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown,
        ...options
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 错误: ${errorData.error?.message || '未知错误'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('调用 MCP 服务失败:', error);
    throw error;
  }
}

/**
 * 获取 MCP 服务元数据
 * @returns {Promise<Object>} - 返回元数据
 */
async function getMcpMetadata() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp/metadata`);
    
    if (!response.ok) {
      throw new Error(`获取元数据失败: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取 MCP 元数据失败:', error);
    throw error;
  }
}

// 示例 1: 使用默认设置生成图片
async function example1() {
  console.log('示例 1: 使用默认设置生成图片');
  try {
    const result = await convertMarkdownToImage(markdownContent);
    console.log('生成的图片 URL:', result.imageUrl);
  } catch (error) {
    console.error('示例 1 失败:', error);
  }
}

// 示例 2: 使用 terminal 主题生成图片
async function example2() {
  console.log('示例 2: 使用 terminal 主题生成图片');
  try {
    const result = await convertMarkdownToImage(markdownContent, {
      theme: 'terminal',
      width: 1000,
      height: 800
    });
    console.log('生成的图片 URL:', result.imageUrl);
  } catch (error) {
    console.error('示例 2 失败:', error);
  }
}

// 示例 3: 获取 MCP 服务元数据
async function example3() {
  console.log('示例 3: 获取 MCP 服务元数据');
  try {
    const metadata = await getMcpMetadata();
    console.log('MCP 服务元数据:', JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('示例 3 失败:', error);
  }
}

// 运行示例
async function runExamples() {
  console.log('开始运行 MCP 客户端示例...');
  
  await example1();
  console.log('-'.repeat(50));
  
  await example2();
  console.log('-'.repeat(50));
  
  await example3();
  
  console.log('示例运行完成!');
}

// 执行示例
runExamples();
