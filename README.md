# Mindmap

## Requisitos

- Docker
- Docker Compose

## Como rodar

```bash
# 1. Clone o repositório
git clone <repo>
cd mindmap

# 2. Copie o arquivo .env
cp .env.example .env

# 3. Suba os containers
./sail up -d

# 4. Instale as dependências
./sail composer install

# 5. Reinicie os containers (necessário após primeiro install)
./sail restart

# 6. Gere a chave da aplicação
./sail artisan key:generate

# 7. Rode as migrations
./sail artisan migrate
```

## Acessar a aplicação

- App: http://localhost
- MySQL: localhost:3306
- Redis: localhost:6379

## Comandos úteis

```bash
# Parar containers
./sail down

# Reiniciar containers
./sail restart

# Ver logs
./sail logs

# Acessar shell do container
./sail shell

# Rodar testes
./sail test

# Rodar migrations
./sail artisan migrate

# Rodar seeders
./sail artisan db:seed
```
