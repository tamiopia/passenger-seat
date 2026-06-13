import * as fs from 'fs';
import * as path from 'path';

export type FrameworkMode = 'nextjs-ssr' | 'nextjs-static' | 'react-vite' | 'node-express';

export interface FrameworkResult {
  name: string;
  mode: FrameworkMode;
}

export async function detectFramework(cwd: string): Promise<FrameworkResult> {
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return { name: 'Node.js (Express)', mode: 'node-express' };
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Next.js
  if (deps['next']) {
    const nextConfigPath = path.join(cwd, 'next.config.js');
    const nextConfigMjsPath = path.join(cwd, 'next.config.mjs');
    let isStatic = false;

    if (fs.existsSync(nextConfigPath)) {
      const configStr = fs.readFileSync(nextConfigPath, 'utf-8');
      if (configStr.includes("output: 'export'") || configStr.includes('output: "export"')) {
        isStatic = true;
      }
    } else if (fs.existsSync(nextConfigMjsPath)) {
      const configStr = fs.readFileSync(nextConfigMjsPath, 'utf-8');
      if (configStr.includes("output: 'export'") || configStr.includes('output: "export"')) {
        isStatic = true;
      }
    }

    if (isStatic) {
      return { name: 'Next.js', mode: 'nextjs-static' };
    }
    return { name: 'Next.js', mode: 'nextjs-ssr' };
  }

  // React / Vite / CRA
  if (deps['react']) {
    if (deps['vite']) {
      return { name: 'React (Vite)', mode: 'react-vite' };
    }
    if (deps['react-scripts']) {
      return { name: 'React (Create React App)', mode: 'react-vite' }; // Handled similarly
    }
  }

  // Fallback to Node.js / Express
  return { name: 'Node.js (Express/Custom)', mode: 'node-express' };
}
