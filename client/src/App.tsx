import { useCounter } from "react-use";
import { useFetchIndex } from "./client";

export const App = () => {
	const [count, { inc }] = useCounter();
	const { data: helloWorld } = useFetchIndex();
	return (
		<>
			<h1>Server says: {helloWorld}</h1>
			<button type="button" onClick={() => inc()}>
				count is {count}
			</button>
		</>
	);
};
