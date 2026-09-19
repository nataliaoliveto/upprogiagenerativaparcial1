import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

// 1. Configuración de API Key
dotenv.config({ path: path.join(process.cwd(), "mcp-server", ".env") });
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error(
    "FATAL ERROR: No se encontró la variable de entorno TMDB_API_KEY en el archivo .env",
  );
  process.exit(1);
}

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "frontend",
  "src",
  "graph_data.json",
);

const server = new McpServer({
  name: "movie-graph-mcp",
  version: "1.0.0",
});

// 2. Herramienta 1: Leer el grafo
server.registerTool(
  "read_graph",
  {
    description:
      "Usa esta herramienta PRIMERO cuando el usuario te pida una recomendación. Te devuelve el JSON con las películas actuales para saber el estado y de dónde sacar la relación.",
    inputSchema: {},
  },
  async () => {
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
      return { content: [{ type: "text", text: fileContent }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error reading graph: ${error}` }],
      };
    }
  },
);

// 3. Herramienta 2: Consultar TMDB
server.registerTool(
  "search_tmdb",
  {
    description:
      "Usa esta herramienta DESPUÉS de leer el grafo para buscar los datos oficiales de la película en TMDB.",
    inputSchema: {
      title: z.string().describe("Nombre de la película a buscar"),
    },
  },
  async ({ title }) => {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=es-ES&api_key=${TMDB_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        return { content: [{ type: "text", text: "Movie not found." }] };
      }
      const movie = data.results[0];
      const cleanInfo = {
        id: movie.id.toString(),
        title: movie.title,
        overview: movie.overview,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "",
      };
      return {
        content: [{ type: "text", text: JSON.stringify(cleanInfo, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error searching TMDB: ${error}` }],
      };
    }
  },
);

// 4. Herramienta 3: Agregar al Grafo
server.registerTool(
  "add_to_graph",
  {
    description:
      "Usa esta herramienta COMO PASO FINAL para guardar tu película en el JSON. Si es la PRIMERA película del grafo, omite sourceId y reason.",
    inputSchema: {
      movieId: z.string(),
      title: z.string(),
      poster: z.string().describe("URL completa del póster"),
      sourceId: z
        .string()
        .optional()
        .describe("ID del nodo de origen (Omitir si es la primera película)"),
      reason: z
        .string()
        .optional()
        .describe(
          "Por qué elegiste recomendarla (Omitir si es la primera película)",
        ),
    },
  },
  async ({ movieId, title, poster, sourceId, reason }) => {
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
      const graph = JSON.parse(fileContent);

      if (!graph.nodes.find((n: any) => n.id === movieId)) {
        graph.nodes.push({ id: movieId, title, poster });
      }

      if (sourceId && reason) {
        graph.edges.push({
          id: `e-${sourceId}-${movieId}`,
          source: sourceId,
          target: movieId,
          label: reason,
        });
      }

      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(graph, null, 2));
      return {
        content: [
          { type: "text", text: `Success! Movie ${title} added to graph.` },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error modifying graph_data.json: ${error}` },
        ],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    "Servidor MCP de Películas ejecutándose correctamente sin advertencias...",
  );
}

main().catch(console.error);
