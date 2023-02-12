import { QueryResult } from "pg"

export interface IDeveloperRequest {
    name: string
    email: string
    developerInfoId: number
}

export interface IDeveloper extends IDeveloperRequest {
    id: number
}

export interface IDeveloperInfoRequest {
    developerSince: Date
    preferredOS: preferredOS
}
export interface IDeveloperInfo extends IDeveloperInfoRequest {
    id: number
}

export type DeveloperResult = QueryResult<IDeveloper>
export type DeveloperCreate = Omit<IDeveloper, "id">

export type DeveloperInfoResult = QueryResult<IDeveloperInfo>
export type DeveloperInfoCreate = Omit<IDeveloperInfo, "id">

export type preferredOS = "Windows" | "Linux" | "MacOS"