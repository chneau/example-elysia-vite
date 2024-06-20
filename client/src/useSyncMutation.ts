import {
	type DefaultError,
	type QueryClient,
	type UseMutateFunction,
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

	const mutate: UseMutateFunction<TData, TError, TVariables, TContext> = (
		...params: [TVariables]
	) => {
		if (mutationResults.isPending) return;
		mutationResults.mutate(...params);
	};
	return { ...mutationResults, mutate };
};
