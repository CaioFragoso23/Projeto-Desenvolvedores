import { QueryResult } from "pg"

export interface IProjectRequest{
    name: string
    description: string
    estimatedTime: string
    repository: string
    startDate: string
    developerId: number
}

export type projectRequiredKeys = "name" | "description" | "estimatedTime" | "repository" | "startDate" | "developersId"

export interface IProject extends IProjectRequest{
    id: number
    endDate: string
}

export interface IProjectsTechnologies extends IProject{
    technologyId: number,
    technologyName: string
}

export type ProjectResult = QueryResult<IProject>
export type ProjectsTechnologiesResult = QueryResult<IProjectsTechnologies>