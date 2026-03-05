#!/usr/bin/env node

/**
 * Markdown Snapper MCP 服务器
 * 遵循 Model Context Protocol (MCP) 的 stdio 访问方式
 * 将 Markdown 文档转换为本地绝对路径下的图片
 */

const fs = require('fs');
const path = require('path');
const { generateImage } = require('./generateImage');

/**
 * 读取本地 MCP 配置文件以获取工具定义
 */
const mcpConfigPath = path.join(__dirname, 'mcp.json');
let mcpConfig;
try {
  mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
} catch (error) {
  process.stderr.write(`无法加载配置文件 ${mcpConfigPath}: ${error.message}\n`);
  process.exit(1);
}

/**
 * 向 stdout 发送 JSON-RPC 消息
 */
function sendMessage(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
}

/**
 * 发送 JSON-RPC 成功响应
 */
function sendResponse(id, result) {
  sendMessage({
    jsonrpc: "2.0",
    id,
    result
  });
}

/**
 * 发送 JSON-RPC 错误响应
 */
function sendError(id, code, message, data) {
  sendMessage({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data ? { data } : {})
    }
  });
}

/**
 * 处理 JSON-RPC 请求
 */
async function handleRequest(request) {
  const { jsonrpc, method, params, id } = request;

  // 校验协议版本
  if (jsonrpc !== "2.0") {
    return sendError(id || null, -32600, "Invalid JSON-RPC version");
  }

  // 根据方法路由请求
  switch (method) {
    case 'initialize':
      return sendResponse(id, {
        protocolVersion: "2024-11-05", // 目前使用的主要 MCP 协议版本
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: mcpConfig.name || "markdown-snapper-mcp",
          version: mcpConfig.version || "1.0.0"
        }
      });

    case 'tools/list':
      return sendResponse(id, {
        tools: mcpConfig.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.input_schema // 协议要求使用 inputSchema 而不是 input_schema
        }))
      });

    case 'tools/call':
      if (!params || !params.name) {
        return sendError(id, -32602, "Missing tool name");
      }

      if (params.name === 'markdown-to-image') {
        const { markdown, ...options } = params.arguments || {};

        if (!markdown) {
          return sendError(id, -32602, "Missing 'markdown' argument");
        }

        try {
          const result = await generateImage(markdown, options);
          return sendResponse(id, {
            content: [
              {
                type: "text",
                text: `✅ 图片已成功生成！\n\n文件名：${result.filename}\n本地路径：${result.absolutePath}\n访问URL：${result.url}`
              }
            ],
            isError: false
          });
        } catch (error) {
          process.stderr.write(`生成图片失败: ${error.stack}\n`);
          return sendError(id, -32000, `图片生成失败: ${error.message}`);
        }
      }
      return sendError(id, -32601, `Tool not found: ${params.name}`);

    case 'notifications/initialized':
      // 初始化确认，无需返回结果
      return;

    case 'ping':
      return sendResponse(id, "pong");

    default:
      if (id !== undefined) {
        return sendError(id, -32601, `Method not found: ${method}`);
      }
  }
}

// 逐行解析 stdin (MCP 协议通常每行一个 JSON)
let buffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  let lines = buffer.split(/\r?\n/);
  buffer = lines.pop(); // 剩下的可能是半行

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      try {
        const request = JSON.parse(trimmed);
        await handleRequest(request);
      } catch (e) {
        process.stderr.write(`解析 JSON 失败: ${trimmed}\n`);
        sendError(null, -32700, "Parse error");
      }
    }
  }
});

process.stdin.on('error', (err) => {
  process.stderr.write(`Stdin error: ${err.message}\n`);
});

process.on('uncaughtException', (err) => {
  process.stderr.write(`UncaughtException: ${err.stack}\n`);
});

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`UnhandledRejection: ${reason}\n`);
});

// 打印就绪信息到 stderr (避免干扰 stdout 的 JSON-RPC 协议)
process.stderr.write("Markdown Snapper MCP 运行中 (stdio 模式)...\n");
