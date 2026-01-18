#!/usr/bin/env node

/**
 * Docker MCP Server
 * Provides Docker operations and management through Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import Docker from "dockerode";
import { z } from "zod";

// Initialize Docker client
const docker = new Docker({
  socketPath: process.platform === "win32"
    ? "//./pipe/docker_engine"
    : "/var/run/docker.sock"
});

// Tool schemas
const ContainerListSchema = z.object({
  all: z.boolean().optional().describe("Show all containers (default shows just running)"),
  limit: z.number().optional().describe("Limit number of results"),
});

const ContainerInspectSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
});

const ContainerLogsSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  tail: z.number().optional().describe("Number of lines to show from the end of logs"),
  follow: z.boolean().optional().describe("Follow log output"),
});

const ContainerStartSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
});

const ContainerStopSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  timeout: z.number().optional().describe("Seconds to wait before killing"),
});

const ContainerRestartSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  timeout: z.number().optional().describe("Seconds to wait before killing"),
});

const ContainerRemoveSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  force: z.boolean().optional().describe("Force removal of running container"),
  volumes: z.boolean().optional().describe("Remove associated volumes"),
});

const ImageListSchema = z.object({
  all: z.boolean().optional().describe("Show all images (default hides intermediate)"),
});

const ImagePullSchema = z.object({
  image: z.string().describe("Image name (e.g., 'nginx:latest')"),
});

const ImageRemoveSchema = z.object({
  imageId: z.string().describe("Image ID or name"),
  force: z.boolean().optional().describe("Force removal"),
});

const VolumeListSchema = z.object({});

const VolumeInspectSchema = z.object({
  volumeName: z.string().describe("Volume name"),
});

const VolumeRemoveSchema = z.object({
  volumeName: z.string().describe("Volume name"),
  force: z.boolean().optional().describe("Force removal"),
});

const NetworkListSchema = z.object({});

const NetworkInspectSchema = z.object({
  networkId: z.string().describe("Network ID or name"),
});

const SystemInfoSchema = z.object({});

const SystemDfSchema = z.object({});

// Define available tools
const tools: Tool[] = [
  {
    name: "docker_container_list",
    description: "List Docker containers",
    inputSchema: {
      type: "object",
      properties: {
        all: { type: "boolean", description: "Show all containers (default shows just running)" },
        limit: { type: "number", description: "Limit number of results" },
      },
    },
  },
  {
    name: "docker_container_inspect",
    description: "Inspect a specific container",
    inputSchema: {
      type: "object",
      properties: {
        containerId: { type: "string", description: "Container ID or name" },
      },
      required: ["containerId"],
    },
  },
  {
    name: "docker_container_logs",
    description: "Get container logs",
    inputSchema: {
      type: "object",
      properties: {
        containerId: { type: "string", description: "Container ID or name" },
        tail: { type: "number", description: "Number of lines to show from the end of logs" },
        follow: { type: "boolean", description: "Follow log output" },
      },
      required: ["containerId"],
    },
  },
  {
    name: "docker_container_start",
    description: "Start a stopped container",
    inputSchema: {
      type: "object",
      properties: {
        containerId: { type: "string", description: "Container ID or name" },
      },
      required: ["containerId"],
    },
  },
  {
    name: "docker_container_stop",
    description: "Stop a running container",
    inputSchema: {
      type: "object",
      properties: {
        containerId: { type: "string", description: "Container ID or name" },
        timeout: { type: "number", description: "Seconds to wait before killing" },
      },
      required: ["containerId"],
    },
  },
  {
    name: "docker_container_restart",
    description: "Restart a container",
    inputSchema: {
      type: "object",
      properties: {
        containerId: { type: "string", description: "Container ID or name" },
        timeout: { type: "number", description: "Seconds to wait before killing" },
      },
      required: ["containerId"],
    },
  },
  {
    name: "docker_container_remove",
    description: "Remove a container",
    inputSchema: {
      type: "object",
      properties: {
        containerId: { type: "string", description: "Container ID or name" },
        force: { type: "boolean", description: "Force removal of running container" },
        volumes: { type: "boolean", description: "Remove associated volumes" },
      },
      required: ["containerId"],
    },
  },
  {
    name: "docker_image_list",
    description: "List Docker images",
    inputSchema: {
      type: "object",
      properties: {
        all: { type: "boolean", description: "Show all images (default hides intermediate)" },
      },
    },
  },
  {
    name: "docker_image_pull",
    description: "Pull a Docker image",
    inputSchema: {
      type: "object",
      properties: {
        image: { type: "string", description: "Image name (e.g., 'nginx:latest')" },
      },
      required: ["image"],
    },
  },
  {
    name: "docker_image_remove",
    description: "Remove a Docker image",
    inputSchema: {
      type: "object",
      properties: {
        imageId: { type: "string", description: "Image ID or name" },
        force: { type: "boolean", description: "Force removal" },
      },
      required: ["imageId"],
    },
  },
  {
    name: "docker_volume_list",
    description: "List Docker volumes",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "docker_volume_inspect",
    description: "Inspect a specific volume",
    inputSchema: {
      type: "object",
      properties: {
        volumeName: { type: "string", description: "Volume name" },
      },
      required: ["volumeName"],
    },
  },
  {
    name: "docker_volume_remove",
    description: "Remove a Docker volume",
    inputSchema: {
      type: "object",
      properties: {
        volumeName: { type: "string", description: "Volume name" },
        force: { type: "boolean", description: "Force removal" },
      },
      required: ["volumeName"],
    },
  },
  {
    name: "docker_network_list",
    description: "List Docker networks",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "docker_network_inspect",
    description: "Inspect a specific network",
    inputSchema: {
      type: "object",
      properties: {
        networkId: { type: "string", description: "Network ID or name" },
      },
      required: ["networkId"],
    },
  },
  {
    name: "docker_system_info",
    description: "Get Docker system information",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "docker_system_df",
    description: "Show Docker disk usage",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: "docker-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "docker_container_list": {
        const { all = false, limit } = ContainerListSchema.parse(args);
        const containers = await docker.listContainers({
          all,
          limit,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(containers, null, 2),
            },
          ],
        };
      }

      case "docker_container_inspect": {
        const { containerId } = ContainerInspectSchema.parse(args);
        const container = docker.getContainer(containerId);
        const data = await container.inspect();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "docker_container_logs": {
        const { containerId, tail = 100, follow = false } = ContainerLogsSchema.parse(args);
        const container = docker.getContainer(containerId);
        const logs = await container.logs({
          stdout: true,
          stderr: true,
          tail,
          follow,
        });
        return {
          content: [
            {
              type: "text",
              text: logs.toString(),
            },
          ],
        };
      }

      case "docker_container_start": {
        const { containerId } = ContainerStartSchema.parse(args);
        const container = docker.getContainer(containerId);
        await container.start();
        return {
          content: [
            {
              type: "text",
              text: `Container ${containerId} started successfully`,
            },
          ],
        };
      }

      case "docker_container_stop": {
        const { containerId, timeout } = ContainerStopSchema.parse(args);
        const container = docker.getContainer(containerId);
        await container.stop({ t: timeout });
        return {
          content: [
            {
              type: "text",
              text: `Container ${containerId} stopped successfully`,
            },
          ],
        };
      }

      case "docker_container_restart": {
        const { containerId, timeout } = ContainerRestartSchema.parse(args);
        const container = docker.getContainer(containerId);
        await container.restart({ t: timeout });
        return {
          content: [
            {
              type: "text",
              text: `Container ${containerId} restarted successfully`,
            },
          ],
        };
      }

      case "docker_container_remove": {
        const { containerId, force = false, volumes = false } = ContainerRemoveSchema.parse(args);
        const container = docker.getContainer(containerId);
        await container.remove({ force, v: volumes });
        return {
          content: [
            {
              type: "text",
              text: `Container ${containerId} removed successfully`,
            },
          ],
        };
      }

      case "docker_image_list": {
        const { all = false } = ImageListSchema.parse(args);
        const images = await docker.listImages({ all });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(images, null, 2),
            },
          ],
        };
      }

      case "docker_image_pull": {
        const { image } = ImagePullSchema.parse(args);
        const stream = await docker.pull(image);
        await new Promise((resolve, reject) => {
          docker.modem.followProgress(stream, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
        return {
          content: [
            {
              type: "text",
              text: `Image ${image} pulled successfully`,
            },
          ],
        };
      }

      case "docker_image_remove": {
        const { imageId, force = false } = ImageRemoveSchema.parse(args);
        const image = docker.getImage(imageId);
        await image.remove({ force });
        return {
          content: [
            {
              type: "text",
              text: `Image ${imageId} removed successfully`,
            },
          ],
        };
      }

      case "docker_volume_list": {
        VolumeListSchema.parse(args);
        const result = await docker.listVolumes();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.Volumes, null, 2),
            },
          ],
        };
      }

      case "docker_volume_inspect": {
        const { volumeName } = VolumeInspectSchema.parse(args);
        const volume = docker.getVolume(volumeName);
        const data = await volume.inspect();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "docker_volume_remove": {
        const { volumeName, force = false } = VolumeRemoveSchema.parse(args);
        const volume = docker.getVolume(volumeName);
        await volume.remove({ force });
        return {
          content: [
            {
              type: "text",
              text: `Volume ${volumeName} removed successfully`,
            },
          ],
        };
      }

      case "docker_network_list": {
        NetworkListSchema.parse(args);
        const networks = await docker.listNetworks();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(networks, null, 2),
            },
          ],
        };
      }

      case "docker_network_inspect": {
        const { networkId } = NetworkInspectSchema.parse(args);
        const network = docker.getNetwork(networkId);
        const data = await network.inspect();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case "docker_system_info": {
        SystemInfoSchema.parse(args);
        const info = await docker.info();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      case "docker_system_df": {
        SystemDfSchema.parse(args);
        const df = await docker.df();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(df, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Docker MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
