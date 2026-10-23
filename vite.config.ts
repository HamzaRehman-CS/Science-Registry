import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

function localApplicationsApiPlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'data');
  const dataFile = path.resolve(dataDir, 'applications.json');

  return {
    name: 'local-applications-api-plugin',
    configureServer(server) {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify([]));
      }

      server.middlewares.use('/api/applications', (req, res, next) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          try {
            const raw = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf-8') : '[]';
            res.setHeader('Content-Type', 'application/json');
            res.end(raw || '[]');
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newApp = JSON.parse(body);
              let list: any[] = [];
              if (fs.existsSync(dataFile)) {
                try {
                  list = JSON.parse(fs.readFileSync(dataFile, 'utf-8') || '[]');
                } catch (e) {}
              }

              // Filter out any dummy seed data
              list = list.filter((a: any) => !a.id?.startsWith('dsc-seed-'));

              // Deduplicate by registration_number
              const regKey = (newApp.registration_number || '').trim().toLowerCase();
              if (regKey) {
                list = list.filter((a: any) => (a.registration_number || '').trim().toLowerCase() !== regKey);
              }
              list.unshift(newApp);

              fs.writeFileSync(dataFile, JSON.stringify(list, null, 2));

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: list.length }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          try {
            const url = new URL(req.url || '', 'http://localhost');
            const id = url.searchParams.get('id');
            if (id && fs.existsSync(dataFile)) {
              let list = JSON.parse(fs.readFileSync(dataFile, 'utf-8') || '[]');
              list = list.filter((a: any) => a.id !== id);
              fs.writeFileSync(dataFile, JSON.stringify(list, null, 2));
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApplicationsApiPlugin()],
  server: {
    host: true, // Exposes on local network so other devices can connect
    port: 5173
  },
  build: {
    chunkSizeWarningLimit: 1500
  }
});
