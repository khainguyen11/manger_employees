FROM node:22



WORKDIR /usr/src/app

# Copy package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng
RUN npm run build

# Mở cổng ứng dụng
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "run", "start:prod"]
