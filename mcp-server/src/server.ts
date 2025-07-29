import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

// Import tool handlers
import { searchTools } from './tools/search.js';
import { retrieveTools } from './tools/retrieve.js';
import { listTools } from './tools/list.js';
import { generateTools } from './tools/generate.js';
import { manageTools } from './tools/manage.js';

// Import resource providers
import { PolicyResourceProvider } from './resources/policy.js';
import { ManualResourceProvider } from './resources/manual.js';
import { SportResourceProvider } from './resources/sport.js';

// Import prompts
import { prompts } from './prompts/index.js';

export function createServer(): Server {
  const server = new Server(
    {
      name: process.env.MCP_SERVER_NAME || 'DoX Policy Management',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Initialize resource providers
  const policyProvider = new PolicyResourceProvider();
  const manualProvider = new ManualResourceProvider();
  const sportProvider = new SportResourceProvider();

  // Combine all tools
  const allTools = {
    ...searchTools,
    ...retrieveTools,
    ...listTools,
    ...generateTools,
    ...manageTools,
  };

  // Handle list tools request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = allTools[name];
    if (!tool) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Tool "${name}" not found`
      );
    }

    try {
      const result = await tool.handler(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  // Handle list resources request
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources = [
      ...await policyProvider.listResources(),
      ...await manualProvider.listResources(),
      ...await sportProvider.listResources(),
    ];

    return { resources };
  });

  // Handle read resource request
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    // Determine which provider to use based on URI scheme
    let provider;
    if (uri.startsWith('policy://')) {
      provider = policyProvider;
    } else if (uri.startsWith('manual://')) {
      provider = manualProvider;
    } else if (uri.startsWith('sport://')) {
      provider = sportProvider;
    } else {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource URI scheme: ${uri}`
      );
    }

    const contents = await provider.readResource(uri);
    return { contents };
  });

  // Handle list prompts request
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: Object.entries(prompts).map(([name, prompt]) => ({
        name,
        description: prompt.description,
        arguments: prompt.arguments,
      })),
    };
  });

  // Handle get prompt request
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const prompt = prompts[name];

    if (!prompt) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Prompt "${name}" not found`
      );
    }

    const messages = await prompt.handler(args || {});
    return { messages };
  });

  return server;
}