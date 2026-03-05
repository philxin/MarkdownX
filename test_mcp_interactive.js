#!/usr/bin/env node

/**
 * MCP 服务器交互式测试脚本
 */

const { spawn } = require('child_process');
const path = require('path');

// 启动 MCP 服务器
const serverPath = path.join(__dirname, 'server', 'mcp_server.js');
const mcpServer = spawn('node', [serverPath], {
  cwd: path.join(__dirname, 'server')
});

let messageId = 1;

// 发送 JSON-RPC 请求
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: messageId++,
    method,
    params
  };
  console.log('\n📤 发送请求:', JSON.stringify(request, null, 2));
  mcpServer.stdin.write(JSON.stringify(request) + '\n');
  return request.id;
}

// 监听服务器响应
mcpServer.stdout.on('data', (data) => {
  const responses = data.toString().split('\n').filter(line => line.trim());
  responses.forEach(response => {
    try {
      const parsed = JSON.parse(response);
      console.log('\n📥 收到响应:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('\n📥 原始输出:', response);
    }
  });
});

// 监听错误输出
mcpServer.stderr.on('data', (data) => {
  console.log('🔴 服务器错误:', data.toString().trim());
});

// 等待服务器启动
setTimeout(() => {
  console.log('🚀 开始测试 MCP 服务器...\n');

  // 1. 测试初始化
  sendRequest('initialize', {});

  // 2. 等待一段时间后获取工具列表
  setTimeout(() => {
    sendRequest('tools/list', {});

    // 3. 等待一段时间后测试 markdown-to-image 工具
    setTimeout(() => {
      sendRequest('tools/call', {
        name: 'markdown-to-image',
        arguments: {
          markdown: '# Hello MarkdownX\n\n这是一个测试文档。\n\n## 功能特性\n\n- 支持 Markdown 语法\n- 转换为精美图片\n- 多种主题风格',
          theme: 'notion',
          format: 'png',
          width: 800,
          height: 600,
          quality: 90
        }
      });

      // 4. 等待完成后关闭服务器
      setTimeout(() => {
        console.log('\n✅ 测试完成，正在关闭服务器...');
        mcpServer.kill();
      }, 5000);

    }, 2000);

  }, 2000);

}, 1000);

// 处理进程退出
mcpServer.on('close', (code) => {
  console.log(`\n🔚 服务器进程退出，代码: ${code}`);
  process.exit(code);
});
