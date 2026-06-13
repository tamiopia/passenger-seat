#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';
import { analyseCommand } from './commands/analyse';

const program = new Command();

program
  .name('passenger-seat')
  .description('A zero-config deployment adapter for Node.js, React, and Next.js to cPanel via Passenger')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize passenger-seat configuration in your project')
  .action(initCommand);

program
  .command('build')
  .description('Build and bundle the project for cPanel deployment')
  .option('-m, --mode <mode>', 'Force a specific framework mode (e.g., nextjs-ssr, node-express, react-vite)')
  .option('--dry-run', 'Print what would be done without actually modifying or deploying anything')
  .action(buildCommand);

program
  .command('analyse')
  .description('Analyse the project bundle and estimate cPanel RAM usage')
  .action(analyseCommand);

program.parse(process.argv);
