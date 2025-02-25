# Library API
API RESTful desenvolvida para realizar o gerenciamento de livros em uma biblioteca, permitindo o controle de usuários, livros e empréstimos.

## Tecnologias utilizadas
- NestJS
- MySQL
- Docker

## Principais funcionalidades
- **Controle de usuários**
     - Cadastrar, deletar e atualizar usuários
     - Buscar informações de todos os usuários ou de usuários específicos
- **Controle de livros**
     - Cadastrar, deletar e atualizar livros
     - Realizar buscas de todos os livros ou livros específicos
     - Realizar buscas dos livros mais emprestados
- **Controle de empréstimos**
     - Realizar um novo empréstimo (Cada usuário pode realizar no máximo 3 empréstimos simultâneos)
     - Cadastrar a devolução de um livro
     - Verificar usuários com empréstimos pendentes

## Instalação do Projeto
### Pré-requisitos
1. **Git**
    - É necessário que tenha o **git** na sua última versão
    - Verificar se o git está instalado:
    ```bash
    git --version
    ```
    - Caso não esteja instalado, é possível instalar através do [Downloads - Git](https://git-scm.com/downloads)
2. **Docker**
    - É necessário que tenha **docker** para realizar execução do projeto
    - Verificar se o Docker está instalado
   ```bash
   docker --version
   ```
   - Caso não esteja instalado, é possível instalar através do [Docker Docs](https://docs.docker.com/engine/install/)

### Processo de instalação e execução do projeto
1. Clonar o repositório na sua máquina
```bash
git clone git@github.com:Axiotes/LibraryAPI.git
```
2. Entrar no diretório
```bash
cd LibraryAPI
```
3. Variáveis de ambiente  
Renomeie o arquivo `env_example` para `.env` e atribua valores ao respectivas variáveis, exemplo:
```
DATABASE_HOST="db"
DATABASE_USERNAME="root"
DATABASE_PASSWORD="password"
DATABASE_PORT=3306
DATABASE_NAME="db_library"
JWT_SECRET=f446942879bc545d290cb33bd3d2000bfe990ddb3a28d23daac3e4f2d80adc1c
ADMIN_NAME="Meu nome"
ADMIN_EMAIL="meu@email.com"
ADMIN_PASSWORD="minha_senha"
```
Para o gerar o `JWT_SECRET` você pode utilizar o https://jwtsecret.com/generate  
As chaves `ADMIN_NAME`, `ADMIN_EMAIL` E `ADMIN_PASSWORD` serão utilizadas para criar um usuário admin base. Com ele será possível acessar alguns do endpoints protegidos e gerar novos usuários autenticados
5. Realizar o build da aplicação
```bash
docker-compose build
```
6. Executar aplicação
```bash
docker-compose up
```
7. Executar o seed  
     Com a aplicação em execução, execute o seguinte comando para gerar um usuário admin principal, com base no que foi declarado no `.env`. Com ele você poderá utilizar o endpoint `sign-in` de `Auth`, para obter um token e utilizar o token nos endpoints protegidos
```bash
npm run seed
```
8. Gerar dados falsos **(Opcional)**  
     Com a aplicação em execução, é possível utilizar o seguinte comando para gerar dados falsos
```bash
npm run seed:fake-data
```

## Swagger
Com a api em execução, utilize a rota `http://localhost:3000/api` no navegador para acessar o swagger, nele estará documentado dos os endpoints
