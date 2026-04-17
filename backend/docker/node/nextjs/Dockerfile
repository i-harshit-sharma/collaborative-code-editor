FROM node:24-slim

ENV WATCHPACK_POLLING=true

WORKDIR /app

# 1. Scaffolding Phase: Run as root to bypass system permission restrictions
RUN npx create-next-app@latest . \
    --ts \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --import-alias "@/*" \
    --use-npm

# 2. Permission Phase: Transfer ownership of the newly created files to the 'node' user
RUN chown -R node:node /app

# 3. Runtime Phase: Safely switch down to the non-root user
USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]