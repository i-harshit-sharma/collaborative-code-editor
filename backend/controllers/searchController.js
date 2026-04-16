import { exec } from 'child_process';

export const searchFiles = async (req, res) => {
  const { term, container } = req.query;

  if (!term || !container) {
    return res.status(400).json({ error: 'Search term and container name/id are required' });
  }

  const cmd = `docker exec ${container} bash -lc "grep -riI --color=never '${term}' /app 2>/dev/null"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }

    const lines = stdout.trim().split('\n').filter(Boolean).map(line => {
      const [filePath, ...rest] = line.split(':');
      return {
        file: filePath,
        match: rest.join(':').trim(),
      };
    });

    res.json({ matches: lines });
  });
};
