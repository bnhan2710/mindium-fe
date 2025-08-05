import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {useState, useEffect} from "react";
import {useAuth} from "../contexts/Auth";
import {httpRequest} from "../interceptor/axiosInterceptor";
import {url} from "../baseUrl";
import {useAppContext} from "../App";

type UserCardProps = {
    name: string;
    bio?: string;
    id: string;
    avatar: string;
    followers: Array<string>;
};
export default function UserCard({
                                     name,
                                     id,
                                     avatar,
                                     bio,
                                     followers,
                                 }: UserCardProps) {
    const {user} = useAuth();
    const {socket} = useAppContext();
    const [iFollow, setIFollow] = useState<boolean>(false);
    
    // Check if currently following this user
    const {data: followingStatus, refetch: checkFollowingStatus} = useQuery({
        queryFn: () => httpRequest.get(`${url}/follows/is-following/${id}`),
        queryKey: ["is-following", user?.id, id],
        enabled: !!user?.id && user?.id !== id,
        onSuccess: (response) => {
            console.log('UserCard - Is following response:', response.data);
            setIFollow(response.data?.isFollowing || false);
        },
        onError: (error) => {
            console.error('UserCard - Error checking follow status:', error);
            setIFollow(false);
        },
    });

    const {refetch: follow} = useQuery({
        queryFn: () => httpRequest.post(`${url}/follows/${id}`),
        queryKey: ["handle", "follow", id],
        enabled: false,
        onSuccess: () => {
            setIFollow(true);
        },
    });
    
    const {refetch: unfollow} = useQuery({
        queryFn: () => httpRequest.delete(`${url}/follows/${id}`),
        queryKey: ["handle", "unfollow", id],
        enabled: false,
        onSuccess: () => {
            setIFollow(false);
        },
    });

    function handleFollowUnfollow() {
        if (iFollow) {
            unfollow();
        } else {
            socket.emit("notify", {userId: id});
            follow();
        }
    }

    return (
        <div
            style={{
                marginLeft: "8px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
                margin: "12px 0",
            }}
        >
            <Link to={`/users/${id}`}>
                <img
                    style={{width: "36px", borderRadius: "50%", marginTop: "-5px"}}
                    src={
                        avatar ??
                        "https://firebasestorage.googleapis.com/v0/b/upload-pics-e599e.appspot.com/o/images%2F1_dmbNkD5D-u45r44go_cf0g.png?alt=media&token=3ef51503-f601-448b-a55b-0682607ddc8a"
                    }
                    alt=""
                />
            </Link>
            <Link
                to={`/users/${id}`}
                className="name_details"
                style={{color: "inherit", textDecoration: "none"}}
            >
                <p
                    style={{
                        fontWeight: "bold",
                        fontFamily: "Poppins",
                        fontSize: "13.75px",
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    {name}
                </p>
                <p
                    style={{
                        fontSize: "12.75px",
                        fontFamily: "Questrial",
                        marginTop: "4px",
                        lineHeight: "18px",
                        color: "#606060",
                    }}
                >
                    {bio && (bio.length > 62 ? bio?.slice(0, 51) + "..." : bio)}
                </p>
            </Link>
            {user?.id !== id && (
                <button
                    onClick={() => handleFollowUnfollow()}
                    style={{
                        backgroundColor: iFollow ? "white" : "black",
                        outline: "transparent",
                        border: `1px solid ${iFollow ? "gray" : "black"}`,
                        borderRadius: "17px",
                        padding: "7px 14px",
                        cursor: "pointer",
                        marginLeft: "auto",
                        color: iFollow ? "gray" : "white",
                    }}
                >
                    {iFollow ? "Following" : "Follow"}
                </button>
            )}
        </div>
    );
}
