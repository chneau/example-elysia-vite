import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { queryClient } from "./queryClient";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
createRoot(root).render(
	<QueryClientProvider client={queryClient}>
		<StrictMode>
			<App />
		</StrictMode>
	</QueryClientProvider>,
);
