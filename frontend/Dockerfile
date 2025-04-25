# Base image
FROM ubuntu:22.04

# Prevents interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Install essential packages
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    g++ \
    cmake \
    make \
    clang \
    gdb \
    lldb \
    valgrind \
    git \
    curl \
    wget \
    nano \
    zsh \
    tmux \
    htop \
    neofetch \
    lcov \
    pkg-config \
    unzip \
    python3 \
    python3-pip \
    tzdata \
    locales && \
    # Set timezone
    ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    # Clean up
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Optional: Set zsh as default shell
RUN chsh -s /bin/zsh

# Create a non-root user for development (optional but recommended)
ARG USERNAME=devuser
ARG UID=1000
RUN useradd -m -s /bin/zsh -u $UID $USERNAME && \
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Switch to the new user
USER $USERNAME
WORKDIR /home/$USERNAME

# Optional: Copy your C++ source code or initialize a project
# COPY . .

# Launch tmux or zsh by default
CMD ["zsh"]
