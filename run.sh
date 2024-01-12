#!/usr/bin/env bash
# Build a docker image
docker build -t micrograal .
# Start a container, map port 3000 (where Graal MVP connects)
docker run -it -p 3000:3000  micrograal:latest