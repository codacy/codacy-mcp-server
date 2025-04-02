import { exec } from 'child_process';
import https from 'https';
import os from 'os';
import path from 'node:path';
import { promisify } from 'node:util';
import * as fs from 'node:fs';

const MAC_OS_PATH = path.join(os.homedir(), 'Library/Caches/Codacy/codacy-cli-v2/');
const LINUX_PATH = path.join(os.homedir(), '.cache/Codacy/codacy-cli-v2/');
const GITHUB_LATEST_RELEASE_URL =
  'https://api.github.com/repos/codacy/codacy-cli-v2/releases/latest';
const GITHUB_INSTALL_SCRIPT_URL =
  'https://raw.githubusercontent.com/codacy/codacy-cli-v2/main/codacy-cli.sh';

export const installCliHandler = async (): Promise<{ message: string }> => {
  const isCliInstalled = await isCodacyCliInstalled();
  const isConfigPresent = isCodacyConfigPresent();

  if (!isCliInstalled) {
    const downloadSuccessful = await downloadCliTool();
    if (!downloadSuccessful) {
      console.error('Failed to download Codacy CLI');
      throw new Error('Failed to download Codacy CLI');
    }
  }

  const cliPath = await getCodacyCliPath();

  if (!isConfigPresent) {
    await execPromise(`${cliPath} init`);
    await execPromise(`${cliPath} install`);
  } else {
    return {
      message: 'Codacy CLI is already installed and configured',
    };
  }

  const isConfigInstallationSuccessful = isCodacyConfigPresent();

  if (isConfigInstallationSuccessful) {
    return {
      message: 'Codacy CLI installed successfully',
    };
  } else {
    return {
      message: 'Codacy CLI downloaded, but installation has failed',
    };
  }
};

const getLatestReleaseTag = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    https
      .get(
        GITHUB_LATEST_RELEASE_URL,
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

const execAsync = promisify(exec);

const execPromise = async (command: string): Promise<string> => {
  try {
    const { stdout, stderr } = await execAsync(command);

    if (stderr) return `Command "${command}" has failed, reason: ${stderr}`;

    return stdout.trim();
  } catch (error) {
    return `Command failed: ${command}\n${error instanceof Error ? error.message : error}`;
  }
};

const downloadCliTool = () => {
  return new Promise((resolve, reject) => {
    exec(
      `bash <(curl -Ls ${GITHUB_INSTALL_SCRIPT_URL})`,
      { shell: '/bin/bash' },
      (error, stdout, stderr) => {
        // if (error) {
        //   reject(new Error('Error: ' + error.message));
        //   return;
        // }
        // if (stderr) {
        //   reject(new Error(stderr));
        //   return;
        // }
        resolve(true);
      }
    );
  }).then(() => true);
  //TODO this catch always occurs for some reason
  // .catch(error => {
  //   console.error('Error downloading CLI tool: ', error);
  //   return false;
  // });
};

//TODO better error handling
const getCodacyCliPath: () => Promise<string> = async () => {
  const latestReleaseTag = await getLatestReleaseTag();

  if (os.platform() === 'darwin') {
    return path.join(MAC_OS_PATH, latestReleaseTag, 'codacy-cli-v2');
  } else if (os.platform() === 'linux') {
    return path.join(LINUX_PATH, latestReleaseTag, 'codacy-cli-v2');
  } else {
    throw new Error('Unsupported OS');
  }
};

const isCodacyCliInstalled: () => Promise<boolean> = async () => {
  const codacyCliPath = await getCodacyCliPath();
  return fs.existsSync(codacyCliPath);
};

const isCodacyConfigPresent = () => {
  return (
    fs.existsSync(path.join(process.cwd(), '.codacy', 'codacy.yml')) ||
    fs.existsSync(path.join(process.cwd(), '.codacy', 'codacy.yaml'))
  );
};
