import fs from 'fs-extra';
import path from 'path';
import * as tmp from 'tmp';

async function createTempDir() {
  return new Promise<string>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tmp.dir((err: any, dir: string | PromiseLike<string>) => {
      if (err) {
        return reject(err);
      }
      resolve(dir);
    });
  });
}

export async function createSettings(): Promise<string> {
  const userDataDirectory = await createTempDir();
  process.env.VSC_JUPYTER_VSCODE_SETTINGS_DIR = userDataDirectory;
  const settingsFile = path.join(userDataDirectory, 'User', 'settings.json');
  const defaultSettings: Record<string, string | boolean | string[]> = {
    'security.workspace.trust.enabled': false, // Disable trusted workspaces.
  };

  fs.ensureDirSync(path.dirname(settingsFile));
  fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, undefined, 4));
  return userDataDirectory;
}
