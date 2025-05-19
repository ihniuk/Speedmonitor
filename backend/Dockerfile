FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Install librespeed-cli for AMD64
RUN apt-get update && apt-get install -y curl tar &&     curl -fsSL https://github.com/librespeed/speedtest-cli/releases/download/v1.0.11/librespeed-cli_1.0.11_linux_amd64.tar.gz -o /tmp/librespeed-cli.tar.gz &&     tar -xzf /tmp/librespeed-cli.tar.gz -C /usr/local/bin &&     chmod +x /usr/local/bin/librespeed-cli &&     rm /tmp/librespeed-cli.tar.gz

EXPOSE 5000
CMD ["node", "index.js"]
