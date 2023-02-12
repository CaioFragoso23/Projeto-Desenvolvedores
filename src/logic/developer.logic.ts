import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  DeveloperCreate,
  DeveloperResult,
  DeveloperInfoCreate,
  DeveloperInfoResult,
  IDeveloper,
  IDeveloperRequest,
  IDeveloperInfoRequest,
  IDeveloperInfo,
} from "../interfaces/developer.interfaces";

export const newDeveloper = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const newDeveloperRequest = request.body;
  const newDeveloper: DeveloperCreate = {
    ...newDeveloperRequest,
  };

  const queryString: string = `
        INSERT INTO
            developers("name", "email")
        VALUES
            ($1, $2)
        RETURNING *
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [newDeveloper.name, newDeveloper.email],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);
  const newDeveloperResponse = queryResult.rows[0];

  return response.status(201).json(newDeveloperResponse);
};
export const newDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const newDeveloperInfoRequest = request.body;
  const newDeveloperInfo: DeveloperInfoCreate = {
    ...newDeveloperInfoRequest,
  };

  const queryString: string = format(`
        INSERT INTO
            developers_info ("developerSince", "preferredOS", "developers_id")
        VALUES
            ($1, $2, $3)
        RETURNING *;
             
    `);

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [
      newDeveloperInfo.developerSince,
      newDeveloperInfo.preferredOS,
      request.params.id,
    ],
  };

  const queryResult: DeveloperInfoResult = await client.query(queryString);
  const newDeveloperInfoResponse = queryResult.rows[0];
};

export const listDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
        SELECT
            dev.*,
            dinfo."developerSince",
            dinfo."preferredOS",
            dinfo."developers_id"
        FROM
            developers AS dev
        LEFT JOIN developers_info dinfo
        ON  dev.developersInfoId = dinfo.id
    `;
  const queryResult: DeveloperResult = await client.query(queryString);
  return response.status(200).json(queryResult.rows);
};

export const listSingleDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
    SELECT
        dev.*,
        dinfo."developerSince",
        dinfo."preferredOS",
        dinfo."developers_id"
    FROM
        developers AS dev
    LEFT JOIN developers_info dinfo
        ON  dev.developersInfoId = dinfo.id
    WHERE
        id = $1
    `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [request.params.id],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);
  return response.status(200).json(queryResult.rows);
};

export const updateDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerChangeRequest: Partial<IDeveloperRequest> = request.body;

  if (!developerChangeRequest.email && !developerChangeRequest.name) {
    return response.status(400).json({
      message: "At least one of those keys must be sent.",
      keys: ["name", "email"],
    });
  }

  const changes: Partial<IDeveloper> = {};

  if (developerChangeRequest.name) {
    changes.name = developerChangeRequest.name;
  }
  if (developerChangeRequest.email) {
    changes.name = developerChangeRequest.email;
  }

  const queryString: string = format(
    `
        UPDATE developers
        SET
            (%I) = ROW(%L) 
        WHERE 
            id = $1
        RETURNING *;
        `,

    Object.keys(changes),
    Object.values(changes)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [request.params.id],
  };

  const updatedDeveloperResponse: Partial<DeveloperResult> = await client.query(
    queryConfig
  );
  const updatedDeveloper: IDeveloper = updatedDeveloperResponse.rows![0];
  return response.status(200).json(updatedDeveloper);
};

export const updateDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerInfoChangeRequest: Partial<IDeveloperInfoRequest> =
    request.body;

  if (
    !developerInfoChangeRequest.developerSince &&
    !developerInfoChangeRequest.preferredOS
  ) {
    return response.status(400).json({
      message: "At least one of those keys must be sent",
      keys: ["developerSince", "preferredOS"],
    });
  }
  const changes: Partial<IDeveloperInfo> = {};

  if (developerInfoChangeRequest.developerSince) {
    changes.developerSince = developerInfoChangeRequest.developerSince;
  }
  if (developerInfoChangeRequest.preferredOS) {
    changes.preferredOS = developerInfoChangeRequest.preferredOS;
  }

  const queryString: string = `
        SELECT COUNT (*)
        FROM
            developers_info
        WHERE developers_id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [request.params.id],
  };

  const developerContainsInfoResult: QueryResult = await client.query(
    queryConfig
  );
  const developerContainsInfo: number =
    developerContainsInfoResult.rows[0].count;

  if (developerContainsInfo == 1) {
    const queryString1: string = format(
      `
            UPDATE 
                developers_infos
            SET
                (%I) = ROW(%L)
            WHERE 
                developers_id = $1
            RETURNING *;
        `,
      Object.keys(changes),
      Object.values(changes)
    );

    const queryConfig1: QueryConfig = {
      text: queryString1,
      values: [request.params.id],
    };

    const updatedDeveloperResponse: Partial<DeveloperResult> =
      await client.query(queryConfig1);
    const updatedDeveloper: IDeveloper = updatedDeveloperResponse.rows![0];
    return response.status(200).json(updatedDeveloper);
  } else {
    return response
      .status(404)
      .json({ message: "Developer has no info to be updated" });
  }
};

export const deleteDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
        DELETE FROM 
            developers
        WHERE
            id = $1
    `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [request.params.id],
  };

  await client.query(queryConfig);
  return response.status(204).send();
};
