import { Request, Response, NextFunction } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

export const verifyProjectMiddleware = async(request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

    const queryString: string = `
        SELECT
            *
        FROM
            projects
        WHERE
            id = $1
    `

    const queryConfig: QueryConfig = {
        text:queryString,
        values: [request.params.id]
    }

    const queryResponse: QueryResult = await client.query(queryConfig)

    if(queryResponse.rowCount === 0){
        return response.status(404).json({message: "Project not found."})
    }

    next()
}

export const verifyProjectDevIdMiddleware = async(request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
    const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE 
            id = $1
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [parseInt(request.body.developersId)]
    }

    const queryResponse: QueryResult = await client.query(queryConfig)
    if(!queryResponse){
        return response.status(404).json({message: "Developer not found."})
    }

    next()
}