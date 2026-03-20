import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as path from "path";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";



const GITHUB_API_URL = "https://api.github.com/users";

const server = new McpServer(
    {
        name: "my-first-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
           
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
        const req = await fetch(`${GITHUB_API_URL}/${username}/repos?per_page=100&page=1`, {
            headers: {
                "User-Agent": "Mcp-Server"
            }
        });

        if (!req.ok) {
            return {
                content: [{type: "text", text: `Error fetching repos for user ${username}`}]
            }
        };

        const repos = await req.json();

        const repoList = repos.map((repo: any, index: number) => `${index + 1}. ${repo.name}`).join("\n\n");

        return {
            content: [{type: "text", text: `Repositories for user ${username}: (${repos.length} repos): \n\n${repoList}`}]
        }

    }
)


server.registerResource(
    "apartment_rules",
    "rules://all",
    {
        description: "Resource for all apartment rules",
        mimeType: "text/plain",
    },
     async (uri) => {
      const uriString = uri.toString();
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const rules = await fs.readFile(path.resolve(__dirname, "../src/data/rules.doc"), "utf-8")
    
        return {
            contents: [
                {
                    uri: uriString,
                    mimeType: 'text/plain',
                    text: rules
                }
            ]
        }
     }
)

server.registerPrompt(
    "explain-sql",
    {
        title: "Explain SQL Query",
        description: "A prompt to explain an SQL query in simple terms.",
        argsSchema: {
            sql: z.string().describe("The SQL query to explain")
        }
    },
    async ({sql}) => {
       
        return {
             messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Give me a detailed explanation of the following SQL query in plain English: ${sql} Make it very detailed and specific for a beginner to understand.`
                }
            }
        ]
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


