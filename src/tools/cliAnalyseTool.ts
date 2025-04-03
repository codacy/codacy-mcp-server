import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const cliAnalyseTool: Tool = {
    name: 'codacy_cli_analyse',
    description: 'Run analysis using Codacy CLI',
    inputSchema: {
        type: 'object',
        properties: {
            alias: {
                type: 'string',
                description: 'Alias to use for the codacy cli',
                default: 'codacy-cli'
            },
            tool: {
                type: 'string',
                description: 'Tool to use for analysis (e.g., eslint)',
                default: 'eslint'
            },
            format: {
                type: 'string',
                description: 'Output format (e.g., sarif)',
                default: 'sarif'
            },
            executionFolder: {
                type: 'string',
                description: 'Absolute path to the folder to execute the analysis'
            },
            file: {
                type: 'string',
                description: 'Absolute path to the file to analyse, if left empty, the analysis will be executed on the whole executionFolder',
                default: ''
            }
        }
    }
}; 
