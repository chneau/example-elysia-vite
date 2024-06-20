import cors from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { PrismaClient } from "@prisma/client";
import { Elysia, t } from "elysia";
import { compression } from "./compression";
import { PostInputCreate, PostInputUpdate } from "./prisma/prismabox/Post";

const port = Bun.env.PORT ?? "3000";
console.log(`Server: http://localhost:${port}`);

const client = new PrismaClient();

(async () => {
	const user = await client.user.findFirst({
		select: { id: true, username: true },
	});
	console.log({ user });
	if (!user) {
		console.log("Creating user");
		await client.user.create({
			data: {
				username: "username",
				passwordHash: "passwordHash",
				role: "role",
			},
		});
	}
	console.log("Deleting all posts");
	await client.post.deleteMany();
})();

const app = new Elysia()
	.use(serverTiming())
	.use(cors())
	.use(compression())
	.get("/", () => "Hello, World!")
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
