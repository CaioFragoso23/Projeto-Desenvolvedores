import { Request, Response, NextFunction } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

export const verifyTechMiddleware = async(request: Request, response: Response, next: NextFunction): Promise<Response | void> => {

    const queryString: string = `
        SELECT COUNT
            (*)
        FROM
            technologies tech
        WHERE
            tech.name = $1
    `

    const queryConfig: QueryConfig = {
        text:queryString,
        values: [request.params.name || request.body.name]
    }

    const queryResult: QueryResult = await client.query(queryConfig)

    if(queryResult.rows[0].count != 1){
        return response.status(400).json(
            {message: "Project not found.",
            options: [
                "Javascript",
                "Python",
                "React",
                "Express.js",
                "HTML",
                "CSS",
                "Django",
                "PostgreSQL",
                "MongoDB"
            ]})
    }

    next()
}
