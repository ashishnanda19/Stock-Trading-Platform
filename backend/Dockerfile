FROM ubuntu

RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["node", "index.js"]
