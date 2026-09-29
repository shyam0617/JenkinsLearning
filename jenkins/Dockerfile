# ---- Custom Jenkins image (Jenkins + Docker CLI) ----
# The official Jenkins image has no `docker` command, but our pipeline needs it
# to run `docker build` / `docker run`. So we add the Docker CLI here.
FROM jenkins/jenkins:lts

USER root
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*
# Staying as root keeps this learning setup free of docker.sock permission issues.
