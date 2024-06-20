import { useCounter } from "react-use";
import { useMutationCreatePost, useQueryPosts } from "./client";

export const App = () => {
	const [count, { inc }] = useCounter();
	const { data: posts } = useQueryPosts();
	const createPostMutation = useMutationCreatePost();
	const createRandomPost = () => {
		createPostMutation.mutate({
			title: "Hello, World!",
			content: "This is a post.",
			published: true,
			author: { connect: { id: 1 } },
		});
	};
	return (
		<>
			<button type="button" onClick={() => inc()}>
				count is {count}
			</button>
			<button type="button" onClick={createRandomPost}>
				Create random post
			</button>
			{posts.map((post) => (
				<div key={post.id}>
					<h2>{post.title}</h2>
					<p>{post.content}</p>
				</div>
			))}
		</>
	);
};
