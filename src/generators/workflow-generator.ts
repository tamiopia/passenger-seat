import * as fs from 'fs';
import * as path from 'path';
import { ConfigOptions } from './config-writer';

export async function generateWorkflow(options: ConfigOptions) {
  const dirPath = path.join(process.cwd(), '.github', 'workflows');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const workflowPath = path.join(dirPath, 'deploy.yml');

  let buildSteps = '';
  const artifactPath = 'passenger-seat-dist/';
  const isStaticMode = options.framework === 'react-vite' || options.framework === 'nextjs-static';

  if (options.framework === 'nextjs-ssr') {
    buildSteps = `
      - name: Install Dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build

      - name: Build Passenger-Seat Bundle
        run: passenger-seat build
`;
  } else if (options.framework === 'nextjs-static') {
    buildSteps = `
      - name: Install Dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build

      - name: Build Passenger-Seat Bundle
        run: passenger-seat build
`;
  } else if (options.framework === 'react-vite') {
    buildSteps = `
      - name: Install Dependencies
        run: npm ci

      - name: Build React App
        run: npm run build
        env:
          CI: false

      - name: Build Passenger-Seat Bundle
        run: passenger-seat build
`;
  } else if (options.framework === 'node-express') {
    buildSteps = `
      - name: Install Dependencies
        run: npm ci

      - name: Build Passenger-Seat Bundle
        run: passenger-seat build
`;
  }

  // Passenger restart is only needed for Node.js modes, not static sites
  const ftpRestartPrep = (options.protocol === 'ftp' && !isStaticMode) ? `
      - name: Prepare Passenger Restart Trigger
        run: |
          mkdir -p ${artifactPath}tmp
          touch ${artifactPath}tmp/restart.txt
` : '';

  const sshRestartStep = !isStaticMode ? `
      - name: Restart Passenger
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: '${options.host}'
          username: '${options.username}'
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            mkdir -p ${options.remotePath}/tmp
            touch ${options.remotePath}/tmp/restart.txt
` : '';

  const deployStep = options.protocol === 'ftp' ? `
      - name: Deploy to cPanel via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: \${{ secrets.FTP_SERVER }}
          username: \${{ secrets.FTP_USERNAME }}
          password: \${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          port: 21
          timeout: 300000
          local-dir: ./${artifactPath}
          server-dir: ${options.remotePath.endsWith('/') ? options.remotePath : options.remotePath + '/'}
          dangerous-clean-slate: false
` : `
      - name: Deploy to cPanel via SFTP
        uses: appleboy/scp-action@v0.1.4
        with:
          host: '${options.host}'
          username: '${options.username}'
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          source: '${artifactPath}*,!node_modules'
          target: '${options.remotePath}'
          strip_components: 1
${sshRestartStep}`;

  const workflowContent = `name: Deploy to cPanel Passenger

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js ${options.nodeVersion}
        uses: actions/setup-node@v3
        with:
          node-version: '${options.nodeVersion}'
          cache: 'npm'

      - name: Install passenger-seat
        run: npm install -g github:tamiopia/passenger-seat
${buildSteps}${ftpRestartPrep}${deployStep}`;

  fs.writeFileSync(workflowPath, workflowContent, 'utf-8');
}
