import { useCounter } from "react-use";
import {
	useMutationCreatePost,
	useMutationDeletePost,
	useMutationLogin,
	useMutationLogout,
	useQueryPosts,
	useQueryUsers,
} from "./client";

export const App = () => {
	const [count, { inc }] = useCounter();
	const { data: posts } = useQueryPosts();
	const { data: users } = useQueryUsers();
	const createPostMutation = useMutationCreatePost();
	const deletePostMutation = useMutationDeletePost();
	const loginMutation = useMutationLogin();
	const logoutMutation = useMutationLogout();
	const createRandomPost = () => {
		if (!users[0]) return;
		createPostMutation.mutate({
			title: "Hello, World!",
			content: "This is a post.",
			published: true,
		});
	};
	const loginAs = (username: string) => {
		loginMutation.mutate({ username, password: username });
	};
	return (
		<>
			<button type="button" onClick={() => inc()}>
				count is {count}
			</button>
			<button type="button" onClick={createRandomPost}>
				Create random post
			</button>
			<button type="button" onClick={() => loginAs("root")}>
				Login as root
			</button>
			<button type="button" onClick={() => logoutMutation.mutate()}>
				Logout
			</button>
			<br />
			User IDs: {users.map((x) => x.id).join(", ")}
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
						Delete
					</button>
				</div>
			))}
		</>
	);
};
