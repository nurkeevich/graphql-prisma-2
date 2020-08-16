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
                        OR: [
                            { title: { contains: searchString } },
                            { content: { contains: searchString } }
                        ]
                    }
                });
            }
        });
    }
});

export const Mutation = objectType({
    name: "Mutation",
    definition(t) {
        t.crud.createOneUser({ alias: "signupUser" });
        t.crud.deleteOnePost();

        t.field("createDraft", {
            type: "Post",
            args: {
                title: stringArg({ nullable: false }),
                content: stringArg(),
                authorEmail: stringArg({ nullable: false })
            },
            resolve: (_, { title, content, authorEmail }, { prisma }) => {
                return prisma.post.create({
                    data: {
                        title,
                        content,
                        published: false,
                        author: {
                            connect: { email: authorEmail }
                        }
                    }
                });
            }
        });

        t.field("publish", {
            type: "Post",
            nullable: true,
            args: {
                id: intArg()
            },
            resolve: (_, { id }, ctx) => {
                return ctx.prisma.post.update({
                    where: { id: Number(id) },
                    data: { published: true }
                });
            }
        });
    }
});
