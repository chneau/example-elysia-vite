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
