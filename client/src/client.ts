import { treaty } from "@elysiajs/eden";
import { useQuery } from "@tanstack/react-query";
import type { Server } from "../../server/server";

const client = treaty<Server>("localhost:3000");

export const useFetchIndex = () =>
	useQuery({
		queryKey: ["index"],
		queryFn: () => client.index.get().then((x) => x.data ?? ""),
		initialData: "",
	});
