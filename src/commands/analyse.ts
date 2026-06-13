import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export async function analyseCommand() {
  console.log(chalk.cyan.bold('\n🔍 Passenger-Seat: Bundle Analysis\n'));
  
  const metafilePath = path.join(process.cwd(), 'passenger-seat-dist', 'metafile.json');
  if (!fs.existsSync(metafilePath)) {
    console.log(chalk.red('✖ No metafile.json found. Please run `npx passenger-seat build` first.'));
    return;
  }

  const metafile = JSON.parse(fs.readFileSync(metafilePath, 'utf-8'));
  const outputs = metafile.outputs;

  let totalBytes = 0;
  const heavyModules: { name: string, size: number }[] = [];

  for (const [outputFile, details] of Object.entries<any>(outputs)) {
    if (outputFile.endsWith('.js') || outputFile.endsWith('.jsc')) {
      totalBytes += details.bytes;
      for (const [inputPath, inputDetails] of Object.entries<any>(details.inputs)) {
        if (inputDetails.bytesInOutput > 50000) { // Over 50KB
          heavyModules.push({ name: inputPath, size: inputDetails.bytesInOutput });
        }
      }
    }
  }

  const mb = (totalBytes / (1024 * 1024)).toFixed(2);
  
  console.log(chalk.green(`✓ Total Bundle Size: ${chalk.bold(mb)} MB`));
  
  // Very rough estimation based on Node.js base footprint + bundle
  const estimatedRam = (parseFloat(mb) * 1.5 + 40).toFixed(2);
  console.log(chalk.yellow(`⚠ Estimated Passenger RAM footprint: ~${chalk.bold(estimatedRam)} MB per process`));
  
  if (parseFloat(estimatedRam) > 200) {
    console.log(chalk.red.bold(`\n🚨 WARNING: Estimated RAM is high! This may trigger cPanel LVE OOM kills on shared hosting.`));
  }

  if (heavyModules.length > 0) {
    console.log(chalk.magenta.bold('\n📦 Heavy Modules (>50 KB):'));
    heavyModules
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(mod => {
        const kb = (mod.size / 1024).toFixed(2);
        console.log(chalk.gray(`  - ${mod.name}: `) + chalk.white(`${kb} KB`));
      });
  }
  
  console.log('\n');
}
