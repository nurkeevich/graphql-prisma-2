import jwt from "jsonwebtoken";
import { Context } from "./context";

export const APP_SECRET = "appsecret321";

export function getUserId(ctx: Context, requireAuth = true) {
    const authorization = ctx.request.get("Authorization");
    if (authorization) {
        const token = authorization.replace("Bearer ", "");
        const { userId } = jwt.verify(token, APP_SECRET) as {
            userId: string;
        };

        return userId;
    }

    if (requireAuth) {
        throw new Error("Not Authorized");
    }

    return null;
}
