import { intArg, objectType, stringArg, booleanArg } from "@nexus/schema";
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

        t.field("createPost", {
            type: "Post",
            args: {
                title: stringArg({ nullable: false }),
                content: stringArg()
            },
            resolve: async (_, { title, content }, { prisma, request }) => {
                const userId = getUserId(request);
                if (!userId) {
                    throw new Error("Please login first");
                }

                const user = await prisma.user.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new Error("User does not exist!");
                }

                const newPost = await prisma.post.create({
                    data: {
                        title,
                        content,
                        published: false,
                        author: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                });

                return newPost;
            }
        });

        t.field("publishPost", {
            type: "Post",
            args: {
                postId: intArg({ nullable: false })
            },
            description: "Publish the draft",
            resolve: async (parent, { postId }, { request, prisma }) => {
                const userId = getUserId(request);
                if (!userId) {
                    throw new Error("Not authorized");
                }

                const postExist = await prisma.post.findMany({
                    where: {
                        id: postId,
                        author: { id: userId }
                    }
                });
                if (!postExist) {
                    throw new Error(
                        "Post does not exist or you are not the author"
                    );
                }

                const publishedPost = await prisma.post.update({
                    data: {
                        published: true
                    },
                    where: {
                        id: postId
                    }
                });

                return publishedPost;
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
