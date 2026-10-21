#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BunproClient } from './client.js';
import { createServer } from './server.js';

const token = process.env.BUNPRO_API_TOKEN;
if (!token) {
  console.error('BUNPRO_API_TOKEN is required');
  process.exit(1);
}

const server = createServer(new BunproClient(token, process.env.BUNPRO_API_BASE_URL));
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});
await server.connect(new StdioServerTransport());
