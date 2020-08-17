import { intArg, objectType, stringArg } from "@nexus/schema";
import { getUserId } from "../utils";

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

        t.field("delete_post", {
            type: "Post",
            description: "Delete the post",
            args: {
                post_id: intArg({ nullable: false })
            },
            resolve: async (parent, { post_id }, context) => {
                return context.prisma.post.delete({
                    where: {
                        id: post_id
                    }
                });
            }
        });
    }
});
