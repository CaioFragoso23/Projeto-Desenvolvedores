import { Request, Response, NextFunction } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

export const verifyEmailMiddleware = async(request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

    const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            "email" = $1
    `

    const queryConfig: QueryConfig = {
        text:queryString,
        values: [request.body.email]
    }

    const queryResponse: QueryResult = await client.query(queryConfig)

    if(queryResponse.rowCount === 0){
        return response.status(409).json({message: "Email already exists."})
    }

    next()
}

export const verifyDevIdMiddleware = async(request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
    const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE id = $1
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [request.params.id]
    }

    const queryResponse: QueryResult = await client.query(queryConfig)
    if(queryResponse.rowCount === 0){
        return response.status(404).json({message: "Developer not found."})
    }

    next()
}