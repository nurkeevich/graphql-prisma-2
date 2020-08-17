import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ContextParameters } from "graphql-yoga/dist/types";

const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
    request: Request;
    response: Response;
}

export function createContext(
    request: ContextParameters,
    response: ContextParameters
): Context {
    return {
        prisma,
        ...request,
        ...response
    };
}
