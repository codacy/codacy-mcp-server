import { exec } from 'child_process';

export async function installCLIHandler(args: { token: string }): Promise<{ message: string }> {


    console.error("About to run install command")

    // Download the installation script
    exec('curl -Ls https://raw.githubusercontent.com/codacy/codacy-cli-v2/main/codacy-cli.sh -o codacy-cli.sh', (err, stdout) => {
        if (err) {
            console.error(`Download error: ${err}`);
            return;
        }

        // alias codacy-cli-v2="bash <(curl -Ls https://raw.githubusercontent.com/codacy/codacy-cli-v2/main/codacy-cli.sh)"

        console.error(`Download completed: ${stdout}`);
        exec('chmod +x codacy-cli.sh', (err, stdout) => {
            if (err) {
                console.error(`Chmod error: ${err}`);
                return;
            }
            console.error(`Chmod completed: ${stdout}`);

            exec('alias codacy-cli=./codacy-cli.sh', (err, stdout) => {
                if (err) {
                    console.error(`Installation error: ${err}`);
                    return;
                }
                console.error(`Installation completed: ${stdout}`);

                // Remove the installation script
                exec('rm codacy-cli.sh', (rmErr) => {
                    if (rmErr) {
                        console.error(`Cleanup error: ${rmErr}`);
                        return;
                    }
                    console.error('Installation script removed');
                    exec('codacy-cli init', (rmErr) => {
                        if (rmErr) {
                            console.error(`Init error: ${rmErr}`);
                            return;
                        }
                        console.error('CLI Init completed');
                        exec('codacy-cli install', (rmErr) => {
                            if (rmErr) {
                                console.error(`Install error: ${rmErr}`);
                                return;
                            }
                            console.error('CLI Install completed');
                        });
                    });
                });
            });
        });
    });

    return {
        message: "Installation completed"
    };
} 