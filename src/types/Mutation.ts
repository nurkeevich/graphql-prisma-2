import { intArg, objectType, stringArg, booleanArg, arg } from "@nexus/schema";
import { getUserId } from "../utils";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config()

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
                    token: jwt.sign({ userId: user.id }, process.env.APP_SECRET as string),
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
                const emailTaken = await context.prisma.user.findOne({
                    where: {
                        email: args.email
                    }
                });

                if (emailTaken) {
                    throw new Error(`${args.email}: already taken`);
                }

                const password = await bcrypt.hash(args.password, 10);
                const user = await context.prisma.user.create({
                    data: {
                        ...args,
                        password
                    }
                });

                return {
                    token: jwt.sign({ userId: user.id }, process.env.APP_SECRET as string),
                    user
                };
            }
        });

        t.field("createPost", {
            type: "Post",
            description: "Create a post",
            args: {
                title: stringArg({ nullable: false }),
                content: stringArg(),
                published: booleanArg({ default: false })
            },
            resolve: async (
                parent,
                { title, content, published },
                { prisma, request }
            ) => {
                const userId = getUserId(request);
                const user = await prisma.user.findOne({
                    where: {
                        id: userId || undefined
                    }
                });

                if (!user) {
                    throw new Error("User does not exist!");
                }

                if (title === "") {
                    throw new Error("Title need to be entered");
                }

                const newPost = await prisma.post.create({
                    data: {
                        title,
                        content,
                        published: published as any,
                        author: {
                            connect: {
                                id: userId || undefined
                            }
                        }
                    }
                });

                return newPost;
            }
        });

        t.field("updatePost", {
            type: "Post",
            description: "Update the post",
            args: {
                postId: intArg({ nullable: false }),
                title: stringArg(),
                content: stringArg(),
                published: booleanArg()
            },
            resolve: async (
                parent,
                { postId, content, title, published },
                { prisma, request }
            ) => {
                const userId = getUserId(request);
                const postExist = await prisma.post.findMany({
                    where: {
                        id: postId,
                        authorId: userId
                    }
                });

                if (postExist.length === 0) {
                    throw new Error(
                        "Post not found or your are not the author"
                    );
                }

                const updatedPost = await prisma.post.update({
                    where: {
                        id: postId
                    },
                    data: {
                        title: title as any,
                        content,
                        published: published as any
                    }
                });

                return updatedPost;
            }
        });

        t.field("deletePost", {
            type: "Post",
            description: "Delete the post",
            args: {
                postId: intArg({ nullable: false })
            },
            resolve: async (parent, { postId }, { prisma, request }) => {
                const userId = getUserId(request);
                console.log("userId: " + userId);

                const post = await prisma.post.findMany({
                    where: {
                        id: postId,
                        authorId: userId
                    }
                });

                if (post.length === 0) {
                    throw new Error(
                        "Post does not exist or you are not author of the post"
                    );
                }

                const deletedPost = await prisma.post.delete({
                    where: {
                        id: postId
                    }
                });

                return deletedPost;
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
    }
});
