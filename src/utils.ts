import jwt from "jsonwebtoken";
import { Request } from "express";
import * as dotenv from "dotenv";

dotenv.config();

export function getUserId(request: Request, requireAuth = true) {
    const authorization = request.get("Authorization");
    if (authorization) {
        const token = authorization.replace("Bearer ", "");
        const { userId } = jwt.verify(token, process.env.APP_SECRET as string) as {
            userId: number;
        };

        return userId;
    }

    if (requireAuth) {
        throw new Error("Not Authorized");
    }

    return null;
}
