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

  const queryString: string = `
        INSERT INTO
            developer_infos ("developerSince", "preferredOS")
        VALUES
            ($1, $2)
        RETURNING *;
             
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [
      newDeveloperInfo.developerSince,
      newDeveloperInfo.preferredOS
    ],
  };

  const queryResult: DeveloperInfoResult = await client.query(queryConfig);
  const newDeveloperInfoResponse = queryResult.rows[0];

  const queryString1: string = format(`
    UPDATE
      developers
    SET
      ("developerInfoId") = ROW($1)
    WHERE
      id = $2;
  `)

  const queryConfig1: QueryConfig = {
    text: queryString1,
    values: [newDeveloperInfoResponse.id, request.params.id]
  }

  const queryResult1: DeveloperResult = await client.query(queryConfig1);
  const developerInfoResponse = queryResult1.rows[0]
  console.log(developerInfoResponse)
  return response.status(201).json(newDeveloperInfoResponse)
};

export const listDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
        SELECT
            dev."id" "developerId",
            dev."name" "developerName",
            dev."email" "developerEmail",
            dinfo."id" "developerInfoId",
            dinfo."developerSince" "developerInfoDeveloperSince",
            dinfo."preferredOS" "developerInfoDeveloperPreferredOS"
        FROM
            developers dev
        LEFT JOIN developer_infos dinfo
        ON  dev."developerInfoId" = dinfo.id
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
        dev."id" "developerId",
        dev."name" "developerName",
        dev."email" "developerEmail",
        dinfo."id" "developerInfoId",
        dinfo."developerSince" "developerInfoDeveloperSince",
        dinfo."preferredOS" "developerInfoPreferredOS"
    FROM
        developers dev
    LEFT JOIN developer_infos dinfo
        ON  dev."developerInfoId" = dinfo.id
    WHERE
        dev.id = $1
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
    changes.email = developerChangeRequest.email;
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
try {
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
    values: [request.params.id]
  }

  const developerResult: QueryResult = await client.query(
    queryConfig
  );
  const developer: IDeveloper =
    developerResult.rows[0];

    const queryString1: string = format(
      `
            UPDATE 
                developer_infos
            SET
                (%I) = ROW(%L)
            WHERE 
                id = $1
            RETURNING *;
        `,
      Object.keys(changes),
      Object.values(changes)
    );

    const queryConfig1: QueryConfig = {
      text: queryString1,
      values: [developer.developerInfoId],
    };

    const updatedDeveloperResponse: Partial<DeveloperResult> =
      await client.query(queryConfig1);
    const updatedDeveloper: IDeveloper = updatedDeveloperResponse.rows![0];
  // } 

    return response.status(200).json(updatedDeveloper);  
} catch (error) {
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
