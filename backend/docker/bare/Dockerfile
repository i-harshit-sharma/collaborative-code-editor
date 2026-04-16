# syntax=docker/dockerfile:1

FROM ubuntu:22.04

# Feature: Prevent apt from prompting for user input (like timezone selections)
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Feature: Security - Create a non-root user
# Running as root is a security risk. This creates a dedicated user.
RUN useradd -m -s /bin/bash appuser

# Optimization: BuildKit Cache & Smaller Footprint
# 1. --mount=type=cache stores downloaded packages locally so rebuilds are lightning-fast.
# 2. --no-install-recommends prevents installing unnecessary bloated dependencies.
# Feature: Added 'tini' (PID 1 handler), 'ca-certificates' (SSL), and 'tzdata'
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    tzdata \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Feature: Switch to the non-root user we created
USER appuser

# Feature: Proper Process Management
# 'tini' acts as a lightweight init system to handle signals (like Ctrl+C) properly
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["/bin/bash"]