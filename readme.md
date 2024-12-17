# <center>**Projetos de desenvolvedores**</center>

Projeto Back-end para registro de desenvolvedores, com seus projetos, tecnologias usadas por projeto e também ver projetos de outros desenvolvedores.

## Feito com as tecnologias:
* Node.js
* Express.js
* ts-node-dev
* dotenv
* pg e pg-format para compatibilidade com banco de dados Postgresql

### Endereço das *requests*: \

POST	/projects	Cadastrar um novo projeto 
GET	/projects/:id	Listar um projeto pelo id 
GET	/projects	Listar todos os projetos 
PATCH	/projects/:id	Atualizar um projeto 
DELETE	/projects/:id	Excluir um projeto 
POST	/projects/:id/technologies	Cadastrar uma tecnologia para um projeto, o nome da tecnologia deve ser enviada no body seguindo os nomes cadastrados previamente no banco 
DELETE	/projects/:id/technologies/:name	Deletar uma tecnologia de um projeto.

### Diagrama de Entidades e Relacionamentos
![DER Developers](DER%20developers.png)