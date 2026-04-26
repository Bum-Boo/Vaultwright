---
title: MCP
aliases: [Model Context Protocol]
tags: [tools, protocol]
---
# MCP

Model Context Protocol lets local tools expose structured capabilities to clients.

## Vaultwright usage

Vaultwright uses MCP over STDIO.

- [ ] Test scan_vault against the sample vault

## Safety Notes

MCP tools should be small, explicit, and easy to audit. Vaultwright uses read-only tools first, then writes only to Vaultwright-owned output folders.

Unlinked mention: Local-first Software.
