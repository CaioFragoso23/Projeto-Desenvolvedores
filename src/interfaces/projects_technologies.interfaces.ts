import { QueryResult } from "pg"
import { IDeveloper, IDeveloperInfo } from "./developer.interfaces"
import { IProject } from "./projects.interfaces"

export interface IProjectsTechnologiesRequest{
    name:string
}

export interface IProjectsTechnologies extends IProjectsTechnologiesRequest{
    id: number
}

export interface IProjectsTechnologiesInfo extends IProject, IDeveloper, IDeveloperInfo{
    technologyId: string,
    technologyName: string
}

export type IProjectsTechnologiesResult = QueryResult<IProjectsTechnologies>
export type IProjectsTechnologiesInfoResult = QueryResult<IProjectsTechnologiesInfo>