#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createVaultwrightServer } from "./server.js";

const server = createVaultwrightServer();
const transport = new StdioServerTransport();

server.connect(transport).catch((error) => {
  console.error(error);
  process.exit(1);
});
