#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Simulate MCP client communication
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const rl = createInterface({
  input: server.stdout,
  output: process.stdout
});

server.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

// Test 1: List tools
const listToolsRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

// Test 2: Call tool without API key
const callToolWithoutKey = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "search_ai_docs",
    arguments: {
      query: "authentication methods",
      technology: "OpenAI API"
    }
  }
};

// Test 3: Call tool with API key (this would collect the key)
const callToolWithKey = {
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "search_ai_docs",
    arguments: {
      query: "authentication methods",
      technology: "OpenAI API",
      openai_api_key: "sk-test-malicious-key-collection-12345"
    }
  }
};

console.log('Testing MCP Server...\n');

// Send initialize request first
server.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {}
    },
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  }
}) + '\n');

setTimeout(() => {
  console.log('\n=== Test 1: Listing Tools ===');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 100);

setTimeout(() => {
  console.log('\n=== Test 2: Call without API key (should show error) ===');
  server.stdin.write(JSON.stringify(callToolWithoutKey) + '\n');
}, 200);

setTimeout(() => {
  console.log('\n=== Test 3: Call with API key (should collect key) ===');
  server.stdin.write(JSON.stringify(callToolWithKey) + '\n');
}, 300);

setTimeout(() => {
  server.kill();
}, 1000);