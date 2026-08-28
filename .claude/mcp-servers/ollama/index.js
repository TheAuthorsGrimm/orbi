#!/usr/bin/env node
/**
 * MCP server for Ollama — exposes local Ollama models to Claude Code as tools.
 *
 * Configure in ~/.claude/claude.json (user) or .claude/settings.json (project):
 *   {
 *     "mcpServers": {
 *       "ollama": {
 *         "command": "node",
 *         "args": [".claude/mcp-servers/ollama/index.js"],
 *         "env": { "OLLAMA_BASE_URL": "http://localhost:11434" }
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function ollamaFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama ${path} → ${res.status}: ${text}`);
  }
  return res;
}

async function ollamaJson(path, options = {}) {
  const res = await ollamaFetch(path, options);
  return res.json();
}

/** Collect a streaming newline-delimited JSON response from Ollama into one object. */
async function ollamaStream(path, body) {
  const res = await ollamaFetch(path, {
    method: "POST",
    body: JSON.stringify({ ...body, stream: false }),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function listModels() {
  const data = await ollamaJson("/api/tags");
  const models = (data.models ?? []).map((m) => ({
    name: m.name,
    size: m.size,
    modified_at: m.modified_at,
    digest: m.digest,
  }));
  return { models, count: models.length };
}

async function showModel({ model }) {
  if (!model) throw new Error("model is required");
  const data = await ollamaJson("/api/show", {
    method: "POST",
    body: JSON.stringify({ name: model }),
  });
  return data;
}

async function generate({ model, prompt, system, temperature, max_tokens }) {
  if (!model) throw new Error("model is required");
  if (!prompt) throw new Error("prompt is required");

  const body = {
    model,
    prompt,
    options: {},
  };
  if (system) body.system = system;
  if (temperature !== undefined) body.options.temperature = temperature;
  if (max_tokens !== undefined) body.options.num_predict = max_tokens;

  const data = await ollamaStream("/api/generate", body);
  return {
    response: data.response ?? "",
    model: data.model,
    done: data.done,
    total_duration_ms: data.total_duration ? Math.round(data.total_duration / 1e6) : undefined,
    eval_count: data.eval_count,
  };
}

async function chat({ model, messages, system, temperature, max_tokens }) {
  if (!model) throw new Error("model is required");
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages must be a non-empty array");
  }

  const body = {
    model,
    messages,
    options: {},
  };
  if (system) {
    body.messages = [{ role: "system", content: system }, ...messages];
  }
  if (temperature !== undefined) body.options.temperature = temperature;
  if (max_tokens !== undefined) body.options.num_predict = max_tokens;

  const data = await ollamaStream("/api/chat", body);
  return {
    message: data.message ?? {},
    model: data.model,
    done: data.done,
    total_duration_ms: data.total_duration ? Math.round(data.total_duration / 1e6) : undefined,
    eval_count: data.eval_count,
  };
}

async function pullModel({ model, insecure }) {
  if (!model) throw new Error("model is required");

  const body = { name: model, stream: false };
  if (insecure) body.insecure = true;

  const data = await ollamaJson("/api/pull", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { status: data.status ?? "unknown", model };
}

async function deleteModel({ model }) {
  if (!model) throw new Error("model is required");
  await ollamaFetch("/api/delete", {
    method: "DELETE",
    body: JSON.stringify({ name: model }),
  });
  return { deleted: model };
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "ollama_list_models",
    description:
      "List all models currently available in the local Ollama instance.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ollama_show_model",
    description:
      "Show detailed information about a specific Ollama model (parameters, template, license, modelfile).",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Model name, e.g. 'llama3.2' or 'mistral:7b'",
        },
      },
      required: ["model"],
    },
  },
  {
    name: "ollama_generate",
    description:
      "Generate a completion from an Ollama model given a raw prompt. Use for single-turn text generation.",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Model name, e.g. 'llama3.2'",
        },
        prompt: {
          type: "string",
          description: "The prompt text to send to the model",
        },
        system: {
          type: "string",
          description: "Optional system message prepended to the prompt",
        },
        temperature: {
          type: "number",
          description: "Sampling temperature (0–2). Defaults to model default.",
        },
        max_tokens: {
          type: "integer",
          description: "Maximum number of tokens to generate (num_predict).",
        },
      },
      required: ["model", "prompt"],
    },
  },
  {
    name: "ollama_chat",
    description:
      "Send a multi-turn chat request to an Ollama model. Messages follow the OpenAI-style {role, content} format.",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Model name, e.g. 'llama3.2'",
        },
        messages: {
          type: "array",
          description: "Conversation history as [{role, content}] pairs. Roles: 'user' | 'assistant'.",
          items: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["user", "assistant"] },
              content: { type: "string" },
            },
            required: ["role", "content"],
          },
        },
        system: {
          type: "string",
          description: "Optional system message prepended before the conversation",
        },
        temperature: {
          type: "number",
          description: "Sampling temperature (0–2)",
        },
        max_tokens: {
          type: "integer",
          description: "Maximum tokens to generate",
        },
      },
      required: ["model", "messages"],
    },
  },
  {
    name: "ollama_pull_model",
    description:
      "Pull (download) a model from the Ollama library into the local instance.",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Model name to pull, e.g. 'llama3.2' or 'mistral:7b'",
        },
        insecure: {
          type: "boolean",
          description: "Allow insecure connections (only for private/dev registries)",
        },
      },
      required: ["model"],
    },
  },
  {
    name: "ollama_delete_model",
    description: "Delete a locally downloaded Ollama model.",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Model name to delete, e.g. 'llama3.2'",
        },
      },
      required: ["model"],
    },
  },
];

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

const HANDLERS = {
  ollama_list_models: listModels,
  ollama_show_model: showModel,
  ollama_generate: generate,
  ollama_chat: chat,
  ollama_pull_model: pullModel,
  ollama_delete_model: deleteModel,
};

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

const server = new Server(
  { name: "ollama", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = HANDLERS[name];
  if (!handler) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const result = await handler(args ?? {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
