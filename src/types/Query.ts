import { intArg, objectType, stringArg } from "@nexus/schema";

export const Query = objectType({
    name: "Query",
    description: "Query operation",
    definition(t) {
        t.crud.post();

        t.list.field("feed", {
            type: "Post",
            resolve: (_parent, _args, ctx) => {
                return ctx.prisma.post.findMany({
                    where: { published: true }
                });
            }
        });

        t.list.field("filterPosts", {
            type: "Post",
            args: {
                searchString: stringArg({ nullable: true })
            },
            resolve: (_, { searchString }, ctx) => {
                return ctx.prisma.post.findMany({
                    where: {
                        OR: [{ content: { contains: searchString } }]
                    }
                });
            }
        });
    }
});
