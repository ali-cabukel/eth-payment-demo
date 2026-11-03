# ETH Payment Demo: local test blockchain + contract + web page in one container.
FROM node:22-slim

ENV NODE_ENV=production \
    HARDHAT_DISABLE_TELEMETRY_PROMPT=true \
    PORT=8080

WORKDIR /app

# Hardhat is a devDependency but we need it at runtime (it runs the chain).
COPY package.json package-lock.json ./
RUN npm ci --include=dev && npm cache clean --force

COPY hardhat.config.js ./
COPY contracts ./contracts
COPY scripts ./scripts
COPY web ./web

# Compile now, so the container doesn't download the Solidity compiler at startup.
RUN npx hardhat compile && chown -R node:node /app

USER node
EXPOSE 8080
CMD ["node", "scripts/start.js"]
