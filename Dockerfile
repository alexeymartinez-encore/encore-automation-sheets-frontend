# # ============================================= DEVELOPMENT ===============================================
# # Use the latest LTS version of Node.js
# FROM node:18-alpine

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package.json
# COPY package.json /app

# # Install Dependencies
# RUN npm install

# # Copy the rest of app files
# COPY . /app

# # Expose the port your app runs on
# EXPOSE 5173

# # Define command to run your app
# CMD ["npm","run","dev"]

# ============================================= PRODUCTION ===============================================
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Production stage with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
