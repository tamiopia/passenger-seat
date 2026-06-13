import * as esbuild from 'esbuild';
import * as fs from 'fs';
import chalk from 'chalk';
import * as path from 'path';

export async function compileNodeBundle(entryPoint: string, outDir: string, dryRun?: boolean) {
  if (dryRun) {
    console.log(chalk.gray(`[Dry Run] Would compile ${entryPoint} with esbuild`));
    return;
  }

  const outfile = path.join(outDir, 'bundle.js');
  
  console.log(chalk.gray(`Bundling with esbuild...`));
  
  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    target: 'node18', // Matches common cPanel version
    outfile: outfile,
    minify: true,
    treeShaking: true,
    metafile: true,
    // external: [] // We bundle everything so there is no node_modules parse overhead
  }).then(result => {
    fs.writeFileSync(path.join(outDir, 'metafile.json'), JSON.stringify(result.metafile));
  });

  console.log(chalk.green(`✓ Created bundle.js`));
  return outfile;
}
