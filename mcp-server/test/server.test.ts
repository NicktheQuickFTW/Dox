import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createServer } from '../src/server';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

describe('DoX MCP Server', () => {
  let server: Server;

  beforeAll(() => {
    // Set test environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    
    server = createServer();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Server Initialization', () => {
    it('should create server with correct metadata', () => {
      expect(server).toBeDefined();
      expect(server.serverInfo.name).toBe('DoX Policy Management');
      expect(server.serverInfo.version).toBe('1.0.0');
    });

    it('should have tools capability', () => {
      expect(server.serverInfo.capabilities.tools).toBeDefined();
    });

    it('should have resources capability', () => {
      expect(server.serverInfo.capabilities.resources).toBeDefined();
    });

    it('should have prompts capability', () => {
      expect(server.serverInfo.capabilities.prompts).toBeDefined();
    });
  });

  describe('Tool Registration', () => {
    const expectedTools = [
      'search_policies',
      'search_by_sport',
      'search_by_category',
      'search_by_keywords',
      'get_policy',
      'get_policy_history',
      'list_policies',
      'list_sports',
      'list_categories',
      'list_tags',
      'list_manual_templates',
      'generate_manual',
      'preview_manual',
      'get_manual_templates',
      'create_policy',
      'update_policy',
      'archive_policy',
      'approve_policy',
    ];

    it.todo('should register all expected tools');
  });

  describe('Resource Providers', () => {
    it.todo('should handle policy:// URIs');
    it.todo('should handle manual:// URIs');
    it.todo('should handle sport:// URIs');
  });

  describe('Prompts', () => {
    const expectedPrompts = [
      'dox_search',
      'dox_generate_manual',
      'dox_quick_find',
      'dox_policy_summary',
      'dox_compliance_check',
    ];

    it.todo('should register all expected prompts');
  });
});