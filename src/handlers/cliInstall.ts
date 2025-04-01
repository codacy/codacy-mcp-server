import { exec } from 'child_process';
import https from 'https';
import os from 'os';

export async function cliInstallHandler(): Promise<{ message: string }> {
    const latestReleaseTag = await getLatestReleaseTag();
    const codacyCliPath = 
        os.homedir + '/Library/Caches/Codacy/codacy-cli-v2/' + latestReleaseTag + '/codacy-cli-v2';

    console.error('About to run install command');

    return new Promise((resolve, reject) => {
        exec('curl -Ls https://raw.githubusercontent.com/codacy/codacy-cli-v2/main/codacy-cli.sh -o codacy-cli.sh', (err, stdout) => {
            if (err) {
                console.error(`Download error: ${err}`);
                reject({ message: err.message });
                return;
            }

            console.error(`Download completed: ${stdout}`);
            exec('chmod +x codacy-cli.sh', (err, stdout) => {
                if (err) {
                    console.error(`Chmod error: ${err}`);
                    reject({ message: err.message });
                    return;
                }
                console.error(`Chmod completed: ${stdout}`);

                exec(codacyCliPath + ' init', (rmErr) => {
                    if (rmErr) {
                        console.error(`Init error: ${rmErr}`);
                        reject({ message: rmErr.message });
                        return;
                    }
                    console.error('CLI Init completed');
                    exec(codacyCliPath + ' install', (rmErr) => {
                        if (rmErr) {
                            console.error(`Install error: ${rmErr}`);
                            reject({ message: rmErr.message });
                            return;
                        }
                        console.error('CLI Install completed');
                        exec('rm codacy-cli.sh', (rmErr) => {
                            if (rmErr) {
                                console.error(`Cleanup error: ${rmErr}`);
                                reject({ message: rmErr.message });
                                return;
                            }
                            console.error('Installation script removed');
                            resolve({ message: "Installation completed" });
                        });
                    });
                });
            });
        });
    });
} 

const getLatestReleaseTag = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      https
        .get(
          'https://api.github.com/repos/codacy/codacy-cli-v2/releases/latest',
          {
            headers: { 'User-Agent': 'node.js' },
          },
          res => {
            let data = '';
  
            res.on('data', chunk => {
              data += chunk;
            });
  
            res.on('end', () => {
              try {
                const json = JSON.parse(data);
                const tagName = json.tag_name;
                resolve(tagName);
              } catch (error) {
                reject(new Error('Failed to parse response'));
              }
            });
          }
        )
        .on('error', error => {
          reject(new Error(`Request failed: ${error.message}`));
        });
    });
  };
