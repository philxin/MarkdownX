/**
 * MCP 工具注册脚本
 * 用于将 Markdown Snapper 注册到 MCP 工具目录
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 读取 MCP 配置
const mcpConfig = require('./mcp.json');

// MCP 注册服务器配置
const MCP_REGISTRY_URL = process.env.MCP_REGISTRY_URL || 'https://mcp-registry.example.com';
const MCP_API_KEY = process.env.MCP_API_KEY || 'your-mcp-api-key';
const LOCAL_SERVER_URL = process.env.LOCAL_SERVER_URL || 'http://localhost:3000';

/**
 * 向 MCP 注册表注册工具
 */
async function registerMcpTool() {
  // 构建注册数据
  const registrationData = {
    name: mcpConfig.name,
    version: mcpConfig.version,
    description: mcpConfig.description,
    baseUrl: LOCAL_SERVER_URL,
    tools: mcpConfig.tools,
    endpoints: mcpConfig.endpoints,
    metadata_endpoint: mcpConfig.metadata_endpoint
  };

  console.log('准备注册 MCP 工具:', registrationData.name);
  
  // 本地模式：仅生成本地配置文件，不发送注册请求
  if (process.env.LOCAL_ONLY === '1') {
    const localConfigPath = path.join(__dirname, 'mcp_local_test.json');
    fs.writeFileSync(localConfigPath, JSON.stringify(registrationData, null, 2));
    console.log(`本地测试配置已生成: ${localConfigPath}`);
    resolve({ local: true, path: localConfigPath });
    return;
  }
  // 发送注册请求
  return new Promise((resolve, reject) => {
    const requestOptions = new URL(`${MCP_REGISTRY_URL}/register`);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_API_KEY}`
      }
    };
    
    // 选择 http 或 https 模块
    const requestModule = requestOptions.protocol === 'https:' ? https : http;
    
    const req = requestModule.request(requestOptions, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const responseData = JSON.parse(data);
            console.log('MCP 工具注册成功:', responseData);
            resolve(responseData);
          } catch (error) {
            console.error('解析响应失败:', error);
            reject(new Error('解析响应失败'));
          }
        } else {
          console.error('注册失败:', res.statusCode, data);
          reject(new Error(`注册失败: ${res.statusCode} ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('请求错误:', error);
      reject(error);
    });
    
    req.write(JSON.stringify(registrationData));
    req.end();
  });
}

/**
 * 验证 MCP 配置
 */
function validateMcpConfig() {
  console.log('验证 MCP 配置...');
  
  // 检查必要的字段
  const requiredFields = ['name', 'version', 'description', 'tools', 'endpoints', 'metadata_endpoint'];
  for (const field of requiredFields) {
    if (!mcpConfig[field]) {
      throw new Error(`MCP 配置缺少必要字段: ${field}`);
    }
  }
  
  // 检查工具配置
  if (!Array.isArray(mcpConfig.tools) || mcpConfig.tools.length === 0) {
    throw new Error('MCP 配置必须包含至少一个工具');
  }
  
  // 检查每个工具的配置
  for (const tool of mcpConfig.tools) {
    if (!tool.name || !tool.description || !tool.input_schema || !tool.output_schema) {
      throw new Error(`工具配置不完整: ${tool.name || '未命名工具'}`);
    }
  }
  
  // 检查端点配置
  for (const tool of mcpConfig.tools) {
    if (!mcpConfig.endpoints[tool.name]) {
      throw new Error(`缺少工具的端点配置: ${tool.name}`);
    }
  }
  
  console.log('MCP 配置验证通过');
  return true;
}

/**
 * 主函数
 */
async function main() {
  try {
    // 验证配置
    validateMcpConfig();
    // 本地模式：仅生成本地配置文件，不发送注册请求
    if (process.env.LOCAL_ONLY === '1') {
      const mcpConfig = require('./mcp.json');
      const registrationData = {
        name: mcpConfig.name,
        version: mcpConfig.version,
        description: mcpConfig.description,
        baseUrl: process.env.LOCAL_SERVER_URL || 'http://localhost:4000',
        tools: mcpConfig.tools,
        endpoints: mcpConfig.endpoints,
        metadata_endpoint: mcpConfig.metadata_endpoint
      };
      const localConfigPath = path.join(__dirname, 'mcp_local_test.json');
      fs.writeFileSync(localConfigPath, JSON.stringify(registrationData, null, 2));
      console.log(`本地测试配置已生成: ${localConfigPath}`);
      console.log('本地注册完成，无需远程注册。');
      return;
    }
    // 注册工具
    await registerMcpTool();
    console.log('MCP 工具注册过程完成');
  } catch (error) {
    console.error('MCP 工具注册失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  registerMcpTool,
  validateMcpConfig
};
