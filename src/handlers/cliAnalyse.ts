import { exec } from 'child_process';
import os from 'os';
import https from 'https';
import path from 'path';

// Safeguard: Validate and sanitize command inputs
function sanitizeCommand(command: string): string {
  // Remove any shell metacharacters
  return command.replace(/[;&|`$]/g, '');
}

// Safeguard: Validate tool name
function validateTool(tool: string): string {
  const allowedTools = ['eslint', 'trivy'];
  if (!allowedTools.includes(tool)) {
    throw new Error(`Invalid tool: ${tool}. Allowed tools are: ${allowedTools.join(', ')}`);
  }
  return tool;
}

// Safeguard: Validate format
function validateFormat(format: string): string {
  const allowedFormats = ['sarif'];
  if (!allowedFormats.includes(format)) {
    throw new Error(`Invalid format: ${format}. Allowed formats are: ${allowedFormats.join(', ')}`);
  }
  return format;
}

export async function cliAnalyseHandler(args: {
  tool: string;
  format: string;
  executionFolder: string;
  alias: string;
  file?: string;
}): Promise<{ message: string }> {
  // Validate inputs
  const safeExecutionFolder = sanitizeCommand(args.executionFolder);
  const safeAlias = sanitizeCommand(args.alias);
  const safeTool = validateTool(args.tool);
  const safeFormat = validateFormat(args.format);
  const safeFile = args.file ? sanitizeCommand(args.file) : '';

  const command = `cd ${safeExecutionFolder} && ${safeAlias} analyze --tool ${safeTool} --format ${safeFormat} ${safeFile}`;

  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        console.error(`Analysis error: ${err}`);
        reject({ message: `Analysis failed: ${err.message}` });
        return;
      }

      console.log(`Analysis completed: ${stdout}`);
      resolve({ message: `Analysis completed successfully. Output ${stdout}` });
    });
  });
}
