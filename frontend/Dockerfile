# Use Nginx as the base image to serve static files
FROM nginx:alpine

# Copy our HTML/CSS/JS files into Nginx's default folder
COPY . /usr/share/nginx/html

# Copy our custom Nginx config (for the API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf
