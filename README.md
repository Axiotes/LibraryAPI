# LibraryAPI
API desenvolvida para facilitar o gerenciamento de uma biblioteca, oferecendo recursos para o controle eficiente de usuários, livros e empréstimos. Com ela, é possível cadastrar, consultar, atualizar e remover registros, além de gerenciar o processo de empréstimo e devolução de livros.

## Tecnologias
- NestJS
- Docker
- MySQL

## Instalção do Projeto
### Pré-requisitos
1. **Docker**
   - Para execução do projeto, é necessário ter instalado o docker
   - Verificar se o docker está instalado:
     
     ```
     docker -v
     ```

   - Caso não esteja instalado, é possível instalar através do [Docker Docs](https://docs.docker.com/engine/install/)

2. **Config variáveis do .env**  
   Use `.env.example` como referência para criar seu arquivo de configuração `.env`  
   Ex:
   ```yaml
    DATABASE_HOST="db"
    DATABASE_USERNAME="root"
    DATABASE_PASSWORD="root"
    DATABASE_PORT=3306
    DATABASE_NAME="db_library"

    JWT_SECRET="secret"

    ADMIN_NAME="Admin"
    ADMIN_EMAIL="admin@gmail.com"
    ADMIN_PASSWORD="admin12345"
   ```
### Processo de Instalação e Execução
1. Clonar o repositório na sua máquina
```bash
git clone git@github.com:Axiotes/LibraryAPI.git
```
2. Entrar no diretório
```bash
cd LibraryApi
```
3. Executar build
```bash
docker-compose build
```
4. Executar aplicação
```bash
docker-compose up
```

## Scripts Importantes
### Seeds
Criação do usuário admin base definido no `.env`
```bash
npm run seed
```

Criação de dados falsos para testes
```bash
npm run seed:fake-data
```

### Testes Unitários
```bash
npm test
```
## Swagger
Documentação interativa da API gerada automaticamente com o Swagger. Ela permite visualizar, testar e entender todos os endpoints disponíveis de forma simples e prática diretamente no navegador.

Após iniciar o projeto localmente, acesse:
```
http://localhost:3000/api/docs
```
