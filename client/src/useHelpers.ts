import {
	type DefaultError,
	type QueryClient,
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { useLocalStorage } from "react-use";
import superjson from "superjson";

type useLocalStorageParams<T> = Parameters<typeof useLocalStorage<T>>;
type useLS<T> = [useLocalStorageParams<T>[0], useLocalStorageParams<T>[1]];
export const useLS = <T>(...args: useLS<T>) => {
	const [value, setValue] = useLocalStorage<T>(...args, {
		raw: false,
		deserializer: superjson.parse,
		serializer: superjson.stringify,
	});
	return [value, setValue] as const;
};

export const useSyncMutation = <
	TData = unknown,
	TError = DefaultError,
	TVariables = void,
	TContext = unknown,
>(
	options: UseMutationOptions<TData, TError, TVariables, TContext>,
	queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TContext> => {
	const mutationResults = useMutation(options, queryClient);
	return {
		...mutationResults,
		mutate: (...params: [TVariables]) => {
			if (mutationResults.isPending) return;
			mutationResults.mutate(...params);
		},
	};
};
