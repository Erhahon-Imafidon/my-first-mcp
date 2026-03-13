import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer(
    {
        name: "my-first-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {}
        }
    }
);


server.registerTool(
    "add-numbers",
    {
        description: "Adds two numbers",
        inputSchema: z.object({
            a:z.number().describe("First number"),
            b:z.number().describe("Second number"),
        })
    },
    async ({a, b}) => {
        return {
            content: [{type: "text", text: `Total is ${a + b}`}]
        }
    }
)

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error("Error in main!:", error);
    process.exit(1);
})