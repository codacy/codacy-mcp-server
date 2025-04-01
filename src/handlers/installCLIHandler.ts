import { Command } from 'commander';
import { stderr, stdout } from 'process';

export async function installCLIHandler(args: { token: string }): Promise<{ message: string }> {

    const program = new Command();

    // Check for CODACY_ACCOUNT_TOKEN
    if (!process.env.CODACY_ACCOUNT_TOKEN) {
        // Set CODACY_ACCOUNT_TOKEN from args
        process.env.CODACY_ACCOUNT_TOKEN = args.token;
    }

    // Add commands
    program
        .name('codacy-cli')
        .description('CLI for interacting with Codacy')
        .version('0.1.0');


    // Add analyze command

    program
        .command('analyze')
        .description('Analyze code using ESLint')
        .action(() => {
            const { exec } = require('child_process');
            exec('codacy-cli analyze --tool eslint --format sarif -o results.sarif', (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.error('Error:', error);
                    return;
                }
                console.log('Analysis completed:', stdout);
            });
        });


    console.error("About to run analyze command")
    // Parse command line arguments
    program.parse(['codacy-cli', 'analyze --tool eslint --format sarif -o results.sarif']);

    return {
        message: "! urhfgerhehehe"
    };
} 