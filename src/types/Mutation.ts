import { intArg, objectType, stringArg } from "@nexus/schema";

export const Mutation = objectType({
    name: "Mutation",
    definition(t) {
        // t.crud.createOneUser({ alias: "signupUser" });

        t.field("createDraft", {
            type: "Post",
            args: {
                title: stringArg({ nullable: false }),
                content: stringArg(),
                authorEmail: stringArg({ nullable: false })
            },
            resolve: (_, { authorEmail, title, content }, { prisma }) => {
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

        t.field("deletePost", {
            type: "Post",
            description: "Delete the post",
            args: {
                postId: intArg({ nullable: false })
            },
            resolve: async (parent, { postId }, context) => {
                return context.prisma.post.delete({
                    where: {
                        id: postId
                    }
                });
            }
        });
    }
});
