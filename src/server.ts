import { GraphQLServer } from "graphql-yoga";
import { schema } from "./schema";
import { createContext } from "./context";
import { config } from "dotenv";

config();

const server = new GraphQLServer({
    schema: schema as any,
    context: createContext
});

server.start(() => {
    console.log(`🚀 Server ready at: http://localhost:4000`);
});
