import * as fs from 'fs';
import * as path from 'path';
import { FrameworkMode } from '../detectors/detect-framework';

export interface ConfigOptions {
  protocol: 'ssh' | 'ftp';
  host: string;
  username: string;
  remotePath: string;
  nodeVersion: string;
  framework: FrameworkMode;
}

export async function generateConfig(options: ConfigOptions) {
  const configPath = path.join(process.cwd(), 'passenger-seat.config.json');
  fs.writeFileSync(configPath, JSON.stringify(options, null, 2), 'utf-8');
}
