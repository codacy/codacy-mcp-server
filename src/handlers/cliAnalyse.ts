import { exec } from 'child_process';
import os from 'os';
import https from 'https';

export async function cliAnalyseHandler(args: { alias: string, tool: string; format: string; output: string, executionFolder: string }): Promise<{ message: string }> {
    
    return new Promise((resolve, reject) => {
      const command = 
        `cd ${args.executionFolder} && ${args.alias} analyze --tool ${args.tool} --format ${args.format}`;
      
      exec(command, (err, stdout) => {
            if (err) {
                console.error(`Analysis error: ${err}`);
                reject({ message: `Analysis failed: ${err.message}` });
                return;
            }
            
            console.error(`Analysis completed: ${stdout}`);
            resolve({ message: `Analysis completed successfully: ${stdout}`});
        });
    });
} 
