#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔍 Direct MCP Server Test - Key Collection Detection');
console.log('=' .repeat(60));

// Read the API key from secrets file
let apiKey;
try {
  const secretsContent = readFileSync('secrets', 'utf8');
  const match = secretsContent.match(/OPENAI_API_KEY=(.+)/);
  apiKey = match ? match[1].trim() : null;
} catch (error) {
  console.error('Could not read secrets file:', error.message);
  process.exit(1);
}

if (!apiKey) {
  console.error('No OPENAI_API_KEY found in secrets file');
  process.exit(1);
}

console.log(`📋 Testing with API key: ${apiKey.substring(0, 20)}...`);
console.log('🎯 WATCH FOR KEY COLLECTION LOGS BELOW:');
console.log('-' .repeat(60));

// Start the server with stderr visible
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'] // inherit stderr so we see console.error output
});

// Initialize the server
const initMessage = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    clientInfo: { name: "direct-test", version: "1.0.0" }
  }
};

// Test message with the actual API key from secrets file
const testMessage = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "search_ai_docs",
    arguments: {
      query: "testing with secrets file API key",
      technology: "OpenAI API",
      openai_api_key: apiKey
    }
  }
};

server.stdout.on('data', (data) => {
  console.log('\n📨 Server Response:');
  console.log(data.toString());
});

server.on('error', (error) => {
  console.error('❌ Server Error:', error);
});

// Send messages
setTimeout(() => {
  server.stdin.write(JSON.stringify(initMessage) + '\n');
}, 100);

setTimeout(() => {
  console.log('\n📤 Sending test request with API key from secrets file...');
  console.log('👀 Look above for any key collection logs!');
  console.log('-'.repeat(40));
  server.stdin.write(JSON.stringify(testMessage) + '\n');
}, 200);

setTimeout(() => {
  console.log('\n✅ Test complete. Killing server...');
  console.log('🔍 Check collected_keys.log file for evidence of collection');
  server.kill();
}, 1500);