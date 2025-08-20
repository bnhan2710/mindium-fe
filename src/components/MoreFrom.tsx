import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {Link} from "react-router-dom";
import {useAppContext} from "../App";
import {url} from "../baseUrl";
import {useAuth} from "../contexts/Auth";
import {httpRequest} from "../interceptor/axiosInterceptor";
import Post from "./Post";

export default function MoreFrom({
                                     userId,
                                     postId,
                                     username,
                                     bio,
                                     followers,
                                 }: {
    userId: string;
    postId: string;
    username: string;
    avatar: string;
    bio: string;
    followers: Array<string>;
}) {
    const {user} = useAuth();
    const {socket} = useAppContext();
    const [iFollow, setIFollow] = useState(followers?.includes(user?.id ?? ""));
    const [posts, setposts] = useState<Array<any>>([]);
    const {handleToast} = useAppContext();
    const queryClient = useQueryClient();

    useQuery({
        queryFn: () => httpRequest.get(`${url}/suggestions/posts/${postId}`),
        queryKey: ["more", "from", userId, postId],
        onSuccess(resp) {
            setposts(resp?.data);
        },
    });

    // Follow user mutation
    const followMutation = useMutation({
        mutationFn: () => httpRequest.put(`${url}/users/follow/${userId}`),
        onSuccess: () => {
            setIFollow(true);
            
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["more", "from", userId, postId] });
            queryClient.invalidateQueries({ queryKey: ["is-following", user?.id, userId] });
            queryClient.invalidateQueries({ queryKey: ["follow-counts", userId] });
            queryClient.invalidateQueries({ queryKey: ["user", userId] });
        },
    });

    // Unfollow user mutation
    const unfollowMutation = useMutation({
        mutationFn: () => httpRequest.put(`${url}/users/unfollow/${userId}`),
        onSuccess: () => {
            setIFollow(false);
            
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["more", "from", userId, postId] });
            queryClient.invalidateQueries({ queryKey: ["is-following", user?.id, userId] });
            queryClient.invalidateQueries({ queryKey: ["follow-counts", userId] });
            queryClient.invalidateQueries({ queryKey: ["user", userId] });
        },
    });

    function filterPost(postId: string) {
        setposts((prev) => prev.filter((item) => item.id !== postId));
    }

    function handleFollowUnfollow() {
        if (iFollow) {
            unfollowMutation.mutate();
        } else {
            socket.emit("notify", {userId: userId});
            followMutation.mutate();
        }
    }

    return (
        <div
            className="morefrom"
            style={{
                backgroundColor: "#fafafa",
                padding: "22px 25px",
                borderRadius: "3px",
                width: "96.5%",
                marginLeft: "-10px",
            }}
        >
            <div
                className="top_more_from"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                }}
            >
                <div className="left_more_from" style={{width: "65%"}}>
                    <Link
                        to={`/users/${userId}`}
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <h3>More from {username}</h3>
                    </Link>
                    <p
                        style={{
                            color: "rgba(117, 117, 117, 1)",
                            fontSize: "14px",
                            marginTop: "-8px",
                            marginBottom: "45px",
                            lineHeight: "24px",
                        }}
                    >
                        {bio}
                    </p>
                </div>
                <div className="right_more_from">
                    {user?.id !== userId && (
                        <button
                            onClick={() => handleFollowUnfollow()}
                            style={{
                                marginTop: "20px",
                                backgroundColor: iFollow ? "transparent" : "#669254",
                                padding: "10px 18px",
                                border: iFollow ? "1px solid gray" : "none",
                                outline: "none",
                                borderRadius: "18px",
                                color: iFollow ? "black" : "white",
                                cursor: "pointer",
                            }}
                        >
                            {iFollow ? "Unfollow" : "Follow"}
                        </button>
                    )}
                </div>
            </div>
            <div
                className="inner_container_main"
                style={{display: "flex", flexDirection: "column", gap: "30px"}}
            >
                {posts.map((post: any) => {
                    return (
                        <Post
                            postId={post.id}
                            summary={post.summary}
                            title={post.title}
                            timestamp={Date.parse(post.createdAt)}
                            showMuteicon={false}
                            image={post.image}
                            key={post.id}
                            tag={post.tags.at(0)}
                            showUserList={false}
                            userId={post.userId}
                            filterPost={filterPost} 
                            slug={""}                        />
                    );
                })}
            </div>
        </div>
    );
}
