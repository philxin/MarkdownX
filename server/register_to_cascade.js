/**
 * Cascade MCP 工具注册脚本
 * 用于将 Markdown Snapper 注册到 Cascade AI 助手的 MCP 工具目录
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 读取 MCP 配置
const mcpConfig = require('./mcp.json');

// Cascade MCP 注册配置
const CASCADE_REGISTRY_URL = process.env.CASCADE_REGISTRY_URL || 'https://api.cascade.ai/mcp/register';
const CASCADE_API_KEY = process.env.CASCADE_API_KEY;
const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL; // 必须是公网可访问的URL

// 检查必要的环境变量
if (!CASCADE_API_KEY) {
  console.error('错误: 缺少 CASCADE_API_KEY 环境变量');
  console.error('请设置环境变量: CASCADE_API_KEY=your-api-key');
  process.exit(1);
}

if (!PUBLIC_SERVER_URL) {
  console.error('错误: 缺少 PUBLIC_SERVER_URL 环境变量');
  console.error('请设置环境变量: PUBLIC_SERVER_URL=https://your-public-server.com');
  console.error('注意: 该URL必须是公网可访问的，Cascade AI 需要能够访问到您的服务');
  process.exit(1);
}

/**
 * 向 Cascade MCP 注册表注册工具
 */
async function registerToCascade() {
  // 构建 Cascade 格式的注册数据
  const registrationData = {
    tool_name: mcpConfig.name,
    version: mcpConfig.version,
    description: mcpConfig.description,
    base_url: PUBLIC_SERVER_URL,
    tools: mcpConfig.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
      output_schema: tool.output_schema
    })),
    endpoints: Object.entries(mcpConfig.endpoints).map(([name, path]) => ({
      tool_name: name,
      path: path
    })),
    metadata_endpoint: mcpConfig.metadata_endpoint,
    auth_type: "none" // 可选: "none", "api_key", "oauth"
  };

  console.log('准备注册工具到 Cascade AI:', registrationData.tool_name);
  
  // 发送注册请求
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(CASCADE_REGISTRY_URL);
    
    const options = {
      hostname: requestUrl.hostname,
      port: requestUrl.port || (requestUrl.protocol === 'https:' ? 443 : 80),
      path: requestUrl.pathname + requestUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CASCADE_API_KEY}`,
        'X-Cascade-Client': 'markdown-snapper-mcp'
      }
    };
    
    // 选择 http 或 https 模块
    const requestModule = requestUrl.protocol === 'https:' ? https : http;
    
    const req = requestModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const responseData = JSON.parse(data);
            console.log('工具成功注册到 Cascade AI:', responseData);
            console.log('\n现在您可以在 Cascade AI 中使用以下命令调用您的工具:');
            console.log(`/tool ${mcpConfig.name} ${mcpConfig.tools[0].name} [参数]\n`);
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
 * 生成本地测试配置
 */
function generateLocalTestConfig() {
  const localConfigPath = path.join(__dirname, 'cascade_local_test.json');
  
  const localConfig = {
    tool_definition: {
      schema_version: "v1",
      name: mcpConfig.name,
      description: mcpConfig.description,
      tools: mcpConfig.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema,
        output_schema: tool.output_schema
      }))
    },
    server_config: {
      base_url: "http://localhost:3000",
      endpoints: mcpConfig.endpoints,
      metadata_endpoint: mcpConfig.metadata_endpoint
    }
  };
  
  fs.writeFileSync(localConfigPath, JSON.stringify(localConfig, null, 2));
  console.log(`本地测试配置已生成: ${localConfigPath}`);
  console.log('您可以使用此配置在本地测试您的 MCP 工具');
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('===== Cascade AI MCP 工具注册 =====');
    
    // 生成本地测试配置
    generateLocalTestConfig();
    
    // 检查是否要跳过注册
    if (process.argv.includes('--local-only')) {
      console.log('仅生成本地配置，跳过注册');
      return;
    }
    
    // 注册工具到 Cascade
    await registerToCascade();
    
    console.log('\n注册过程完成！您的工具现在可以在 Cascade AI 中使用了。');
  } catch (error) {
    console.error('工具注册失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  registerToCascade,
  generateLocalTestConfig
};
