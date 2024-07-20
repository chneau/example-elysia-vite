import Elysia from "elysia";

export const logging = ({
	loggingMethods = ["GET", "PUT", "POST", "DELETE"],
} = {}) => {
	return new Elysia()
		.derive({ as: "global" }, () => ({ start: Date.now() }))
		.onBeforeHandle({ as: "global" }, (ctx) => {
			if (!loggingMethods.includes(ctx.request.method)) return;
			console.log("<--", ctx.request.method, ctx.path);
		})
		.onAfterHandle({ as: "global" }, (ctx) => {
			if (!loggingMethods.includes(ctx.request.method)) return;
			console.log(
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
