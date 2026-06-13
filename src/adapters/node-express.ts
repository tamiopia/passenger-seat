import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { compileNodeBundle } from '../utils/compiler';
import { compileBytecode } from '../utils/bytecode';
import { transformLazyRoutes } from '../utils/lazy-routes';
import { generatePassengerHtaccess } from '../generators/htaccess-generator';

export async function nodeExpressAdapter(outDir: string, dryRun?: boolean, nodeVersion = '18') {
  console.log(chalk.blue(`\n📦 Adapting Node.js / Express project...`));

  // Determine entry point (e.g., src/index.js, app.js, server.js)
  let entryPoint = 'src/index.js';
  const possibleEntries = ['src/index.ts', 'src/index.js', 'app.js', 'server.js', 'index.js'];
  for (const entry of possibleEntries) {
    if (fs.existsSync(path.join(process.cwd(), entry))) {
      entryPoint = entry;
      break;
    }
  }

  console.log(chalk.gray(`Using entry point: ${entryPoint}`));

  await transformLazyRoutes(entryPoint, dryRun);
  
  const bundlePath = await compileNodeBundle(entryPoint, outDir, dryRun);
  
  if (bundlePath) {
    await compileBytecode(bundlePath, dryRun);
  }

  if (!dryRun) {
    generatePassengerHtaccess(outDir, nodeVersion);
    console.log(chalk.green(`✓ Generated .htaccess with V8 memory flags`));
  }
}
