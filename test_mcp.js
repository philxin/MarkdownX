const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, 'server', 'mcp_server.js');
const mcp = spawn('node', [serverPath]);

let output = '';
mcp.stdout.on('data', (data) => {
    output += data.toString();
    console.log('Server Stdout:', data.toString());
});

mcp.stderr.on('data', (data) => {
    console.log('Server Stderr:', data.toString());
});

mcp.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
});

// Send initialize request
const initReq = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
    }
};

setTimeout(() => {
    console.log('Sending initialize request...');
    mcp.stdin.write(JSON.stringify(initReq) + '\n');
}, 1000);

// Send list tools request
const listReq = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
};

setTimeout(() => {
    console.log('Sending tools/list request...');
    mcp.stdin.write(JSON.stringify(listReq) + '\n');
}, 2000);

// Kill after 5 seconds
setTimeout(() => {
    console.log('Test finished. Killing server...');
    mcp.kill();
    process.exit(0);
}, 5000);
