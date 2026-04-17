import { spawn } from 'child_process';

export const searchFiles = async (req, res) => {
  const { term, container } = req.query;

  if (!term || !container) {
    return res.status(400).json({ error: 'Search term and container name/id are required' });
  }

  // Optimized grep command with exclusions and match limit
  const grepArgs = [
    'exec', container, 'bash', '-lc',
    `grep -riI --color=never -m 1000 --exclude-dir={node_modules,.git,vendor,dist,build,public} '${term}' /app 2>/dev/null`
  ];

  const child = spawn('docker', grepArgs);

  let stdout = '';
  let stderr = '';
  let totalData = 0;
  const MAX_DATA = 10 * 1024 * 1024; // 10MB safety cap

  child.stdout.on('data', (data) => {
    totalData += data.length;
    if (totalData > MAX_DATA) {
      console.warn(`Search results for ${term} exceeded safety limit. Truncating.`);
      child.kill();
      return;
    }
    stdout += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  child.on('close', (code) => {
    // code 1 means no matches, which is fine
    if (code !== 0 && code !== 1) {
      console.error(`Search process exited with code ${code}: ${stderr}`);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Search failed', details: stderr });
      }
      return;
    }

    const lines = stdout.trim().split('\n').filter(Boolean).map(line => {
      const firstColon = line.indexOf(':');
      if (firstColon === -1) return null;
      
      const filePath = line.substring(0, firstColon);
      let match = line.substring(firstColon + 1).trim();

      // Truncate extremely long lines (e.g. minified files)
      if (match.length > 300) {
        match = match.substring(0, 300) + '... (truncated)';
      }

      return {
        file: filePath,
        match: match,
      };
    }).filter(Boolean);

    if (!res.headersSent) {
      res.json({ matches: lines });
    }
  });

  child.on('error', (err) => {
    console.error('Failed to start search process:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start search process' });
    }
  });
};
