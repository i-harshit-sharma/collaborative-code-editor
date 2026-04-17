/**
 * Centralized configuration for VM templates, including Docker images
 * and their default exposed ports.
 */
export const vmTemplates = {
  'python': { image: 'code-collab-python-executor', ports: [8000] },
  'javascript': { image: 'code-collab-node-executor', ports: [3000] },
  'typescript': { image: 'code-collab-node-executor', ports: [3000] },
  'cpp': { image: 'code-collab-cpp-executor', ports: [] },
  'java': { image: 'code-collab-java-executor', ports: [] },
  'flask': { image: 'code-collab-python-flask-executor', ports: [5000] },
  'fastapi': { image: 'code-collab-python-fastapi-executor', ports: [8000] },
  'django': { image: 'code-collab-python-django-executor', ports: [8000] },
  'express': { image: 'code-collab-node-express-executor', ports: [3000] },
  'react-vite': { image: 'code-collab-node-vite-react-executor', ports: [5173, 4173] },
  'spring-boot': { image: 'code-collab-java-spring-boot-executor', ports: [8080] },
  'cpp-cmake': { image: 'code-collab-cpp-cmake-executor', ports: [] },
  'bare': { image: 'code-collab-bare-machine-executor', ports: [3000, 5000, 8080] },
  'nextjs': { image: 'code-collab-nextjs-executor', ports: [3000] }
};
