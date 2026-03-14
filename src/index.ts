import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";


const GITHUB_API_URL = "https://api.github.com/users";

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

server.registerTool(
    "get_github_repos",
    {
        description: "Gets Github repository from a given username",
        inputSchema: z.object({
            username: z.string().describe("Github username")
        })
    },
    async ({username}) => {
        const allRepos: any[] = [];
        let page = 1;
        const perPage = 100; // GitHub max per page

        while (true) {
            const req = await fetch(`${GITHUB_API_URL}/${username}/repos?per_page=${perPage}&page=${page}`, {
                headers: {"User-Agent": "MCP-Server"}
            });

            if (!req.ok) throw new Error('Failed to fetch repositories from GitHub API');

            const res = await req.json();
            if (res.length === 0) break;

            allRepos.push(...res);
            if (res.length < perPage) break; // No more pages
            page++;
        }

        const repoList = allRepos.map((repo:any, index:number) => `${index + 1}. ${repo.name}`).join("\n\n");

        return {
            content: [{type: "text", text: `Repositories for user ${username}: (${allRepos.length} repos): \n\n${repoList}`}]
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