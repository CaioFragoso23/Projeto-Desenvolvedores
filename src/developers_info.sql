CREATE TYPE "OS" AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos(
	"id" BIGSERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" OS NOT NULL
);

INSERT INTO 
	developer_infos("developerSince", "preferredOS")
	VALUES
	('23/10/2023', 'Windows');
SELECT * FROM developer_infos;

CREATE TABLE IF NOT EXISTS developers(
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) NOT NULL UNIQUE,
	"developerInfoId" INTEGER UNIQUE,
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id")
);
INSERT INTO 
	developers("name","email","developerInfoId")
VALUES
	('Caio', 'caio@mail.com', '1');

CREATE TABLE IF NOT EXISTS projects(
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER NOT NULL,
	FOREIGN KEY ("developerId") REFERENCES developers("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS technologies(
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

INSERT INTO technologies("name") 
VALUES
	('Javascript'),
	('Python'),
	('React'),
	('Express.js'),
	('HTML'),
	('CSS'),
	('Django'),
	('PostgreSQL'),
	('MongoDB');


CREATE TABLE IF NOT EXISTS projects_technologies(
	"id" BIGSERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL,
	"technologyId" INTEGER NOT NULL,
	"projectId" INTEGER NOT NULL,
	FOREIGN KEY ("technologyId") REFERENCES technologies("id"),
	FOREIGN KEY ("projectId") REFERENCES projects("id") ON DELETE CASCADE
);

	