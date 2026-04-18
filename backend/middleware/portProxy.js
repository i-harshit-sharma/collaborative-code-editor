import httpProxy from 'http-proxy';
import docker, { isRunningInDocker } from '../config/docker.js';

const proxy = httpProxy.createProxyServer({});

/**
 * Helper to determine the proxy target URL.
 * In Docker environments, it uses the container's internal IP.
 * In local environments, it uses 127.0.0.1 and the mapped HostPort.
 */
const getProxyTarget = (info, port) => {
  if (isRunningInDocker()) {
    const networks = info.NetworkSettings.Networks;
    const networkNames = Object.keys(networks);
    
    // Find the first network that has an IP address assigned
    let containerIp = info.NetworkSettings.IPAddress;
    for (const name of networkNames) {
      if (networks[name].IPAddress) {
        containerIp = networks[name].IPAddress;
        break;
      }
    }

    if (!containerIp) {
      console.warn(`No IP address found for container ${info.Id} on any network.`);
      return null;
    }

    return `http://${containerIp}:${port}`;
  } else {
    const portMapping = info.NetworkSettings.Ports[`${port}/tcp`];
    if (portMapping && portMapping.length > 0) {
      return `http://127.0.0.1:${portMapping[0].HostPort}`;
    }
  }
  return null;
};

// Error handling for proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err.message);
  if (res && !res.headersSent) {
    let status = 502;
    let message = 'The proxy failed to connect to the VM service.';
    
    if (err.code === 'ECONNREFUSED' || err.message.includes('socket hang up')) {
      message = 'Connection refused. Is your server running inside the VM? Make sure it is listening on 0.0.0.0 and the port matches.';
    }

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'VM Connection Failed', 
      message,
      technical: err.message 
    }));
  }
});

/**
 * Middleware to proxy requests to dynamic ports inside Docker containers.
 * Route: /proxy/:vmId/:port/*
 */
export const handlePortProxy = async (req, res) => {
  const { vmId, port } = req.params;
  
  if (!vmId || !port) {
    return res.status(400).json({ error: 'Missing vmId or port' });
  }

  try {
    const container = docker.getContainer(vmId);
    const info = await container.inspect();
    
    const target = getProxyTarget(info, port);
    
    if (!target) {
      console.error(`Could not determine target for container ${vmId} on port ${port}`);
      return res.status(404).json({ 
        error: 'Target unreachable', 
        message: `The port ${port} is not accessible. If running in Docker, ensure the containers are on the same network.`
      });
    }

    // Strip the /proxy/:vmId/:port prefix from the URL
    // e.g. /proxy/123/3000/api/data -> /api/data
    const prefix = `/proxy/${vmId}/${port}`;
    const newPath = req.url.startsWith(prefix) ? req.url.slice(prefix.length) : req.url;
    
    // Set cookie to remember the context for absolute paths
    res.cookie('LAST_VM_PORT', `${vmId}:${port}`, { path: '/', maxAge: 3600000 }); // 1 hour

    req.url = newPath || '/';
    
    // Log the proxy action
    console.log(`🌐 Proxying ${req.method} ${req.url} -> ${target}`);

    proxy.web(req, res, { 
      target,
      changeOrigin: true,
      xfwd: true,
      ws: true
    });

  } catch (err) {
    console.error('Proxy Setup Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Proxy Error', message: err.message });
    }
  }
};

/**
 * Handler for WebSocket upgrades on the proxy route.
 */
export const handlePortProxyUpgrade = async (req, socket, head) => {
  // Path follows: /proxy/:vmId/:port/*
  const parts = req.url.split('/');
  if (parts.length < 4) return;

  const vmId = parts[2];
  const port = parts[3];

  try {
    const container = docker.getContainer(vmId);
    const info = await container.inspect();
    const target = getProxyTarget(info, port);

    if (target) {

      // Rewrite URL
      const prefix = `/proxy/${vmId}/${port}`;
      req.url = req.url.startsWith(prefix) ? req.url.slice(prefix.length) : req.url;
      if (!req.url) req.url = '/';

      console.log(`🔌 Proxying WS Upgrade ${req.url} -> ${target}`);

      proxy.ws(req, socket, head, { 
        target,
        changeOrigin: true,
        xfwd: true
      });
    }
  } catch (err) {
    console.error('Proxy WS Upgrade Error:', err.message);
    socket.destroy();
  }
};
