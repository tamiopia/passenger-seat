import * as fs from 'fs';
import * as path from 'path';

export function generateSpaHtaccess(outDir: string) {
  const content = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/x-javascript "access plus 1 month"
  ExpiresByType application/x-shockwave-flash "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresDefault "access plus 2 days"
</IfModule>
`;
  fs.writeFileSync(path.join(outDir, '.htaccess'), content, 'utf-8');
}

export function generatePassengerHtaccess(outDir: string, nodeVersion: string) {
  const content = `# Passenger Configuration
PassengerEnabled on
PassengerAppType node
PassengerStartupFile passenger_entry.js

# V8 Memory Tuning for cPanel LVE
# Prevent OOM kills on 1GB RAM limits
PassengerNodejsArguments "--max-old-space-size=256 --optimize-for-size"
`;
  fs.writeFileSync(path.join(outDir, '.htaccess'), content, 'utf-8');
  fs.writeFileSync(path.join(outDir, '.node-version'), nodeVersion.replace(/\.x$/, ''), 'utf-8');
}
