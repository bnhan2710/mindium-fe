import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { moreIcon } from "../assets/icons";
import { url } from "../baseUrl";
import Post from "../components/Post";
import Tab from "../components/Tab";
import UserPostCard from "../components/UserPostCard";
import { useAuth } from "../contexts/Auth";
import { httpRequest } from "../interceptor/axiosInterceptor";
import AboutSection from "../components/AboutSection";
import SavedSection from "../components/SavedSection";
import UserCard from "../components/UserCard";
import { toTitleCase, generateSlug } from "../utils/helper";
import ListSection from "../components/ListSection";

const USER_PAGE_TAB_OPTIONS_AUTH = [
  {
    id: 1,
    url: "/users/userId",
    title: "home",
  },
  {
    id: 2,
    url: "/users/userId/lists",
    title: "lists",
  },
  {
    id: 3,
    url: "/users/userId/about",
    title: "about",
  },
];

const USER_PAGE_TAB_OPTIONS_UNAUTH = [
  {
    id: 1,
    url: "/users/userId",
    title: "home",
  },
  {
    id: 3,
    url: "/users/userId/about",
    title: "about",
  },
];
export default function User() {
  const { tab } = useParams();
  const { id } = useParams();
  const { user } = useAuth();
  const [query] = useSearchParams();

  const activeQuery = query.get("active");

  const [optionsTab, setOptionsTab] = useState<
    typeof USER_PAGE_TAB_OPTIONS_AUTH
  >([]);
  const [posts, setposts] = useState<Array<any>>([]);
  const [followersData, setFollowersData] = useState<Array<any>>([]);
  const [followingsData, setFollowingsData] = useState<Array<any>>([]);
  const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0 });

  // Debug state changes
  useEffect(() => {
    console.log('📊 State updated - followersData:', followersData.length, 'followingsData:', followingsData.length);
  }, [followersData, followingsData]);

  useEffect(() => {
    if (tab) return;
    refetch();
  }, [tab]);

  const { data } = useQuery({
    queryFn: () => httpRequest.get(`${url}/users/${id}`),
    queryKey: ["user", id],
    onSuccess: (data) => {
      document.title = data.data.name + " - Mindium";
      setOptionsTab(() => {
        if (user?.id === id)
          return USER_PAGE_TAB_OPTIONS_AUTH.map((item) => {
            return { ...item, url: item.url.replace("userId", data.data.id) };
          });
        else
          return USER_PAGE_TAB_OPTIONS_UNAUTH.map((item) => {
            return { ...item, url: item.url.replace("userId", data.data.id) };
          });
      });
    },
  });

  const { refetch } = useQuery({
    queryFn: () => httpRequest.get(`${url}/posts/users/${id}`),
    enabled: false,
    queryKey: ["post", "user", id],
    onSuccess(response) {
      setposts(response.data);
    },
  });

  const { refetch: getAllFollowers } = useQuery({
    queryFn: () => {
      console.log('getAllFollowers queryFn called with URL:', `${url}/follows/followers?userId=${id}&page=1&size=10`);
      return httpRequest.get(`${url}/follows/followers?userId=${id}&page=1&size=10`);
    },
    enabled: false,
    queryKey: ["followers", "user", id],
    onSuccess(res) {
      console.log('✅ Followers onSuccess called');
      console.log('Followers response: ', res.data);
      // Backend returns { followers: [{ followerId, createdAt, userProfile }], total, page, size }
      const followersData = res.data?.followers || [];
      const mappedFollowers = followersData.map((item: any) => ({
        id: item.userProfile?.id || item.followerId,
        name: item.userProfile?.name || 'Unknown',
        avatar: item.userProfile?.avatar,
        bio: item.userProfile?.bio,
        followers: [] // We don't have nested follower data
      }));
      console.log('Mapped followers: ', mappedFollowers);
      setFollowersData(mappedFollowers);
    },
    onError(error) {
      console.error('❌ Error fetching followers: ', error);
    },
  });

  const { refetch: getAllFollowings } = useQuery({
    queryFn: () => {
      console.log('getAllFollowings queryFn called with URL:', `${url}/follows/following?userId=${id}&page=1&size=10`);
      return httpRequest.get(`${url}/follows/following?userId=${id}&page=1&size=10`);
    },
    enabled: false,
    queryKey: ["followings", "user", id],
    onSuccess(res) {
      console.log('✅ Followings onSuccess called');
      console.log('Followings response: ', res.data);
      console.log('Full followings response object: ', res);
      // Backend returns { following: [{ followeeId, createdAt, userProfile }], total, page, size }
      const followingsData = res.data?.following || [];
      console.log('Followings data before mapping: ', followingsData);
      const mappedFollowings = followingsData.map((item: any) => {
        console.log('Mapping following item: ', item);
        return {
          id: item.userProfile?.id || item.followeeId,
          name: item.userProfile?.name || 'Unknown',
          avatar: item.userProfile?.avatar,
          bio: item.userProfile?.bio,
          followers: [] // We don't have nested follower data
        };
      });
      console.log('Mapped followings: ', mappedFollowings);
      setFollowingsData(mappedFollowings);
    },
    onError(error) {
      console.error('❌ Error fetching followings: ', error);
    },
  });

  // Get follow counts for the user
  const { data: countsData } = useQuery({
    queryFn: () => httpRequest.get(`${url}/follows/counts/${id}`),
    queryKey: ["follow-counts", id],
    enabled: !!id,
    onSuccess: (response) => {
      console.log('User page - Follow counts response:', response.data);
      setFollowCounts(response.data || { followersCount: 0, followingCount: 0 });
    },
    onError: (error) => {
      console.error('User page - Error getting follow counts:', error);
    },
  });

  useEffect(() => {
    console.log('useEffect triggered - data:', !!data?.data, 'tab:', tab);
    if (!data?.data || !tab) return;
    if (tab == "followers") {
      console.log('Fetching followers...');
      console.log('About to call getAllFollowers with id:', id);
      getAllFollowers().then((result) => {
        console.log('getAllFollowers promise resolved:', result);
      }).catch((error) => {
        console.error('getAllFollowers promise rejected:', error);
      });
    } else if (tab == "followings") {
      console.log('Fetching followings...');
      console.log('About to call getAllFollowings with id:', id);
      getAllFollowings().then((result) => {
        console.log('getAllFollowings promise resolved:', result);
      }).catch((error) => {
        console.error('getAllFollowings promise rejected:', error);
      });
    } else {
      console.log('Fetching posts...');
      refetch();
    }
    return () => {
      setposts([]);
      setFollowersData([]);
      setFollowingsData([]);
    };
  }, [data?.data, tab]);

  function filterPost(postId: string) {
    setposts((prev) => prev.filter((item) => item.id !== postId));
  }

  return (
    <div
      className="container"
      style={{ display: "flex", flexDirection: "row" }}
    >
      <div
        className="postsList"
        style={{
          borderRight: "solid 1px rgba(242, 242, 242, 1)",
          width: "69%",
          paddingTop: "3vh",
          minHeight: "97vh",
          display: "flex",
          flexDirection: "column",
          gap: "38px",
          marginRight: "auto",
        }}
      >
        {tab && (tab == "followers" || tab == "followings" || activeQuery) ? (
          activeQuery ? (
            <div
              className="inner_container_main"
              style={{
                width: "90%",
                marginRight: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                marginTop: "30px",
              }}
            >
              <ListSection listName={activeQuery} />
            </div>
          ) : (
            <div
              className="inner_container_main"
              style={{
                width: "90%",
                marginRight: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                marginTop: "30px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13.5px",
                }}
              >
                <Link
                  to={`/users/${id}`}
                  style={{ color: "gray", textDecoration: "none" }}
                >
                  {data?.data.name}
                </Link>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="sk sl"
                >
                  <path
                    d="M6.75 4.5l4.5 4.5-4.5 4.5"
                    stroke="#242424"
                    strokeWidth="1.13"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                <p>{toTitleCase(tab)}</p>
              </div>
              <h1 style={{ marginBottom: "18px" }}>
                {tab === "followers" ? followersData.length : followingsData.length} {toTitleCase(tab || '')}
              </h1>
              {(() => {
                const currentData = tab === "followers" ? followersData : followingsData;
                console.log(`Rendering ${tab} with data:`, currentData);
                return currentData.map((user: any) => {
                  return (
                    <UserCard
                      id={user.id}
                      avatar={user.avatar}
                      followers={user.followers}
                      name={user.name}
                      bio={user.bio}
                      key={user.id}
                    />
                  );
                });
              })()}
            </div>
          )
        ) : (
          <div
            className="inner_container_main"
            style={{
              width: "90%",
              marginRight: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "30px",
            }}
          >
            <div
              className="upperline"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
                marginTop: "28px",
              }}
            >
              <h1 style={{ fontSize: "40px" }}>{data?.data?.name}</h1>
              <span style={{ color: "gray" }}>{moreIcon}</span>
            </div>
            <Tab options={optionsTab} activeTab={tab ?? "home"} />
            <span style={{ marginTop: "-20px" }}>{""}</span>
            {!tab &&
              posts.map((item: any) => {
                console.log('Item: ', item);
                return (
                  <Post
                    showUserList={true}
                    postId={item.id}
                    slug={generateSlug(item.title)}
                    timestamp={item.createdAt}
                    title={item.title}
                    username={data?.data?.name}
                    userId={id as string}
                    image={item.image}
                    tag={item.tags.at(0)}
                    userImage={data?.data?.avatar}
                    key={item.id}
                    summary={item.summary}
                    showMuteicon={false}
                    filterPost={filterPost}
                  />
                );
              })}
            {tab == "lists" && id && <SavedSection userId={id} />}
            {tab == "about" && (
              <AboutSection
                userId={id!}
                bio={data?.data.bio}
                followers={followCounts.followersCount}
                followings={followCounts.followingCount}
              />
            )}
          </div>
        )}
      </div>
      <div
        className="rightbar"
        style={{
          width: "31%",
          paddingTop: "3vh",
          display: "flex",
          flexDirection: "column",
          gap: "38px",
        }}
      >
        {data?.data && (
          <UserPostCard
            followers={[]} // We now get counts from API, not from user data
            userId={data.data.id}
            username={data.data.name}
            bio={data.data.bio}
            image={data.data.avatar}
          />
        )}
      </div>
    </div>
  );
}
