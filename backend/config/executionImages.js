export const executionImages = [
  {
    name: 'code-collab-node-executor',
    dockerfile: 'docker/node/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-python-executor',
    dockerfile: 'docker/python/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-cpp-executor',
    dockerfile: 'docker/cpp/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-java-executor',
    dockerfile: 'docker/java/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-python-flask-executor',
    dockerfile: 'docker/python/flask/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-python-fastapi-executor',
    dockerfile: 'docker/python/fastapi/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-python-django-executor',
    dockerfile: 'docker/python/django/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-node-express-executor',
    dockerfile: 'docker/node/express/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-node-vite-react-executor',
    dockerfile: 'docker/node/vite-react/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-java-spring-boot-executor',
    dockerfile: 'docker/java/spring-boot/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-cpp-cmake-executor',
    dockerfile: 'docker/cpp/cmake/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'code-collab-bare-machine-executor',
    dockerfile: 'docker/bare/Dockerfile',
    context: '.',
    type: 'build'
  },
  {
    name: 'alpine/git:latest',
    type: 'pull'
  }
];
