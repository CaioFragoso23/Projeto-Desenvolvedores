import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";
import {
  DeveloperCreate,
  DeveloperInfoCreate,
} from "../interfaces/developer.interfaces";
import { ProjectResult, ProjectsTechnologiesResult } from "../interfaces/projects.interfaces";
import { IProjectsTechnologies, IProjectsTechnologiesInfo, IProjectsTechnologiesInfoResult, IProjectsTechnologiesRequest } from "../interfaces/projects_technologies.interfaces";

export const listProjectsFromSingleDeveloper = async (request: Request, response: Response): Promise<Response> => {
  const queryString: string = `
    SELECT
        dev.id "developerId",
        dev."name" "developerName",
        dev."email" "developerEmail",
        dinfo.id "developerInfoId",
        dinfo."developerSince" "developerInfoDeveloperSince",
        dinfo."preferredOS" "developerInfoPreferredOS",
        proj.id "projectId",
        proj."name" "projectName",
        proj."description" "projectDescription",
        proj."estimatedTime" "projectEstimatedTime",
        proj."repository" "projectRepository",
        proj."startDate" "projectStartDate",
        proj."endDate" "projectEndDate",
        ptech."technologyId" "technologyId",
        tech."name" "technologyName"
        FROM
            developers dev
        FULL OUTER JOIN
            projects proj
            ON proj.developersId = dev.id
        FULL OUTER JOIN
            developer_infos dinfo
            ON dev.id = dinfo.developersId
        FULL OUTER JOIN
            projects_technologies ptech 
            ON proj.id = ptech.projectId
        FULL OUTER JOIN
            technologies tech
            ON ptech.technologyId = tech.id
        WHERE dev.id = $1  
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [request.params.id]
    }

    const queryResult: IProjectsTechnologiesInfoResult = await client.query(queryConfig)
    const queryResponse: IProjectsTechnologiesInfo[] = queryResult.rows

    return response.status(200).json(queryResponse)
};

export const newProjectTechnology = async(request: Request, response: Response): Promise<Response> => {
    const newProjectTech: IProjectsTechnologiesRequest = request.body

    if(!newProjectTech.name){
        return response.status(400).json({message: "Missing a required key: name"})
    }

    const queryString: string = `
        SELECT
            *
        FROM
            technologies tech
        WHERE
            tech.name = $1
    `
    const queryConfig: QueryConfig = {
        text:queryString,
        values: [newProjectTech.name]
    }

    const queryResult: QueryResult<IProjectsTechnologies> = await client.query(queryConfig)
    const technologyId:number = queryResult.rows[0].id

    const queryString1: string = `
        INSERT INTO
            projects_technologies ("technologyId", "projectId", "addedIn")
        VALUES
            ($1, $2, $3)
        RETURNING *;
    `

    const queryConfig1: QueryConfig = {
        text: queryString1,
        values: [technologyId, request.params.id, new Date()]
    }

    const queryResult1: IProjectsTechnologiesInfoResult = await client.query(queryConfig1)
    const newProjectTechResult : IProjectsTechnologiesInfo = queryResult1.rows[0]

    return response.status(201).json(newProjectTechResult)
}

export const deleteTechnologyFromProject = async(request: Request, response: Response): Promise<Response> => {
    const technologyName:string = request.params.name

    const queryString: string = `
        SELECT
            *
        FROM
            technologies tech
        WHERE
            tech."name" = $1
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [technologyName]
    }

    const queryResult: ProjectsTechnologiesResult = await client.query(queryConfig)
    const technologyId: number = queryResult.rows[0].id

    const queryString1: string = `
        DELETE FROM
            projects_technologies ptech
        WHERE
            ptech.technologyId = $1 AND ptech.projectId = $2
        RETURNING *;
    `

    const queryConfig1: QueryConfig = {
        text:queryString1,
        values: [technologyId, request.params.id]
    }

    const queryResult1: ProjectsTechnologiesResult = await client.query(queryConfig1)

    if(queryResult1.rowCount < 1){
        return response.status(404).json({message: `Technology ${technologyName} not found in this project`})
    }

    return response.status(201).send()
}