import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { generateSpaHtaccess } from '../generators/htaccess-generator';

export async function reactViteAdapter(outDir: string, dryRun?: boolean, mode?: string) {
  console.log(chalk.blue(`\n📦 Adapting Static SPA (${mode})...`));

  // Determine standard build output directories
  let buildDir = 'dist';
  if (fs.existsSync(path.join(process.cwd(), 'build'))) {
    buildDir = 'build';
  } else if (fs.existsSync(path.join(process.cwd(), 'out')) && mode === 'nextjs-static') {
    buildDir = 'out';
  }

  if (dryRun) {
    console.log(chalk.gray(`[Dry Run] Would copy static assets from ./${buildDir} to ./${path.basename(outDir)}`));
    console.log(chalk.gray(`[Dry Run] Would generate SPA .htaccess with cache headers`));
    return;
  }

  if (!fs.existsSync(path.join(process.cwd(), buildDir))) {
    console.log(chalk.red(`✖ Build directory '${buildDir}' not found. Did you forget to run 'npm run build'?`));
    return;
  }

  // Copy build dir to outDir
  fs.cpSync(path.join(process.cwd(), buildDir), outDir, { recursive: true });
  console.log(chalk.green(`✓ Copied static assets to ${path.basename(outDir)}`));

  generateSpaHtaccess(outDir);
  console.log(chalk.green(`✓ Generated .htaccess for SPA routing and Cache headers`));
  
  console.log(chalk.green(`✓ Passenger will NOT wake up for this deployment. 0 MB Node RAM usage.`));
}
