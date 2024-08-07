import { compression } from "@chneau/elysia-compression";
import { logger } from "@chneau/elysia-logger";
import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { serverTiming } from "@elysiajs/server-timing";
import { PrismaClient } from "@prisma/client";
import { Elysia, error, t } from "elysia";
import { PostInputCreate, PostInputUpdate } from "./prisma/prismabox/Post";

const client = new PrismaClient();

(async () => {
	console.log("Deleting all");
	await client.post.deleteMany();
	await client.user.deleteMany();
	console.log("Creating user");
	const user = await client.user.create({
		data: {
			username: "root",
			passwordHash: "root",
			role: "root",
		},
	});
	await client.post.create({
		data: {
			title: "The first post",
			content: "This is the first post.",
			published: true,
			authorId: user.id,
		},
	});
})();

const app = new Elysia()
	.use(serverTiming())
	.use(logger())
	.use(
		cors({
			origin: "localhost:5173",
			allowedHeaders: ["Content-Type"],
			methods: ["GET", "POST", "PUT", "DELETE"],
		}),
	)
	.use(compression())
	.use(jwt({ secret: "not_secret" }))
	.get("/logout", (req) => {
		if (!req.cookie.auth) return error(401, "Unauthorized");
		req.cookie.auth.remove();
		return "Logged out";
	})
	.post(
		"/login",
		async (req) => {
			if (!req.cookie.auth) return error(401, "Unauthorized");
			const user = await client.user.findUnique({
				where: { username: req.body.username },
				select: { id: true, passwordHash: true, role: true, username: true },
			});
			if (!user) return error(401, "Unauthorized");
			if (user.passwordHash !== req.body.password)
				return error(401, "Unauthorized");

			const exp = Date.now() + 1000 * 60 * 60; // 1 hour
			req.cookie.auth.set({
				value: await req.jwt.sign({
					name: req.body.username,
					id: user.id,
					role: user.role,
					exp,
				}),
				httpOnly: true,
				expires: new Date(exp),
				secure: true,
				sameSite: true,
			});
			return { ...user, passwordHash: undefined };
		},
		{ body: t.Object({ username: t.String(), password: t.String() }) },
	)
	.get("/", () => "Hello, World!")
	.get("/users", () =>
		client.user.findMany({ select: { id: true, username: true, role: true } }),
	)
	.get("/posts", () => client.post.findMany())
	.post(
		"/posts",
		async (req) => {
			if (!req.cookie.auth) return error(401, "Unauthorized");
			const profile = await req.jwt.verify(req.cookie.auth.value);
			if (!profile || typeof profile.id !== "number")
				return error(401, "Unauthorized");
			return await client.post.create({
				data: { ...req.body, author: { connect: { id: profile.id } } },
			});
		},
		{ body: t.Omit(PostInputCreate, ["author"]) },
	)
	.get(
		"/posts/:id",
		(req) => client.post.findUnique({ where: { id: req.params.id } }),
		{ params: t.Object({ id: t.Numeric() }) },
	)
	.put(
		"/posts/:id",
		(req) =>
			client.post.update({
				where: { id: req.params.id },
				data: req.body,
			}),
		{
			params: t.Object({ id: t.Numeric() }),
			body: PostInputUpdate,
		},
	)
	.delete(
		"/posts/:id",
		async (req) => {
			if (!req.cookie.auth) return error(401, "Unauthorized");
			const profile = await req.jwt.verify(req.cookie.auth.value);
			if (!profile || profile.role !== "root")
				return error(401, "Unauthorized");
			return await client.post.delete({ where: { id: req.params.id } });
		},
		{ params: t.Object({ id: t.Numeric() }) },
	)
	.listen(3000);

console.log("Server: http://localhost:3000");

export type Server = typeof app;
