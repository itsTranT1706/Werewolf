# Nginx Configuration for masoi.online

## Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

## Configure Site

Create site configuration:

```bash
sudo nano /etc/nginx/sites-available/masoi.online
```

Add the following content:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name masoi.online www.masoi.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/masoi.online /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Verify

```bash
sudo systemctl status nginx
```

Visit `http://masoi.online` to verify the frontend is accessible.

