# Passenger-Seat

A zero-config deployment adapter that bundles Node.js, React, and Next.js projects into lightweight, memory-optimised artifacts — then wires them directly into cPanel's Phusion Passenger via GitHub Actions CI/CD.

## The Problem
Every Node.js project deployed on shared cPanel suffers from:
1. LVE RAM kills during cold start.
2. Passenger memory spikes on restart.
3. The build step crashing the server itself.
4. The painful manual "enter the virtual environment before running npm" dance.

**Passenger-Seat eliminates all four.**

## Features
- **Auto-detection**: Automatically detects React/Vite, Next.js (SSR or Static), or Node/Express.
- **esbuild tree-shaking**: Eliminates `node_modules` cold-parse RAM spikes by bundling.
- **V8 bytecode compilation**: Compiles bundle to `.jsc`, skipping JS parser on boot.
- **V8 memory cap via .htaccess**: Injects Passenger memory flags to prevent LVE OOM kills.
- **GitHub Actions**: Shifts compilation to GitHub runners (free RAM), deploying only the compiled artifact.

## Installation

```bash
npm install -g passenger-seat
```

## Quick Start

Run this inside your project root:

```bash
npx passenger-seat init
```

This will:
1. Auto-detect your framework.
2. Ask if you have SSH access or only FTP access to your cPanel.
3. Prompt for your cPanel credentials and Node version.
4. Generate `passenger-seat.config.json`.
5. Generate `.github/workflows/deploy.yml`.

Commit the changes, add the required GitHub repository secrets based on your deployment method:

**If using SSH/SFTP:**
- `SSH_PRIVATE_KEY` (Your cPanel SSH private key)

**If using FTP:**
- `FTP_SERVER` (e.g., ftp.example.com)
- `FTP_USERNAME`
- `FTP_PASSWORD`

Finally, push to `main`!

## Commands

- `passenger-seat init`: Initializes configuration and CI workflow.
- `passenger-seat build`: Manually triggers the bundling and compiling process. Use `--dry-run` to preview.
- `passenger-seat analyse`: Analyzes the generated bundle, listing heavy modules and estimating cPanel RAM usage.
