import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { generateNextJsPassengerEntry } from '../generators/passenger-entry-writer';
import { generatePassengerHtaccess } from '../generators/htaccess-generator';

export async function nextjsAdapter(outDir: string, dryRun?: boolean, nodeVersion = '18') {
  console.log(chalk.blue(`\n📦 Adapting Next.js (SSR)...`));

  if (dryRun) {
    console.log(chalk.gray(`[Dry Run] Would generate passenger_entry.js`));
    console.log(chalk.gray(`[Dry Run] Would generate .htaccess for Passenger Next.js bridging`));
    return;
  }

  // Generate passenger_entry.js
  generateNextJsPassengerEntry(outDir);
  console.log(chalk.green(`✓ Generated passenger_entry.js`));

  // Generate .htaccess
  generatePassengerHtaccess(outDir, nodeVersion);
  console.log(chalk.green(`✓ Generated .htaccess with V8 memory flags`));

  // For Next.js SSR, we just prepare these files in passenger-seat-dist.
  // The GitHub action will deploy the .next folder, node_modules (via npm ci --production on server, or bundled),
  // and these passenger entry files.
  
  console.log(chalk.yellow(`⚠ Ensure your GitHub Actions workflow uploads the .next directory.`));
}
