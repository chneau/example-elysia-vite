import { deflateSync, gzipSync } from "bun";
import Elysia, {
	type Context,
	ELYSIA_RESPONSE,
	type error,
	type LifeCycleType,
	mapResponse,
} from "elysia";

const isElysiaResponse = (
	object: unknown,
): object is ReturnType<typeof error> => {
	if (!object) return false;
	return typeof object === "object" && ELYSIA_RESPONSE in object;
};

const prepareResponse = (response: unknown, set: Context["set"]) => {
	let isJson = typeof response === "object";
	let text = isJson ? JSON.stringify(response) : response?.toString() ?? "";
	let status = set.status;
	if (isElysiaResponse(response)) {
		text = response.response?.toString() ?? "";
		status = response[ELYSIA_RESPONSE];
		isJson = typeof response.response === "object";
	}
	const contentType = isJson ? "application/json" : "text/plain";
	set.status = status;
	set.headers["Content-Type"] = `${contentType};charset=utf-8`;
	return text;
};

const toResponse = (text: unknown, set: Context["set"]) => {
	const res = mapResponse(text, set);
	set.status = undefined;
	set.cookie = undefined;
	set.redirect = undefined;
	set.headers = {};
	return res;
};

type Options = {
	threshold?: number;
	allowed?: ("deflate" | "gzip")[];
	as?: LifeCycleType;
};
export const compression = ({
	threshold = 1000,
	allowed = ["deflate", "gzip"],
	as = "global",
}: Options = {}) => {
	const encoder = new TextEncoder();
	const compressEncoders: {
		[key: string]: ((buffer: Uint8Array) => Uint8Array) | undefined;
	} = {
		deflate: allowed.includes("deflate") ? deflateSync : undefined,
		gzip: allowed.includes("gzip") ? gzipSync : undefined,
	};
	return new Elysia().mapResponse({ as }, ({ response, set, headers }) => {
		const text = prepareResponse(response, set);
		if (text.length < threshold) return toResponse(text, set);
		for (const encoding of headers["accept-encoding"]?.split(", ") ?? []) {
			const _encoder = compressEncoders[encoding];
			if (_encoder) {
				set.headers["Content-Encoding"] = encoding;
				return toResponse(_encoder(encoder.encode(text)), set);
			}
		}
		return toResponse(text, set);
	});
};
