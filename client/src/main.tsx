import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { queryClient } from "./queryClient";

const localStoragePersister = createSyncStoragePersister({
	storage: window.localStorage,
});
persistQueryClient({ queryClient, persister: localStoragePersister });

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
createRoot(root).render(
	<QueryClientProvider client={queryClient}>
		<ReactQueryDevtools initialIsOpen={false} />
		<StrictMode>
			<App />
		</StrictMode>
	</QueryClientProvider>,
);
