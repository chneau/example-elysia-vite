import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { serverTiming } from "@elysiajs/server-timing";
import { PrismaClient } from "@prisma/client";
import { Elysia, error, t } from "elysia";
import { compression } from "./compression";
import { PostInputCreate, PostInputUpdate } from "./prisma/prismabox/Post";

const port = Bun.env.PORT ?? "3000";
console.log(`Server: http://localhost:${port}`);

const client = new PrismaClient();

(async () => {
	console.log("Deleting all");
	await client.post.deleteMany();
	await client.user.deleteMany();
	console.log("Creating user");
	await client.user.create({
		data: {
			username: "root",
			passwordHash: "root",
			role: "root",
		},
	});
})();

const app = new Elysia()
	.use(serverTiming())
	.use(cors({ origin: "localhost:5173", allowedHeaders: ["Content-Type"] }))
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
				select: { passwordHash: true },
			});
			if (!user) return error(401, "Unauthorized");
			if (user.passwordHash !== req.body.password)
				return error(401, "Unauthorized");

			const exp = Date.now() + 1000 * 60 * 60; // 1 hour
			req.cookie.auth.set({
				value: await req.jwt.sign({ name: req.body.username, exp }),
				httpOnly: true,
				expires: new Date(exp),
				secure: true,
				sameSite: true,
			});
			return `Sign in as ${req.cookie.auth.value}`;
		},
		{ body: t.Object({ username: t.String(), password: t.String() }) },
	)
	.get("/", () => "Hello, World!")
	.get("/users", () =>
		client.user.findMany({ select: { id: true, username: true, role: true } }),
	)
	.get("/posts", () => client.post.findMany())
	.post("/posts", (req) => client.post.create({ data: req.body }), {
		body: PostInputCreate,
	})
	.get(
		"/posts/:id",
		(req) => client.post.findUnique({ where: { id: req.params.id } }),
		{
			params: t.Object({ id: t.Number() }),
		},
	)
	.put(
		"/posts/:id",
		(req) =>
			client.post.update({
				where: { id: req.params.id },
				data: req.body,
			}),
		{
			params: t.Object({ id: t.Number() }),
			body: PostInputUpdate,
		},
	)
	.listen(port);

export type Server = typeof app;
