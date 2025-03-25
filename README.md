# Codacy MCP Server

MCP Server for the Codacy API, enabling access to repositories, files, quality, coverage, security and more.

### Features

## Tools

## Setup

### Personal API Access Token
Get your Codacy's Account API Token from your [Codacy Account](https://app.codacy.com/account/access-management).

### Usage with Claude Desktop
To use this with Claude Desktop, add the following to your `claude_desktop_config.json`:

#### Docker
```json
{
  "mcpServers": {
    "codacy": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "CODACY_ACCOUNT_TOKEN",
        "mcp/codacy"
      ],
      "env": {
        "CODACY_ACCOUNT_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "codacy": {
      "command": "npx",
      "args": [
        "-y",
        "@codacy/codacy-mcp"
      ],
      "env": {
        "CODACY_ACCOUNT_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

### Node (when using NVM)
When using NVM, NPX won't work. You can use Node directly:

```json
{
  "mcpServers": {
    "codacy": {
      "command": "/Users/yourusername/.nvm/versions/node/vXX.X.X/bin/node",
      "args": [
        "/path-to/codacy-mcp/dist/index.js",
      ],
      "env": {
        "CODACY_ACCOUNT_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```


## Build

Local:

```bash
npm run build
```

Docker build:

```bash
docker build -t mcp/codacy -f src/codacy/Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
