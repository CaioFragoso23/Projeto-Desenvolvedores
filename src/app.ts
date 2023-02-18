import express, {Application, } from "express";
import { startDatabase } from "./database";
import { deleteDeveloper, listDevelopers, listSingleDeveloper, newDeveloper, newDeveloperInfo, updateDeveloper, updateDeveloperInfo } from "./logic/developer.logic";
import { deleteProject, listProjects, listSingleProject, newProject, updateProject } from "./logic/projects.logic";
import { deleteTechnologyFromProject, listProjectsFromSingleDeveloper, newProjectTechnology } from "./logic/projects_technologies.logic";
import { verifyDevIdMiddleware, verifyEmailMiddleware } from "./middleware/developer.middleware";
import { verifyProjectDevIdMiddleware, verifyProjectMiddleware } from "./middleware/projects.middleware";
import { verifyTechMiddleware } from "./middleware/projects_technologies.middlware";

const app: Application = express()
app.use(express.json())

app.post("/developers", verifyEmailMiddleware, newDeveloper)
app.post("/developers/:id/infos", verifyDevIdMiddleware, newDeveloperInfo)
app.get("/developers", listDevelopers)
app.get("/developers/:id", verifyDevIdMiddleware, listSingleDeveloper)

app.patch("/developers/:id", verifyDevIdMiddleware, updateDeveloper)
app.patch("/developers/:id/infos", verifyDevIdMiddleware, updateDeveloperInfo)
app.delete("/developers/:id", verifyDevIdMiddleware, deleteDeveloper)

app.post("/projects", verifyProjectDevIdMiddleware, newProject)
app.get("/projects", listProjects)
app.get("/projects/:id", verifyProjectMiddleware, listSingleProject)
app.patch("/projects/:id", verifyProjectMiddleware, updateProject)
app.delete("/projects/:id", verifyProjectMiddleware, deleteProject)

app.get("/developers/:id/projects", verifyDevIdMiddleware, listProjectsFromSingleDeveloper)
app.post("/projects/:id/technologies", verifyProjectMiddleware, verifyTechMiddleware, newProjectTechnology)
app.delete("/projects/:id/technologies/:name", verifyProjectMiddleware, verifyTechMiddleware, deleteTechnologyFromProject)

const PORT: number = 3000;
const runningMessage: string = `Server running!`
app.listen(3000, async () => {
    await startDatabase()
    console.log(runningMessage)
})