# Documentação Inicial - Projeto MindMap

Esta documentação descreve todo o processo de configuração e desenvolvimento inicial do projeto MindMap, desde a instalação do Laravel até a tradução completa para PT-BR.

---

## Índice

1. [Instalação e Configuração Inicial](#1-instalação-e-configuração-inicial)
2. [Configuração de Volumes Locais](#2-configuração-de-volumes-locais)
3. [Independência do Vendor](#3-independência-do-vendor)
4. [Instalação do Laravel Breeze com React](#4-instalação-do-laravel-breeze-com-react)
5. [Tradução para PT-BR](#5-tradução-para-pt-br)
6. [Estrutura do Projeto Mind Map](#6-estrutura-do-projeto-mind-map)
7. [Comandos Úteis](#7-comandos-úteis)

---

## 1. Instalação e Configuração Inicial

### 1.1 Instalação do Laravel com Sail

O projeto foi iniciado utilizando o **Laravel Sail**, que é o ambiente de desenvolvimento Docker oficial do Laravel.

**Comando utilizado:**
```bash
curl -s "https://laravel.build/mindmap-temp?with=mysql,redis" | bash
```

**Resultado:**
- Laravel 12.35.1 instalado
- PHP 8.4
- MySQL 8.0
- Redis Alpine
- Migrations executadas automaticamente

### 1.2 Ambiente Docker

O Laravel Sail criou automaticamente:
- `compose.yaml` (posteriormente renomeado para `docker-compose.yml`)
- Container para aplicação Laravel
- Container MySQL
- Container Redis
- Container Mailpit (para testes de e-mail)

**Serviços configurados:**
- **laravel.test**: Aplicação principal (porta 80)
- **mysql**: Banco de dados (porta 3306)
- **redis**: Cache/Queue (porta 6379)
- **mailpit**: Interface de e-mail (porta 8025)

---

## 2. Configuração de Volumes Locais

### 2.1 Motivação

Por padrão, o Laravel Sail usa volumes nomeados do Docker. Para ter mais controle sobre os dados e facilitar backups, alteramos para volumes locais.

### 2.2 Mudanças Realizadas

**Criação da estrutura de diretórios:**
```bash
mkdir -p ./volumes/mysql
mkdir -p ./volumes/redis
```

**Atualização do .gitignore:**
```
/vendor
/volumes
Homestead.json
```

**Modificação do docker-compose.yml:**

Antes:
```yaml
volumes:
  - 'sail-mysql:/var/lib/mysql'
```

Depois:
```yaml
volumes:
  - './volumes/mysql:/var/lib/mysql'
```

O mesmo foi feito para o Redis:
```yaml
volumes:
  - './volumes/redis:/data'
```

**Remoção da seção volumes:**
A seção `volumes:` que definia volumes nomeados foi completamente removida do arquivo.

---

## 3. Independência do Vendor

### 3.1 Problema Identificado

Inicialmente, o `docker-compose.yml` tinha uma dependência do diretório `vendor/`:

```yaml
context: './vendor/laravel/sail/runtimes/8.4'
```

Isso significava que o projeto **não funcionaria** sem executar `composer install` primeiro, criando uma dependência circular.

### 3.2 Solução Implementada

**Passo 1: Copiar Dockerfile para o projeto**
```bash
cp -r vendor/laravel/sail/runtimes/8.4 docker/8.4/
cp vendor/laravel/sail/database/mysql/create-testing-database.sh docker/mysql/
```

**Passo 2: Atualizar docker-compose.yml**
```yaml
laravel.test:
  build:
    context: './docker/8.4'  # Caminho independente
    dockerfile: Dockerfile
```

```yaml
- './docker/mysql/create-testing-database.sh:/docker-entrypoint-initdb.d/10-create-testing-database.sh'
```

**Passo 3: Renomear compose.yaml**
```bash
mv compose.yaml docker-compose.yml
```

**Passo 4: Criar script ./sail**
Um script executável foi criado na raiz do projeto para permitir o uso do Sail sem o vendor:

```bash
chmod +x sail
```

### 3.3 Teste de Independência

Para verificar que tudo funciona sem vendor:
```bash
rm -rf vendor/
./sail up -d           # Funciona!
./sail composer install # Restaura dependências
./sail restart         # Reinicia containers
```

### 3.4 Configuração Adicional no .env

Para eliminar warnings do MySQL:
```env
MYSQL_EXTRA_OPTIONS=
```

---

## 4. Instalação do Laravel Breeze com React

### 4.1 O que é Laravel Breeze

Laravel Breeze é um pacote oficial de autenticação que fornece:
- Login/Registro
- Recuperação de senha
- Verificação de e-mail
- Gerenciamento de perfil
- Interface moderna com React + Inertia.js

### 4.2 Processo de Instalação

**Passo 1: Instalar Breeze**
```bash
./sail composer require laravel/breeze --dev
```

**Passo 2: Instalar Stack React**
```bash
./sail artisan breeze:install react
```

**Resultado:**
- 266 pacotes NPM instalados
- Componentes React criados em `resources/js/`
- Layouts e páginas de autenticação
- Inertia.js configurado
- Ziggy instalado (rotas Laravel no JavaScript)

**Passo 3: Build dos Assets**
```bash
./sail npm run build
```

**Passo 4: Executar Migrations**
```bash
./sail artisan migrate
```

### 4.3 Dependências Instaladas

**PHP (composer.json):**
- `laravel/breeze: ^2.3`
- `inertiajs/inertia-laravel: ^2.0`
- `laravel/sanctum: ^4.0`
- `tightenco/ziggy: ^2.0`

**JavaScript (package.json):**
- React
- Vite
- TailwindCSS
- HeadlessUI
- Inertia.js

### 4.4 Estrutura de Arquivos Criada

```
resources/js/
├── Components/
│   ├── ApplicationLogo.jsx
│   ├── Checkbox.jsx
│   ├── DangerButton.jsx
│   ├── Dropdown.jsx
│   ├── InputError.jsx
│   ├── InputLabel.jsx
│   ├── Modal.jsx
│   ├── NavLink.jsx
│   ├── PrimaryButton.jsx
│   ├── ResponsiveNavLink.jsx
│   ├── SecondaryButton.jsx
│   └── TextInput.jsx
├── Layouts/
│   ├── AuthenticatedLayout.jsx
│   └── GuestLayout.jsx
├── Pages/
│   ├── Auth/
│   │   ├── ConfirmPassword.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   └── VerifyEmail.jsx
│   ├── Profile/
│   │   ├── Edit.jsx
│   │   └── Partials/
│   │       ├── DeleteUserForm.jsx
│   │       ├── UpdatePasswordForm.jsx
│   │       └── UpdateProfileInformationForm.jsx
│   ├── Dashboard.jsx
│   └── Welcome.jsx
└── app.jsx
```

---

## 5. Tradução para PT-BR

### 5.1 Arquivos de Idioma do Laravel

**Passo 1: Publicar arquivos de tradução**
```bash
./sail artisan lang:publish
```

**Passo 2: Criar diretório pt_BR**
```bash
mkdir -p lang/pt_BR
```

**Arquivos criados:**

#### lang/pt_BR/auth.php
Mensagens de autenticação:
- "Essas credenciais não correspondem aos nossos registros."
- "A senha fornecida está incorreta."
- "Muitas tentativas de login..."

#### lang/pt_BR/pagination.php
Textos de paginação:
- "Anterior"
- "Próximo"

#### lang/pt_BR/passwords.php
Mensagens de redefinição de senha:
- "Sua senha foi redefinida."
- "Enviamos seu link de redefinição de senha por e-mail."
- etc.

#### lang/pt_BR/validation.php
Todas as regras de validação traduzidas (200+ mensagens):
- "O campo :attribute é obrigatório."
- "O campo :attribute deve ser um e-mail válido."
- Validações específicas para arrays, arquivos, números, strings, etc.

### 5.2 Configuração do Locale

**Arquivo: config/app.php**

```php
'locale' => env('APP_LOCALE', 'pt_BR'),
'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),
'faker_locale' => env('APP_FAKER_LOCALE', 'pt_BR'),
'timezone' => env('APP_TIMEZONE', 'America/Sao_Paulo'),
```

### 5.3 Tradução dos Componentes React

Todos os componentes foram traduzidos manualmente:

#### Páginas de Autenticação

**Login.jsx:**
- "Entrar" (título e botão)
- "Email"
- "Senha"
- "Lembrar-me"
- "Esqueceu sua senha?"

**Register.jsx:**
- "Registrar" (título e botão)
- "Nome"
- "Email"
- "Senha"
- "Confirmar Senha"
- "Já está registrado?"

**ForgotPassword.jsx:**
- "Esqueceu a Senha"
- "Esqueceu sua senha? Sem problema..."
- "Enviar Link de Redefinição"

**VerifyEmail.jsx:**
- "Verificação de E-mail"
- "Obrigado por se cadastrar! Antes de começar..."
- "Reenviar E-mail de Verificação"
- "Sair"

#### Dashboard e Navegação

**Dashboard.jsx:**
- "Painel"
- "Você está logado!"

**AuthenticatedLayout.jsx:**
- "Painel" (menu)
- "Perfil" (menu dropdown)
- "Sair" (menu dropdown)

#### Páginas de Perfil

**Edit.jsx:**
- "Perfil" (título)

**UpdateProfileInformationForm.jsx:**
- "Informações do Perfil"
- "Atualize as informações do perfil e o endereço de e-mail da sua conta."
- "Nome"
- "Email"
- "Seu endereço de e-mail não foi verificado."
- "Clique aqui para reenviar o e-mail de verificação."
- "Um novo link de verificação foi enviado para seu endereço de e-mail."
- "Salvar"
- "Salvo."

**UpdatePasswordForm.jsx:**
- "Atualizar Senha"
- "Certifique-se de que sua conta está usando uma senha longa e aleatória para permanecer segura."
- "Senha Atual"
- "Nova Senha"
- "Confirmar Senha"
- "Salvar"
- "Salvo."

**DeleteUserForm.jsx:**
- "Excluir Conta"
- "Uma vez que sua conta for excluída, todos os seus recursos e dados serão permanentemente deletados."
- "Tem certeza de que deseja excluir sua conta?"
- "Por favor, insira sua senha para confirmar..."
- "Senha"
- "Cancelar"
- "Excluir Conta"

### 5.4 Compilação dos Assets

Após todas as traduções:
```bash
./sail npm run build
./sail artisan config:clear
```

**Resultado:**
- Build completado em 2.95s
- 22 arquivos JavaScript/CSS gerados
- Total: ~310 KB de JavaScript compactado

---

## 6. Estrutura do Projeto Mind Map

### 6.1 Arquivo mind.mind

Um arquivo `mind.mind` foi fornecido, contendo um mapa mental sobre "A teoria do QFD" (Quality Function Deployment).

**Formato:**
- Arquivo compactado ZIP
- Contém `map.json` internamente
- Versão do mapa: 3.0

### 6.2 Descompactação

```bash
unzip -o mind.mind -d .
```

**Resultado:**
- `map.json` extraído na raiz do projeto

### 6.3 Estrutura do map.json

```json
{
  "map_version": "3.0",
  "root": {
    "id": 3726567454,
    "title": "07 - A teoria do QFD⚙",
    "rank": null,
    "pos": [null, null],
    "created_at": "2025-05-27T16:32:29.000Z",
    "updated_at": "2025-05-27T16:32:39.000Z",
    "task": { ... },
    "children": [ ... ]
  }
}
```

**Propriedades de cada nó:**
- `id`: Identificador único
- `title`: Título do nó
- `rank`: Ordem de exibição
- `pos`: Posição [x, y] para renderização visual
- `icon`, `style`: Customizações visuais
- `created_at`, `updated_at`: Timestamps
- `note`: Anotações adicionais
- `link`: URL externa
- `task`: Informações de tarefa (datas, recursos, esforço)
- `attachments`: Anexos
- `image`: Imagem do nó
- `children`: Array de nós filhos (recursivo)
- `boundary`, `video`: Propriedades adicionais
- `property`: Metadados (floating, offset, layout)

**Principais tópicos do mapa:**
1. Conceitualizar a analogia
   - Quadro, Furadeira, Decorado
2. Exemplos Reais
   - Light Copy
   - Stories 10x

---

## 7. Comandos Úteis

### 7.1 Docker / Sail

```bash
# Subir containers
./sail up -d

# Parar containers
./sail down

# Reiniciar containers
./sail restart

# Ver logs
./sail logs

# Acessar shell do container
./sail shell

# Executar comandos Artisan
./sail artisan [comando]

# Executar comandos Composer
./sail composer [comando]

# Executar comandos NPM
./sail npm [comando]
```

### 7.2 Laravel Artisan

```bash
# Limpar caches
./sail artisan config:clear
./sail artisan cache:clear
./sail artisan route:clear
./sail artisan view:clear

# Migrations
./sail artisan migrate
./sail artisan migrate:fresh
./sail artisan migrate:status

# Criar migration
./sail artisan make:migration create_table_name

# Criar model
./sail artisan make:model ModelName -m

# Criar controller
./sail artisan make:controller ControllerName

# Publicar arquivos de tradução
./sail artisan lang:publish
```

### 7.3 NPM / Vite

```bash
# Modo desenvolvimento (watch)
./sail npm run dev

# Build para produção
./sail npm run build

# Instalar dependências
./sail npm install
```

### 7.4 Composer

```bash
# Instalar dependências
./sail composer install

# Atualizar dependências
./sail composer update

# Adicionar pacote
./sail composer require vendor/package

# Remover pacote
./sail composer remove vendor/package
```

---

## 8. Estrutura de Diretórios do Projeto

```
mindmap/
├── app/                          # Código da aplicação
├── bootstrap/                    # Bootstrap do Laravel
├── config/                       # Arquivos de configuração
├── database/                     # Migrations, seeders, factories
├── docker/                       # Arquivos Docker independentes
│   ├── 8.4/                      # Dockerfile PHP 8.4
│   └── mysql/                    # Scripts MySQL
├── documentation/                # Documentação do projeto
│   └── initial.md                # Esta documentação
├── lang/                         # Arquivos de tradução
│   ├── en/                       # Inglês
│   └── pt_BR/                    # Português Brasil
├── public/                       # Arquivos públicos
│   └── build/                    # Assets compilados
├── resources/                    # Views, JS, CSS
│   ├── css/                      # Estilos
│   └── js/                       # Componentes React
│       ├── Components/
│       ├── Layouts/
│       └── Pages/
├── routes/                       # Rotas da aplicação
├── storage/                      # Arquivos gerados
├── tests/                        # Testes automatizados
├── volumes/                      # Volumes Docker (gitignored)
│   ├── mysql/
│   └── redis/
├── .env                          # Variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git
├── composer.json                 # Dependências PHP
├── docker-compose.yml            # Configuração Docker
├── map.json                      # Mapa mental extraído
├── mind.mind                     # Arquivo mapa mental original
├── package.json                  # Dependências JavaScript
├── README.md                     # Instruções de setup
├── sail                          # Script Sail
└── vite.config.js                # Configuração Vite

```

---

## 9. Tecnologias Utilizadas

### 9.1 Backend
- **Laravel**: 12.35.1
- **PHP**: 8.4
- **MySQL**: 8.0
- **Redis**: Alpine

### 9.2 Frontend
- **React**: ^18.x
- **Inertia.js**: ^2.0
- **Vite**: ^7.x
- **TailwindCSS**: ^3.x
- **HeadlessUI**: ^2.x

### 9.3 DevOps
- **Docker**: via Laravel Sail
- **Docker Compose**: Orquestração de containers

### 9.4 Pacotes Laravel
- **Laravel Breeze**: Autenticação
- **Laravel Sanctum**: API authentication
- **Ziggy**: Rotas no JavaScript
- **Inertia Laravel**: Adapter para Inertia.js

---

## 10. Próximos Passos Sugeridos

1. **Modelagem do Banco de Dados**
   - Criar tabela `mindmaps`
   - Criar tabela `nodes` (nós do mapa)
   - Relacionamentos entre nós (hierarquia)

2. **CRUD de Mapas Mentais**
   - Listar mapas
   - Criar novo mapa
   - Editar mapa
   - Excluir mapa
   - Importar de JSON

3. **Interface Visual**
   - Biblioteca de visualização (D3.js, vis.js, ou custom)
   - Drag & drop de nós
   - Zoom e pan
   - Edição inline

4. **Features Avançadas**
   - Colaboração em tempo real
   - Exportação (JSON, PNG, PDF)
   - Compartilhamento
   - Versionamento
   - Busca em nós

---

## 11. Referências

- [Laravel Documentation](https://laravel.com/docs/12.x)
- [Laravel Sail Documentation](https://laravel.com/docs/12.x/sail)
- [Laravel Breeze Documentation](https://laravel.com/docs/12.x/starter-kits#breeze)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

---

**Documentação criada em:** 26 de outubro de 2025
**Versão do Laravel:** 12.35.1
**Versão do PHP:** 8.4
