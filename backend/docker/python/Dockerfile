FROM python:3.9-slim

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

WORKDIR /app
