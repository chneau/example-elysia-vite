import {
	type DefaultError,
	type QueryClient,
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";

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
