import { Command } from 'commander';
import path from 'path';
import { stderr, stdout } from 'process';

export async function installCLIHandler(args: { path: string }): Promise<{ message: string }> {

    const program = new Command();

    // Add commands
    program
        .name('codacy-cli')
        .description('CLI for interacting with Codacy')
        .version('0.1.0');


    // Add analyze command
    program
        .command('analyze')
        .description('Analyze code using ESLint')
        .option('-p, --path <dir>', 'Directory to execute in')
        .action((args) => {
            const path = require('path');
            const executionPath = path.resolve(args.path);

            const { exec } = require('child_process');
            
            exec(
                'codacy-cli analyze --tool eslint --format sarif -o results.sarif',
                { cwd: executionPath },
                (error: any, stdout: any, stderr: any) => {
                    console.error('ep', executionPath)
                    if (error) {
                        console.error(`Error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`Stderr: ${stderr}`);
                        return;
                    }
                    console.log(`Output: ${stdout}`);

                    console.log('Analysis completed:', stdout);
                }
            );
        });


    console.error("About to run analyze command", args)

    // Parse command line arguments
    const result = await program.parseAsync([`analyze -p ${path}`]);

    console.log("GOT RESULT", result);

    return {
        message: "! urhfgerhehehe"
    };
} 