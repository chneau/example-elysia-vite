import { treaty } from "@elysiajs/eden";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "react-use";
import superjson from "superjson";
import type { Server } from "../../server/server";
import { queryClient } from "./queryClient";
import { useSyncMutation } from "./useSyncMutation";

const client = treaty<Server>("localhost:3000", {
	fetch: { credentials: "include" },
});

export const useQueryIndex = () =>
	useQuery({
		queryKey: ["index"],
		queryFn: () => client.index.get().then((x) => x.data ?? ""),
		initialData: "",
	});

export const useQueryUsers = () =>
	useQuery({
		queryKey: ["users"],
		queryFn: () => client.users.get().then((x) => x.data ?? []),
		initialData: [],
	});

export const useQueryPosts = () =>
	useQuery({
		queryKey: ["posts"],
		queryFn: () => client.posts.get().then((x) => x.data ?? []),
		initialData: [],
	});

export const useMutationCreatePost = () =>
	useMutation({
		mutationKey: ["posts", "create"],
		mutationFn: (body: Parameters<typeof client.posts.post>[0]) =>
			client.posts.post(body).then((x) => x.data),
		onSuccess: (x) =>
			x && queryClient.invalidateQueries({ queryKey: ["posts"] }),
	});

export const useMutationDeletePost = () =>
	useSyncMutation({
		mutationKey: ["posts", "delete"],
		mutationFn: (id: number) =>
			client
				.posts({ id })
				.delete()
				.then((x) => x.data),
		onSuccess: (x) =>
			x && queryClient.invalidateQueries({ queryKey: ["posts"] }),
	});

type LoginBody = Parameters<typeof client.login.post>[0];
type LoginData = NonNullable<
	Awaited<ReturnType<typeof client.login.post>>["data"]
>;
export const useMutationAuth = () => {
	const [auth, setAuth] = useLocalStorage<LoginData | null>("auth", null, {
		raw: false,
		deserializer: superjson.parse,
		serializer: superjson.stringify,
	});
	const loginMutation = useMutation({
		mutationKey: ["auth", "login"],
		mutationFn: (body: LoginBody) =>
			client.login.post(body).then((x) => {
				setAuth(x.data);
				return x.data;
			}),
	});

	const logoutMutation = useMutation({
		mutationKey: ["auth", "logout"],
		mutationFn: () =>
			client.logout.get().then((x) => {
				setAuth(null);
				return x.data;
			}),
	});
	return {
		auth,
		login: loginMutation.mutate,
		logout: logoutMutation.mutate,
	};
};
