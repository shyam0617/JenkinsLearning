# ---- Custom Jenkins image (Jenkins + Docker CLI + Node.js) ----
# The official Jenkins image has no `docker` command (needed for `docker build`/
# `docker run`) and no `node`/`npm` (needed by the Install/Test stages). We add
# both here so the pipeline can run entirely inside the Jenkins container.
FROM jenkins/jenkins:lts

USER root
RUN apt-get update && \
    apt-get install -y docker.io curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*
# Staying as root keeps this learning setup free of docker.sock permission issues.
