# Instalação na EC2 (Ubuntu/Debian)

## 1. Adicionar repositório do PHP

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
```

## 2. Atualizar sistema e instalar dependências

```bash
sudo apt upgrade -y
sudo apt install -y nginx php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-bcmath php8.2-redis unzip git curl redis-server
```

## 3. Instalar Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

## 4. Instalar Node.js 22.x

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## 5. Clonar e configurar aplicação

```bash
cd /home/ubuntu
git clone https://github.com/nhsaraiva-code/mindsource.git mindsource
cd mindsource
```

## 6. Instalar dependências

```bash
composer install --optimize-autoloader --no-dev
npm install
npm run build
```

## 7. Configurar ambiente

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env`:
```bash
nano .env
```

Configure as variáveis de ambiente (principalmente banco de dados e Redis).

## 8. Executar migrations

```bash
php artisan migrate --force
php artisan storage:link
php artisan route:cache
php artisan view:cache
```

## 9. Configurar permissões

```bash
# Adicionar www-data ao grupo ubuntu
sudo usermod -a -G ubuntu www-data

# Permitir grupo acessar a home do ubuntu
chmod 755 /home/ubuntu

# Configurar permissões da aplicação
chmod -R 755 /home/ubuntu/mindsource

# Storage e cache precisam de escrita para www-data
chmod -R 775 /home/ubuntu/mindsource/storage
chmod -R 775 /home/ubuntu/mindsource/bootstrap/cache

# Garantir que novos arquivos herdam permissões de grupo
chgrp -R ubuntu /home/ubuntu/mindsource
chmod g+s /home/ubuntu/mindsource/storage
chmod g+s /home/ubuntu/mindsource/bootstrap/cache
```

## 10. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/mindsource
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /home/ubuntu/mindsource/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/mindsource /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 11. Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Atualização da aplicação

```bash
cd /home/ubuntu/mindsource
git pull
composer install --optimize-autoloader --no-dev
npm install
npm run build
php artisan migrate --force
php artisan route:cache
php artisan view:cache
sudo systemctl restart php8.2-fpm
```

## Troubleshooting

### Verificar logs
```bash
# Logs do Laravel
tail -f /home/ubuntu/mindsource/storage/logs/laravel.log

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Logs do PHP-FPM
sudo tail -f /var/log/php8.2-fpm.log
```

### Limpar cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Permissões
```bash
chmod -R 755 /home/ubuntu/mindsource
chmod -R 775 /home/ubuntu/mindsource/storage
chmod -R 775 /home/ubuntu/mindsource/bootstrap/cache
chgrp -R ubuntu /home/ubuntu/mindsource
```
