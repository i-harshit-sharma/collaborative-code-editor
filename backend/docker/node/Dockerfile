FROM node:24-slim

# Install core development tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    curl \
    wget \
    unzip \
    vim \
    zsh \
    ca-certificates \
    locales \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g tsx typescript

WORKDIR /app
