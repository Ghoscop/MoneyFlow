# MoneyFlow

Sistema de controle financeiro pessoal desenvolvido com Angular, Spring Boot e PostgreSQL. O projeto permite registrar movimentações financeiras e acompanhar receitas, despesas e saldo por meio de uma interface web.

## Sobre o projeto

O MoneyFlow foi desenvolvido para facilitar o acompanhamento das finanças pessoais, centralizando o registro de receitas e despesas e apresentando informações financeiras em um dashboard.

A aplicação utiliza uma arquitetura separada entre frontend e backend, com comunicação por meio de uma API REST e persistência dos dados em PostgreSQL.

## Funcionalidades

- Dashboard com resumo financeiro.
- Visualização do saldo, das receitas e das despesas do mês.
- Gráfico de receitas e despesas por período.
- Distribuição das despesas por categoria.
- Listagem das movimentações recentes.
- Registro e gerenciamento de movimentações financeiras por meio da API.

## Tecnologias utilizadas

### Frontend
- Angular
- TypeScript
- HTML5
- CSS3
- RxJS

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Spring Validation
- Maven
- PostgreSQL

### Infraestrutura
- Docker Compose
- Git e GitHub

## Estrutura do projeto

```text
MoneyFlow/
├── moneyflow-frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── models/
│   │       │   └── services/
│   │       ├── layout/
│   │       │   └── sidebar/
│   │       └── pages/
│   │           ├── dashboard/
│   │           └── movimentacoes/
│   ├── angular.json
│   └── package.json
│
├── moneyflow-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/moneyflow/
│   │   │   │   ├── controller/
│   │   │   │   ├── entity/
│   │   │   │   ├── repository/
│   │   │   │   └── service/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── compose.yaml
├── .gitignore
└── README.md
```

## Pré-requisitos

Antes de executar o projeto, instale:

- [Git](https://git-scm.com/)
- [Node.js e npm](https://nodejs.org/)
- [Java JDK 21](https://adoptium.net/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

O Angular CLI pode ser utilizado por meio do `npx`, sem instalação global.

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Ghoscop/MoneyFlow.git
cd MoneyFlow
```

### 2. Iniciar o banco de dados

Na raiz do projeto, com o Docker Desktop em execução:

```bash
docker compose up -d
```

Esse comando inicia os serviços definidos no arquivo `compose.yaml`. Confira a configuração desse arquivo para identificar os serviços e as portas utilizados.

### 3. Configurar e executar o backend

Abra outro terminal e acesse a pasta do backend:

```bash
cd moneyflow-backend
```

Verifique as configurações de conexão com o PostgreSQL em `src/main/resources/application.properties`. Ajuste-as conforme o ambiente local, utilizando variáveis de ambiente para credenciais quando necessário.

No Windows, execute:

```powershell
.\mvnw.cmd spring-boot:run
```

O backend utiliza a porta `8080` por padrão, salvo configuração diferente.

### 4. Instalar e executar o frontend

Abra outro terminal na raiz do projeto:

```bash
cd moneyflow-frontend
npm install
npx ng serve
```

A aplicação Angular estará disponível, por padrão, em:

http://localhost:4200

Mantenha o banco de dados e o backend em execução enquanto utiliza o frontend.

## API REST

A API disponibiliza operações para o gerenciamento de movimentações financeiras.

Endpoint principal:

```text
http://localhost:8080/api/movimentacoes
```

As movimentações utilizam informações como:

| Campo | Descrição |
|---|---|
| `id` | Identificador da movimentação |
| `descricao` | Descrição da movimentação |
| `valor` | Valor monetário |
| `tipo` | Tipo: `RECEITA` ou `DESPESA` |
| `data` | Data da movimentação |
| `categoria` | Categoria financeira |
| `observacao` | Observações adicionais |

As operações disponíveis dependem dos métodos implementados no controller. Consulte `MovimentacaoController.java` para verificar os métodos HTTP e os caminhos de cada operação.

## Banco de dados

O projeto utiliza PostgreSQL para persistência das movimentações financeiras, com acesso aos dados por meio do Spring Data JPA.

A configuração de conexão deve corresponder às informações definidas no Docker Compose e nas propriedades do backend.

Não versione senhas, tokens ou outras credenciais reais no repositório.

## Desenvolvimento

O projeto está organizado em duas aplicações independentes:

- **Frontend:** responsável pela interface, navegação e apresentação dos dados.
- **Backend:** responsável pela API REST, regras de negócio e persistência.

Essa separação facilita a manutenção e permite evoluir cada camada de forma independente.

## Melhorias futuras

- Implementação de testes automatizados adicionais.
- Aprimoramento dos filtros e das pesquisas de movimentações.
- Relatórios financeiros por período.
- Metas e limites de gastos por categoria.
- Pipeline de integração contínua e entrega contínua (CI/CD).
- Melhorias de segurança e configuração para produção.

## Autor

Desenvolvido por [Ghoscop](https://github.com/Ghoscop).

## Licença

Este projeto não declara uma licença específica neste README. Consulte o repositório antes de reutilizar ou distribuir o código.
