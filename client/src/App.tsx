import { useCounter } from "react-use";
import {
	useMutationAuth,
	useMutationCreatePost,
	useMutationDeletePost,
	useQueryPosts,
} from "./client";

export const App = () => {
	const [count, { inc }] = useCounter();
	const { data: posts } = useQueryPosts();
	const createPostMutation = useMutationCreatePost();
	const deletePostMutation = useMutationDeletePost();
	const { auth, login, logout } = useMutationAuth();
	const createRandomPost = () => {
		createPostMutation.mutate({
			title: "Hello, World!",
			content: "This is a post.",
			published: true,
		});
	};
	const loginAs = (username: string) =>
		login.mutate({ username, password: username });
	return (
		<>
			<button type="button" onClick={() => inc()}>
				count is {count}
			</button>
			<button type="button" onClick={createRandomPost}>
				Creat{createPostMutation.isPending ? "ing" : "e"} random post
			</button>
			<button type="button" onClick={() => loginAs("root")}>
				Login{login.isPending && "ing"} as root
			</button>
			<button type="button" onClick={() => logout.mutate()}>
				Logout{logout.isPending && "ing"}
			</button>
			<br />
			<pre>auth: {JSON.stringify(auth)}</pre>
			{posts.map((post) => (
				<div key={post.id}>
					<h2>
						{post.title} ({post.id})
					</h2>
					<p>{post.content}</p>
					<button
						type="button"
						onClick={() => deletePostMutation.mutate(post.id)}
					>
						Delete{deletePostMutation.isPending && "ing"}
					</button>
				</div>
			))}
		</>
	);
};
