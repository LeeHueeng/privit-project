FROM node:20-slim

WORKDIR /workspace
COPY package.json ./
COPY bin ./bin
COPY src ./src
COPY scripts ./scripts
COPY docs ./docs
ENTRYPOINT ["node", "/workspace/bin/aegis.js"]
CMD ["help"]
