import * as bytenode from 'bytenode';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export async function compileBytecode(jsFilePath: string, dryRun?: boolean) {
  if (dryRun) {
    console.log(chalk.gray(`[Dry Run] Would compile ${jsFilePath} to V8 bytecode (.jsc)`));
    return;
  }

  console.log(chalk.gray(`Compiling V8 bytecode...`));
  const jscFile = jsFilePath.replace(/\.js$/, '.jsc');
  
  await bytenode.compileFile({
    filename: jsFilePath,
    output: jscFile
  });

  // Create a passenger entry that requires the .jsc file
  const entryContent = `require('bytenode');\nrequire('./bundle.jsc');`;
  fs.writeFileSync(path.join(path.dirname(jsFilePath), 'passenger_entry.js'), entryContent, 'utf-8');

  // Optionally remove the original .js file to save space
  fs.unlinkSync(jsFilePath);

  console.log(chalk.green(`✓ Compiled to ${path.basename(jscFile)}`));
}
