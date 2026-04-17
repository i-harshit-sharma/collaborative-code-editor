FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 1. INSTALL TOOLS FIRST (including zsh and sudo)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    curl \
    wget \
    unzip \
    vim \
    zsh \
    ca-certificates \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# 2. CREATE THE USER SECOND
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME -s /bin/zsh \
    && echo "$USERNAME ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set up the working directory
WORKDIR /app
RUN chown -R $USERNAME:$USERNAME /app

# Switch to the non-root user BEFORE creating the venv
USER $USERNAME

# Create a virtual environment owned by the non-root user
RUN python -m venv /app/.venv

# Add the virtual environment to the system PATH
ENV PATH="/app/.venv/bin:$PATH"

# Upgrade pip inside the venv
RUN pip install --upgrade pip

# Create the sample file
RUN echo 'import sys\n\
import datetime\n\
\n\
def main():\n\
    print("=========================================")\n\
    print("🚀 Hello from inside your Docker container!")\n\
    print("=========================================")\n\
    print(f"🐍 Python Version: {sys.version.split()[0]}")\n\
    print(f"🕒 Current Time:   {datetime.datetime.now()}")\n\
    print("=========================================")\n\
\n\
if __name__ == "__main__":\n\
    main()\n\
' > /home/$USERNAME/sample.py
