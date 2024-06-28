import Elysia from "elysia";

export const logging = () => {
	return new Elysia()
		.derive({ as: "global" }, (ctx) => {
			console.log("<--", ctx.request.method, ctx.path);
			return { start: Date.now() };
		})
		.onResponse({ as: "global" }, (ctx) => {
			return console.log(
				"-->",
				ctx.request.method,
				ctx.path,
				ctx.set.status ?? 200,
				"in",
				Date.now() - ctx.start,
				"ms",
			);
		});
};
