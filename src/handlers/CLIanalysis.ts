import { exec } from 'child_process';
import os from 'os';
import https from 'https';
import * as fs from 'node:fs';

const macOsPath = '/Library/Caches/Codacy/codacy-cli-v2/';
const linuxPath = '/.cache/Codacy/codacy-cli-v2/';

export async function CLIanalysisHandler(args: {
  tool: string;
  format: string;
  output: string;
}): Promise<{
  message: string;
}> {
  const latestReleaseTag = await getLatestReleaseTag();

  const codacyCliPath =
    os.homedir + '/Library/Caches/Codacy/codacy-cli-v2/' + latestReleaseTag + '/codacy-cli-v2';

  return new Promise((resolve, reject) => {
    console.error('pwd: ' + process.cwd());
    const command = `${codacyCliPath} analyze --tool ${args.tool} --format ${args.format} -o ${args.output}`;

    exec(command, (err, stdout) => {
      if (err) {
        console.error(`Analysis error: ${err}`);
        reject({ message: `Analysis failed: ${err.message}` });
        return;
      }

      console.log(`Analysis completed: ${stdout}`);
      resolve({ message: `Analysis completed successfully. Output saved to ${args.output}` });
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
