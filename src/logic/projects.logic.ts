import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import { IProject, IProjectRequest, IProjectsTechnologies, projectRequiredKeys, ProjectResult, ProjectsTechnologiesResult } from "../interfaces/projects.interfaces";

export const newProject = async(request: Request, response: Response): Promise<Response> => {
    const newProjectRequest = request.body
    const newProject : IProjectRequest = {
        ...newProjectRequest
    }
    const newProjectKeys: Array<string> = Object.keys(newProjectRequest)
    const projectRequiredKeys: projectRequiredKeys[] = ["name", "description", "estimatedTime", "repository", "startDate", "developersId"]

    const verifyRequestKeys: boolean = projectRequiredKeys.every((key: string) => newProjectKeys.includes(key))
    if(!verifyRequestKeys){
        return response.status(400).json({message: `Missing required Keys ${projectRequiredKeys}`})
    }

    const date:string = newProjectRequest.startDate

    const queryString = format(
        `
        INSERT INTO 
            projects (%I)
        VALUES
            (%L)
        RETURNING *;
        `,
        Object.keys(newProject),
        Object.values(newProject)
    )

    const queryResult: ProjectResult = await client.query(queryString)
    const projectResult: IProject = queryResult.rows[0]
    console.log(queryResult);

    return response.status(201).json(projectResult)
}

export const listProjects = async(request: Request, response: Response): Promise<Response> => {
    const queryString: string = `
        SELECT
            proj.*,
            ptech.technologyId "technologyId",
            tech.name "technologyName"
        FROM projects proj
        LEFT JOIN
            project_technologies ptech
            ON proj.id = ptech.projectId
        LEFT JOIN
            technologies tech
            ON ptech.technologyId = tech.id;
    `
    const queryResult: ProjectsTechnologiesResult = await client.query(queryString)
    const queryResponse: IProjectsTechnologies[] = queryResult.rows

    return response.status(200).json(queryResponse)
}

export const listSingleProject = async (request: Request, response: Response): Promise<Response> => {
    const queryString: string = `
    SELECT
    proj.*,
    ptech.technologyId "technologyId",
    tech.name "technologyName"
FROM projects proj
LEFT JOIN
    project_technologies ptech
    ON proj.id = ptech.projectId
LEFT JOIN
    technologies tech
    ON ptech.technologyId = tech.id
    WHERE proj.id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [request.params.id]
    }

    const queryResult: ProjectsTechnologiesResult = await client.query(queryConfig)
    const queryResponse: IProjectsTechnologies[] = queryResult.rows

    return response.status(200).json(queryResponse)
}

export const updateProject = async(request: Request, response: Response): Promise<Response> => {
    const projectChangesRequest = request.body
    const projectRequiredKeys: projectRequiredKeys[] = ["name", "description", "estimatedTime", "repository", "startDate", "developersId"]

    let changes: Partial<IProject> = {}
    if(projectChangesRequest.name){
        changes.name = projectChangesRequest.name 
    }
    if(projectChangesRequest.description){
        changes.description = projectChangesRequest.description 
    }
    if(projectChangesRequest.estimatedTime){
        changes.estimatedTime = projectChangesRequest.estimatedTime 
    }
    if(projectChangesRequest.repository){
        changes.repository = projectChangesRequest.repository 
    }
    if(projectChangesRequest.startDate){
        changes.startDate = projectChangesRequest.startDate 
    }
    if(projectChangesRequest.endDate){
        changes.endDate = projectChangesRequest.endDate 
    }
    if(projectChangesRequest.developerId){
        changes.developerId = projectChangesRequest.developerId
    }

    if(Object.keys(changes).length<1){
        return response.status(400).json({
            message: "At least one of those keys must be send",
            keys: projectRequiredKeys
        })
    }
    const queryString = format(
        `
        UPDATE
            projects
            SET
             (%I) = ROW(%L)
            WHERE id = $1
            RETURNING *;
        `,
        Object.keys(changes),
        Object.values(changes)
    )

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [request.params.id]
    }

    const queryResult: ProjectResult = await client.query(queryConfig)
    const projectResponse: IProject = queryResult.rows[0]
    return response.status(201).json(projectResponse)
}

export const deleteProject = async(request:Request, response: Response): Promise<Response> => {
    const queryString: string = `
        DELETE FROM
            projects
        WHERE
            id = $1;
    `

    const queryConfig: QueryConfig = {
        text:queryString,
        values: [request.params.id]
    }
    await client.query(queryConfig)

    return response.status(204).send()
}