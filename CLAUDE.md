# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarkdownX is a Markdown-to-image conversion service that supports both HTTP API and MCP (Model Context Protocol) interfaces. It uses Puppeteer to render Markdown content into styled images with 7 different themes.

## Architecture

### Dual-Mode Operation

The project operates in two distinct modes:

1. **HTTP API Server** (`server/index.js`)
   - Express-based REST API
   - Handles file uploads and text-based conversion
   - Serves generated images from `/outputs` directory
   - Entry point: `npm run start:api`

2. **MCP Server** (`server/mcp_server.js`)
   - JSON-RPC 2.0 over stdio
   - Implements Model Context Protocol for AI tool integration
   - Entry point: `npm start` or `node server/mcp_server.js`

### Core Components

- **generateImage.js**: Core rendering logic
  - Converts Markdown to HTML using markdown-it with syntax highlighting (highlight.js)
  - Renders HTML to image using Puppeteer
  - Supports 7 themes via EJS templates in `server/templates/`
  - Returns both absolute paths and relative URLs

- **API Routes** (`server/api/routes.js`):
  - `POST /api/generate-image`: Upload Markdown file
  - `POST /api/generate-from-text`: Send Markdown as JSON
  - `GET /api/images`: List generated images
  - `DELETE /api/images/:filename`: Delete specific image
  - `DELETE /api/images`: Clear all images
  - `GET /api/docs`: API documentation

- **Templates** (`server/templates/`):
  - 7 EJS templates: notion, terminal, paper, memo, card, dark, minimal
  - Each template wraps content in `.markdown-body` class for screenshot targeting

## Development Commands

```bash
# Install dependencies
npm install

# Start MCP server (stdio mode)
npm start

# Start HTTP API server
npm run start:api

# Run tests
node test_generate.js          # Test image generation
node test_all_themes.js        # Generate samples for all themes
node test_mcp.js               # Test MCP protocol
node test_mcp_interactive.js   # Interactive MCP testing
```

## Key Technical Details

### Image Generation Flow

1. Markdown → HTML (markdown-it with highlight.js)
2. HTML → EJS template rendering
3. Write temporary HTML file to `server/outputs/`
4. Puppeteer loads file:// URL
5. Wait for `.markdown-body` selector
6. Screenshot element bounding box
7. Clean up temporary HTML
8. Return paths: `absolutePath`, `relativePath`, `url`, `filename`

### Puppeteer Configuration

- Headless mode: `"new"`
- Args: `['--no-sandbox', '--disable-setuid-sandbox']`
- Default viewport: 800x600
- Screenshots clip to content bounding box (not full viewport)

### File Structure

- Generated images: `server/outputs/output-{timestamp}.{format}`
- Temporary HTML: `server/outputs/temp-{uuid}.html`
- Uploaded files: `server/outputs/uploads/` (cleaned after processing)

### MCP Protocol Implementation

- Protocol version: `2024-11-05`
- Tool name: `markdown-to-image`
- Input schema defined in `server/mcp.json`
- Communicates via JSON-RPC 2.0 over stdin/stdout
- Errors logged to stderr

## Important Conventions

- All file paths use Node.js `path` module for cross-platform compatibility
- Temporary files are always cleaned up in try/finally blocks
- Output directory is created recursively if missing
- Theme validation defaults to 'notion' for invalid themes
- JPEG quality parameter only applies to JPEG format (ignored for PNG)

## Testing

Test files are in the root directory and demonstrate:
- Direct function calls to `generateImage()`
- HTTP API requests
- MCP JSON-RPC protocol interaction
- All theme variations

## Environment

- Default port: 3000 (configurable via `PORT` env var)
- Node.js ≥14.0.0 required
- Puppeteer downloads Chromium automatically on install
