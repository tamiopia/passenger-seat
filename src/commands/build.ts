import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { detectFramework, FrameworkMode } from '../detectors/detect-framework';
import { nodeExpressAdapter } from '../adapters/node-express';
import { reactViteAdapter } from '../adapters/react-vite';
import { nextjsAdapter } from '../adapters/nextjs';

function readNodeVersion(): string {
  const configPath = path.join(process.cwd(), 'passenger-seat.config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.nodeVersion) return config.nodeVersion;
  }
  return '18';
}

export async function buildCommand(options: { mode?: FrameworkMode, dryRun?: boolean }) {
  console.log(chalk.cyan.bold('\n⚙️ Passenger-Seat: Build & Bundle\n'));

  let mode = options.mode;
  if (!mode) {
    const framework = await detectFramework(process.cwd());
    mode = framework.mode;
    console.log(chalk.gray(`Auto-detected framework mode: ${mode}`));
  } else {
    console.log(chalk.gray(`Forced framework mode: ${mode}`));
  }

  if (options.dryRun) {
    console.log(chalk.yellow('\n--dry-run enabled. No files will be modified.\n'));
  }

  const nodeVersion = readNodeVersion();
  const outDir = path.join(process.cwd(), 'passenger-seat-dist');
  if (!options.dryRun && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    switch (mode) {
      case 'node-express':
        await nodeExpressAdapter(outDir, options.dryRun, nodeVersion);
        break;
      case 'react-vite':
      case 'nextjs-static':
        await reactViteAdapter(outDir, options.dryRun, mode);
        break;
      case 'nextjs-ssr':
        await nextjsAdapter(outDir, options.dryRun, nodeVersion);
        break;
      default:
        console.log(chalk.red(`✖ Unknown framework mode: ${mode}`));
        return;
    }
    console.log(chalk.green.bold('\n🎉 Build completed successfully!\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n✖ Build failed:'), error);
  }
}
