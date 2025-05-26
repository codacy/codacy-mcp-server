# Codacy MCP Server

MCP Server for the Codacy API, enabling access to repositories, files, quality, coverage, security and more.

## Features / Tools

The following tools are available through the Codacy MCP Server:

### Organization and Repository Management

- `codacy_list_organizations`: List organizations with pagination support.
- `codacy_list_organization_repositories`: List repositories in an organization with pagination support.
- `codacy_get_repository_with_analysis`: Get repository with analysis information, including metrics for Grade, Issues, Duplication, Complexity, and Coverage.

### Code Quality and Analysis

- `codacy_list_repository_issues`: Lists and filters code quality issues in a repository. This is the primary tool for investigating general code quality concerns (e.g. best practices, performance, complexity, style) but NOT security issues. For security-related issues, use the SRM items tool instead. Features include:

  - Pagination support for handling large result sets
  - Filtering by multiple criteria including severity, category, and language
  - Author-based filtering for accountability
  - Branch-specific analysis
  - Pattern-based searching

  Common use cases:

  - Code quality audits
  - Technical debt assessment
  - Style guide compliance checks
  - Performance issue investigation
  - Complexity analysis

### File Management and Analysis

- `codacy_list_files`: List files in a repository with pagination support.
- `codacy_get_file_issues`: Get the issue list for a file in a repository.
- `codacy_get_file_coverage`: Get coverage information for a file in the head commit of a repository branch.
- `codacy_get_file_clones`: Get the list of duplication clones (identical or very similar code segments) for a file in a repository.
- `codacy_get_file_with_analysis`: Get detailed analysis information for a file, including metrics for Grade, Issues, Duplication, Complexity, and Coverage.

### Security Analysis

- `codacy_search_organization_srm_items`: Primary tool to list security items/issues/vulnerabilities/findings across an organization. Results are related to the organization's security and risk management (SRM) dashboard on Codacy.
- `codacy_search_repository_srm_items`: List security items/issues/vulnerabilities/findings for a specific repository.

Both tools provide comprehensive security analysis including:

- SAST (Code scanning)
- Secrets (Secret scanning)
- SCA (Dependency scanning)
- IaC (Infrastructure-as-code scanning)
- CICD (CI/CD scanning)
- DAST (Dynamic Application Security Testing)
- PenTesting (Penetration testing)

### Pull Request Analysis

- `codacy_list_repository_pull_requests`: List pull requests from a repository that the user has access to.
- `codacy_get_repository_pull_request`: Get detailed information about a specific pull request.
- `codacy_list_pull_request_issues`: Returns a list of issues found in a pull request (new or fixed issues).
- `codacy_get_pull_request_files_coverage`: Get diff coverage information for all files in a pull request.
- `codacy_get_pull_request_git_diff`: Returns the human-readable Git diff of a pull request.

### Tool and Pattern Management

- `codacy_list_tools`: List all code analysis tools available in Codacy.
- `codacy_list_repository_tools`: Get analysis tools settings and available tools for a repository.
- `codacy_get_pattern`: Get the definition of a specific pattern.
- `codacy_list_repository_tool_patterns`: List the patterns of a tool available for a repository.
- `codacy_get_issue`: Get detailed information about a specific issue.

### CLI Analysis

- `codacy_cli_analyze`: Run quality analysis locally using Codacy CLI. Features include:
  - Analyze specific files or entire directories
  - Use specific tools or all available tools
  - Get immediate results without waiting for scheduled analysis
  - Apply fixes based on Codacy configuration

## Setup

### Requirements

Ensure your machine has the following tools installed:

- git
- node.js
  - ensure that the `npx` command runs without issues.

For local analysis, the MCP Server requires the [Codacy CLI](https://github.com/codacy/codacy-cli-v2) to be installed. If it is not available, the MCP Server will attempt to install it for you. Codacy CLI v2 runs on macOS, Linux, and Windows (only with WSL).

### Personal API Access Token

Get your Codacy's Account API Token from your [Codacy Account](https://app.codacy.com/account/access-management).

You'll need it later in the setup.

### Usage

In supported IDEs like VS Code, Cursor, and Windsurf, the easiest way to install Codacy's MCP Server is to do it from the Codacy extension. If you haven't yet, install the extension from within your IDE, or from any of the available marketplaces ([Microsoft](https://marketplace.visualstudio.com/items?itemName=codacy-app.codacy), [OpenVSX](https://open-vsx.org/extension/codacy-app/codacy)). From the extension panel, just click on Add Codacy MCP Server. Restart your IDE afterwards.

Without the extension, you can still use and install the MCP Server:

### Cursor, Windsurf, and others

Depending on what you are connecting the MCP Server to, you can use the following methods:

- Cursor: edit the `.cursor/mcp.json` file to add the following
- Windsurf: edit the `.codeium/windsurf/mcp_config.json` file to add the following
- Claude Desktop: edit the `claude_desktop_config.json` file to add the following

```json
{
  "mcpServers": {
    "codacy": {
      "command": "npx",
      "args": ["-y", "@codacy/codacy-mcp"],
      "env": {
        "CODACY_ACCOUNT_TOKEN": "<YOUR_TOKEN>",
        "CODACY_CLI_VERSION": "<VERSION>"
      }
    }
  }
}
```

### VS Code with Copilot

1. For connecting the MCP Server to Copilot in VS Code, add the following to the global config of the IDE:

```json
{
  "mcp": {
    "inputs": [],
    "servers": {
      "codacy": {
        "command": "npx",
        "args": ["-y", "@codacy/codacy-mcp"],
        "env": {
          "CODACY_ACCOUNT_TOKEN": "<YOUR_TOKEN>",
          "CODACY_CLI_VERSION": "<VERSION>"
        }
      }
    }
  }
}
```

You can open the user settings.json file in:

`View > Command Palette > Preferences: Open User Settings (JSON)`

Or open the general settings.json file directly, which according to your OS should be located in:

- for macOS: `~/Library/Application Support/Code/User/settings.json`
- for Windows: `%APPDATA%\Code\User\settings.json`
- for Linux: `~/.config/Code/User/settings.json`

Don't forget to update the value of `CODACY_ACCOUNT_TOKEN` with your token.

2. Make sure you have Agent mode enabled: [vscode://settings/chat.agent.enabled](vscode://settings/chat.agent.enabled)

3. Open the Copilot chat and switch the mode to `Agent`. You can check that the MCP server was enabled correctly by clicking on the `Select tools` icon, which should list all the available Codacy tools.

![Copilot Agent with Codacy tools](docs/copilot_agent.png)

### Node Troubleshooting

#### Claude Desktop

When using NVM with Claude Desktop, NPX may not work. You should first install the MCP Server globally, and then use Node directly:

```bash
npm install -g @codacy/codacy-mcp
```

```json
{
  "mcpServers": {
    "codacy": {
      "command": "/Users/yourusername/.nvm/versions/node/vXX.X.X/bin/node",
      "args": ["/path-to/codacy-mcp/dist/index.js"],
      "env": {
        "CODACY_ACCOUNT_TOKEN": "<YOUR_TOKEN>",
        "CODACY_CLI_VERSION": "<VERSION>"
      }
    }
  }
}
```

## Build

Local:

```bash
npm install
npm run update-api
npm run build
```

## Codacy-CLI Support (WIP)

In order to use the [Codacy-CLI](https://github.com/codacy/codacy-cli-v2), it needs to be installed. Note that the `CODACY_CLI_VERSION` variable is optional, in case you want to use a specific version of our CLI.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
