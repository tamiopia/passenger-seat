import prompts from 'prompts';
import chalk from 'chalk';
import { detectFramework } from '../detectors/detect-framework';
import { generateConfig } from '../generators/config-writer';
import { generateWorkflow } from '../generators/workflow-generator';

export async function initCommand() {
  console.log(chalk.cyan.bold('\n🚀 Welcome to Passenger-Seat Init!\n'));

  // 1. Detect Framework
  const framework = await detectFramework(process.cwd());
  console.log(chalk.green(`✓ Detected Framework: ${chalk.bold(framework.name)} (${framework.mode})`));

  // 2. Interactive Prompts
  const protocolResponse = await prompts([
    {
      type: 'select',
      name: 'protocol',
      message: 'Choose Deployment Protocol',
      choices: [
        { title: 'SSH / SFTP (Recommended - Requires cPanel SSH access)', value: 'ssh' },
        { title: 'FTP (For restricted cPanel accounts without SSH)', value: 'ftp' }
      ]
    }
  ]);

  if (!protocolResponse.protocol) {
    console.log(chalk.red('\n✖ Initialization aborted.'));
    return;
  }

  const isFtp = protocolResponse.protocol === 'ftp';

  const response = await prompts([
    {
      type: 'text',
      name: 'host',
      message: isFtp ? 'FTP Server (e.g., ftp.example.com)' : 'cPanel SSH Hostname or IP (e.g., example.com)',
      validate: value => value.length > 0 ? true : 'Hostname is required'
    },
    {
      type: 'text',
      name: 'username',
      message: isFtp ? 'FTP Username' : 'cPanel SSH Username',
      validate: value => value.length > 0 ? true : 'Username is required'
    },
    {
      type: 'text',
      name: 'remotePath',
      message: isFtp ? 'Remote path on FTP (e.g., /repositories/my-app)' : 'Remote path on cPanel (e.g., /home/user/repositories/my-app)',
      validate: value => value.length > 0 ? true : 'Path is required'
    },
    {
      type: 'text',
      name: 'nodeVersion',
      message: 'Target Node.js Version on cPanel (crucial for Passenger & bytecode)',
      initial: '18.x'
    }
  ]);

  if (!response.host || !response.username || !response.remotePath || !response.nodeVersion) {
    console.log(chalk.red('\n✖ Initialization aborted.'));
    return;
  }

  // Strip protocol prefix and trailing slashes from host (users often paste full URLs)
  const host = response.host.replace(/^https?:\/\//, '').replace(/\/+$/, '');

  // 3. Write Config
  await generateConfig({
    protocol: protocolResponse.protocol,
    host,
    username: response.username,
    remotePath: response.remotePath,
    nodeVersion: response.nodeVersion,
    framework: framework.mode
  });
  console.log(chalk.green('\n✓ Created passenger-seat.config.json'));

  // 4. Generate GitHub Actions Workflow
  await generateWorkflow({
    protocol: protocolResponse.protocol,
    nodeVersion: response.nodeVersion,
    framework: framework.mode,
    remotePath: response.remotePath,
    username: response.username,
    host,
  });
  console.log(chalk.green('✓ Created .github/workflows/deploy.yml'));

  console.log(chalk.cyan.bold('\n🎉 Initialization complete!'));
  console.log(chalk.gray(`Next steps:`));
  
  if (isFtp) {
    console.log(chalk.gray(`1. Add ${chalk.white('FTP_SERVER')}, ${chalk.white('FTP_USERNAME')}, and ${chalk.white('FTP_PASSWORD')} secrets to your GitHub repository.`));
  } else {
    console.log(chalk.gray(`1. Add ${chalk.white('SSH_PRIVATE_KEY')} secret to your GitHub repository.`));
  }
  
  console.log(chalk.gray(`2. Run ${chalk.white('npx passenger-seat build')} to test bundling locally.`));
  console.log(chalk.gray(`3. Push to GitHub to trigger your first deploy.\n`));
}
