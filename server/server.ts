import cors from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { PrismaClient } from "@prisma/client/edge";
import { Elysia } from "elysia";
import { compression } from "./compression";

const port = Bun.env.PORT ?? "3000";
console.log(`Server: http://localhost:${port}`);

const client = new PrismaClient();

const app = new Elysia()
	.use(serverTiming())
	.use(cors())
	.use(compression())
	.get("/", () => "Hello, World!")
	.get("/posts", async () => {
		const posts = await client.post.findMany();
		return posts;
	})
	.listen(port);

export type Server = typeof app;
