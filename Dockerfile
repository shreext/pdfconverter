FROM node:16

# Install dependencies for LibreOffice and virtual display
RUN apt-get update && \
    apt-get install -y \
    libreoffice \
    xvfb \
    fonts-dejavu-core \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 1000


# Start a virtual display and then run your server
CMD xvfb-run --auto-servernum --server-args='-screen 0 1024x768x24' node server.js