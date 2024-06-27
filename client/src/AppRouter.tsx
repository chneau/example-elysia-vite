import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import {
	Link,
	Outlet,
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { App } from "./App";
import { queryClient } from "./queryClient";

const localStoragePersister = createSyncStoragePersister({
	storage: window.localStorage,
});
persistQueryClient({ queryClient, persister: localStoragePersister });
const rootRoute = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<div>
				<Link to="/">Home</Link> <Link to="/about">About</Link>
			</div>
			<hr />
			<Outlet />
			<TanStackRouterDevtools />
			<ReactQueryDevtools />
		</QueryClientProvider>
	),
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: App,
});

const aboutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/about",
	component: () => "Hello from About!",
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export const AppRouter = () => <RouterProvider router={router} />;
