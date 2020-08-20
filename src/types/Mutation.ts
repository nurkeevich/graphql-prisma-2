import { intArg, objectType, stringArg } from "@nexus/schema";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { getUserId, APP_SECRET } from "../utils";

export const Mutation = objectType({
    name: "Mutation",
    definition(t) {
        t.field("signIn", {
            type: "AuthPayload",
            description: "Sign in user",
            args: {
                email: stringArg({ nullable: false }),
                password: stringArg({ nullable: false })
            },
            resolve: async (_, { email, password }, { prisma }) => {
                const user = await prisma.user.findOne({ where: { email } });
                if (!user) {
                    throw new Error(`No such user found for email: ${email}`);
                }

                const isValidPassword = await bcrypt.compare(
                    password,
                    user.password
                );
                if (!isValidPassword) {
                    throw new Error("Invalid password");
                }

                return {
                    token: jwt.sign({ userId: user.id }, APP_SECRET),
                    user
                };
            }
        });

        t.field("signUp", {
            type: "AuthPayload",
            args: {
                email: stringArg({ nullable: false }),
                password: stringArg({ nullable: false }),
                name: stringArg({ nullable: false })
            },
            resolve: async (_, args, context) => {
                const password = await bcrypt.hash(args.password, 10);
                const user = await context.prisma.user.create({
                    data: {
                        ...args,
                        password
                    }
                });

                return {
                    token: jwt.sign({ userId: user.id }, APP_SECRET),
                    user
                };
            }
        });

        t.field("createDraft", {
            type: "Post",
            args: {
                title: stringArg({ nullable: false }),
                content: stringArg()
            },
            resolve: async (_, { title, content }, { prisma }) => {
                const result = await prisma.post.create({
                    data: {
                        title,
                        content,
                        published: false
                    }
                });

                return result;
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
