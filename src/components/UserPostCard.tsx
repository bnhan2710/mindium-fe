import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../App";
import { url } from "../baseUrl";
import { useAuth } from "../contexts/Auth";
import { httpRequest } from "../interceptor/axiosInterceptor";

type UserPostCardProps = {
  image?: string;
  username: string;
  followers: any;
  bio?: string;
  userId: string;
};

export default function UserPostCard({
  followers,
  userId,
  username,
  bio,
  image,
}: UserPostCardProps) {
  const { user } = useAuth();
  const { socket } = useAppContext();
  const [iFollow, setIFollow] = useState<boolean>(false);
  const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0 });

  // Check if currently following this user
  const { data: followingStatus } = useQuery({
    queryFn: () => httpRequest.get(`${url}/follows/is-following/${userId}`),
    queryKey: ["is-following", user?.id, userId],
    enabled: !!user?.id && user?.id !== userId,
    onSuccess: (response) => {
      console.log('Is following response:', response.data);
      setIFollow(response.data?.isFollowing || false);
    },
    onError: (error) => {
      console.error('Error checking follow status:', error);
      setIFollow(false);
    },
  });

  // Get follow counts
  const { data: countsData } = useQuery({
    queryFn: () => httpRequest.get(`${url}/follows/counts/${userId}`),
    queryKey: ["follow-counts", userId],
    onSuccess: (response) => {
      console.log('Follow counts response:', response.data);
      setFollowCounts(response.data || { followersCount: 0, followingCount: 0 });
    },
    onError: (error) => {
      console.error('Error getting follow counts:', error);
    },
  });

  const { refetch: follow } = useQuery({
    queryFn: () => httpRequest.post(`${url}/follows/${userId}`),
    queryKey: ["handle", "follow", userId],
    enabled: false,
    onSuccess: () => {
      setIFollow(true);
      setFollowCounts(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
    },
  });
  
  const { refetch: unfollow } = useQuery({
    queryFn: () => httpRequest.delete(`${url}/follows/${userId}`),
    queryKey: ["handle", "unfollow", userId],
    enabled: false,
    onSuccess: () => {
      setIFollow(false);
      setFollowCounts(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
    },
  });

  function handleFollowUnfollow() {
    if (iFollow) {
      unfollow();
    } else {
      socket.emit("notify", { userId });
      follow();
    }
  }

  return (
    <div
      style={{
        width: "90%",
        marginLeft: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "12px",
      }}
    >
      <Link to={`/users/${userId}`}>
        <img
          style={{
            width: "90px",
            borderRadius: "50%",
            marginBottom: "8px",
            marginLeft: "8px",
          }}
          src={image}
          alt=""
        />
      </Link>
      <Link
        to={`/users/${userId}`}
        style={{
          marginLeft: "8px",
          fontFamily: "Roboto Slab",
          fontSize: "15px",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        {username}
      </Link>
      <div style={{ marginLeft: "8px", marginTop: "-4px", display: "flex", gap: "10px" }}>
        <Link
          to={`/users/${userId}/followers`}
          style={{
            fontSize: "14px",
            fontFamily: "Roboto",
            color: "#4b4a4a",
            textDecoration: "none",
          }}
        >
          {followCounts.followersCount > 0 ? followCounts.followersCount + " Followers" : "0 Followers"}
        </Link>
        <span style={{ color: "#4b4a4a", fontSize: "14px" }}>•</span>
        <Link
          to={`/users/${userId}/followings`}
          style={{
            fontSize: "14px",
            fontFamily: "Roboto",
            color: "#4b4a4a",
            textDecoration: "none",
          }}
        >
          {followCounts.followingCount > 0 ? followCounts.followingCount + " Following" : "0 Following"}
        </Link>
      </div>
      {bio && (
        <p
          style={{
            color: "gray",
            marginLeft: "8px",
            fontSize: "15px",
            lineHeight: "21px",
          }}
        >
          {bio}
        </p>
      )}
      {user?.id !== userId ? (
        <button
          onClick={() => handleFollowUnfollow()}
          style={{
            width: "fit-content",
            padding: "10px 18px",
            marginLeft: "6px",
            borderRadius: "17px",
            border: iFollow ? "1px solid gray" : "none",
            backgroundColor: iFollow ? "white" : "rgba(26, 137, 23, 1)",
            color: iFollow ? "gray" : "white",
            marginTop: "16px",
            cursor: "pointer",
          }}
        >
          {iFollow ? "Following" : "Follow"}
        </button>
      ) : (
        <p
          style={{
            color: "rgba(26, 137, 23, 1)",
            marginLeft: "8px",
            marginTop: !bio ? "5px" : "12px",
            fontSize: "13.4px",
          }}
        >
          Edit profile
        </p>
      )}
    </div>
  );
}
