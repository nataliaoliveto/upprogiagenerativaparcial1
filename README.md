# 🎬 Motor de Recomendación Visual con IA (Protocolo MCP)

## 📝 Breve descripción del proyecto

Este proyecto tiene como objetivo demostrar el dominio de flujos de trabajo asistidos por IA dentro del entorno de desarrollo, integrando herramientas externas a través del protocolo MCP (Model Context Protocol).

La aplicación consiste en un **Motor de Recomendación de Películas basado en Grafos de Conocimiento**. El proyecto utiliza un Agente de IA en el IDE que, mediante un servidor MCP personalizado, consulta datos reales de The Movie Database (TMDB) y actualiza de forma autónoma una base de datos local de relaciones (JSON). El frontend, desarrollado en React con React Flow, lee esta base local y renderiza el grafo de películas y sus conexiones lógicas en tiempo real.

## ⚙️ Requisitos previos para ejecutarlo

Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:

- **Node.js**: Versión 20 LTS (Recomendada).
- **Gestor de paquetes**: `npm` (viene incluido con Node).
- **Editor de Código**: Visual Studio Code.
- **Extensión MCP (Cliente)**: Roo Code, Cline o GitHub Copilot configurado para leer servidores MCP locales.
- **Navegador Web**: Chrome, Firefox o Edge.

## 🚀 Estructura del Repositorio

Todo el código se encuentra centralizado en este único repositorio para evitar la dispersión de archivos:

- `/frontend`: Aplicación cliente creada con React, Vite y React Flow.
- `/mcp-server`: Servidor MCP local desarrollado en TypeScript con `@modelcontextprotocol/sdk`.
- `.vscode/mcp.json`: Archivo de configuración para conectar el cliente MCP del IDE con el servidor local.

## 🛠️ Instrucciones de instalación

TBD.
