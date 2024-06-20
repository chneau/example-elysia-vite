import { treaty } from "@elysiajs/eden";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Server } from "../../server/server";
import { queryClient } from "./queryClient";

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
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
	});

export const useMutationLogin = () =>
	useMutation({
		mutationKey: ["auth", "login"],
		mutationFn: (body: Parameters<typeof client.login.post>[0]) =>
			client.login.post(body).then((x) => x.data),
	});

export const useMutationLogout = () =>
	useMutation({
		mutationKey: ["auth", "logout"],
		mutationFn: () => client.logout.get().then((x) => x.data),
	});
