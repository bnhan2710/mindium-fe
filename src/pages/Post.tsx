import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {httpRequest} from "../interceptor/axiosInterceptor";
import {url} from "../baseUrl";
import Markdown from "../components/Markdown";
import Chip from "../components/Chip";
import {clapIcon, commentIcon, moreIcon, savePost, shareicon,} from "../assets/icons";
import TopPicks from "../components/TopPicks";
import UserPostCard from "../components/UserPostCard";
import PostAuthor from "../components/PostAuthor";
import useShare from "../hooks/useShare";
import {useMemo, useState} from "react";
import {useAuth} from "../contexts/Auth";
import MoreFrom from "../components/MoreFrom";
import {GetStarted} from "../components/AvatarMenu";
import {useAppContext} from "../App";
import PostMenu from "../components/PostMenu";

export default function Post() {
    const {webShare} = useShare();
    const {user, isAuthenticated} = useAuth();
    const {postId, slug} = useParams();
    const postUrl = useMemo(() => window.location.href, [postId, slug]);
    const [votes, setVotes] = useState(0);
    const [turnBlack, setTurnBlack] = useState(false);
    const {socket} = useAppContext();
    const navigate = useNavigate();
    const {handleToast} = useAppContext();

    const {isLoading, error, data} = useQuery({
        queryFn: () => httpRequest.get(`${url}/posts/${postId}/${slug}`),
        queryKey: ["blog", postId, slug],
        onSuccess: (data) => {
            console.log('Fetch result: ', data);
            console.log('Data structure:', data.data);
            console.log('Author Id:', data.data?.authorId || data.data?.post?.authorId);
            

            document.title = (data.data?.title || data.data?.post?.title) + " - Mindium";
            setVotes(0);
            setTurnBlack(true);
            // setVotes(data.data.post?.votes?.length ?? 0);
            // setTurnBlack(data.data.post?.votes.includes(user?.id));
        },
    });

    const { data: authorData } = useQuery({
        queryFn: () => httpRequest.get(`${url}/users/${data?.data?.authorId || data?.data?.post?.authorId}`),
        queryKey: ["author", data?.data?.authorId || data?.data?.post?.authorId],
        enabled: !!(data?.data?.authorId || data?.data?.post?.authorId), 
    });

    const {refetch: clap} = useQuery({
        queryFn: () => httpRequest.patch(`${url}/posts/vote/${postId}`),
        queryKey: ["vote", postId],
        enabled: false,
        onSuccess: (res) => {
            if (res.data.success) {
                socket.emit("notify", {userId: data?.data?.authorId || data?.data?.post?.authorId});
                setVotes((prev) => prev + 1);
            }
        },
    });

    function votePost() {
        setTurnBlack(true);
        clap();
    }

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const {refetch: deleteStory} = useQuery({
        queryFn: () => httpRequest.delete(`${url}/posts/${postId}`),
        queryKey: ["delete", "page", postId],
        enabled: false,
        onSuccess() {
            handleToast("Story deleted successfully");
            handleClose();
            navigate(-1);
        },
    });

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    function deletePost() {
        deleteStory();
    }

    function editPost() {
        navigate(`/write/${postId}`);
    }


    if (error) return <p>Something went wrong ...</p>;
    if (isLoading) return <p>Loading ...</p>;

    return (
        <div
            className="container"
            style={{display: "flex", flexDirection: "row"}}
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
                <div
                    className="post_content"
                    style={{
                        width: "90%",
                        marginRight: "auto",
                    }}
                >
                    {data?.data && authorData?.data && (
                        <PostAuthor
                            title={data.data?.title || data.data?.post?.title}
                            avatar={authorData.data.avatar || ''}
                            postId={data.data?.id || data.data?.post?.id}
                            timestamp={data.data?.createdAt || data.data?.post?.createdAt}
                            username={authorData.data.name || ''}
                            userId={authorData.data.id}
                            postUrl={postUrl}
                            anchorEl={anchorEl}
                            deletePost={deletePost}
                            open={open}
                            handleClose={handleClose}
                            editPost={editPost}
                            handleClick={handleClick}
                        />
                    )}
                    <h1
                        style={{
                            fontWeight: "bolder",
                            fontFamily: "Poppins",
                            fontSize: "32px",
                            marginBottom: "18px",
                        }}
                    >
                        {data?.data?.title || data?.data?.post?.title}
                    </h1>
                    <div className="markdown">
                        <Markdown>{data?.data?.markdown || data?.data?.content || data?.data?.post?.markdown}</Markdown>
                    </div>
                    <div
                        className="bottomScreen"
                        style={{
                            marginTop: "60px",
                        }}
                    >
                        <div className="relatedTags">
                            {(data?.data?.tags || data?.data?.post?.tags)?.map((item: string) => {
                                return (
                                    <Chip
                                        key={item}
                                        style={{
                                            backgroundColor: "rgb(242, 242, 242)",
                                            fontFamily: "Questrial",
                                            padding: "10px 18px",
                                            margin: "4.5px 3px",
                                            fontSize: "13.8px",
                                        }}
                                        text={item}
                                    />
                                );
                            })}
                        </div>
                        <div
                            className="post_reach"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                margin: "5vh 0",
                            }}
                        >
                            <div
                                className="left_tile"
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: "25px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: "8px",
                                        alignItems: "center",
                                    }}
                                >
                  <span
                      onClick={() =>
                          (data?.data?.authorId || data?.data?.post?.authorId) !== user?.id && votePost()
                      }
                      style={{
                          ...iconColor,
                          color: turnBlack ? "black" : "rgb(171 169 169)",
                          cursor:
                              (data?.data?.authorId || data?.data?.post?.authorId) == user?.id
                                  ? "not-allowed"
                                  : "pointer",
                      }}
                  >
                    {clapIcon}
                  </span>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "gray",
                                            fontFamily: "Roboto",
                                        }}
                                    >
                                        {votes || ""}
                                    </p>
                                </div>
                                <span style={iconColor}>{commentIcon}</span>
                            </div>
                            <div
                                className="right_tile"
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: "25px",
                                }}
                            >
                <span
                    onClick={() =>
                        webShare({
                            title: data?.data?.title || data?.data?.post?.title,
                            text: "Check out this Mindium blog",
                            url: postUrl,
                        })
                    }
                    style={iconColor}
                >
                  {shareicon}
                </span>
                                <span style={iconColor}>{savePost}</span>
                                <span onClick={handleClick} style={iconColor}>
                  {moreIcon}
                </span>
                                <PostMenu
                                    anchorEl={anchorEl}
                                    deletePost={deletePost}
                                    open={open}
                                    handleClose={handleClose}
                                    editPost={editPost}
                                    userId={data?.data?.authorId || data?.data?.post?.authorId}
                                />
                            </div>
                        </div>
                    </div>
                    {postId && authorData?.data && (
                        <MoreFrom
                            userId={authorData.data.id}
                            postId={postId}
                            avatar={authorData.data.avatar}
                            username={authorData.data.name}
                            bio={authorData.data.bio}
                            followers={authorData.data.followers}
                        />
                    )}
                </div>
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
                {authorData?.data && (
                    <UserPostCard
                        followers={authorData.data.followers}
                        userId={authorData.data.id}
                        username={authorData.data.name}
                        bio={authorData.data.bio}
                        image={authorData.data.avatar}
                    />
                )}
                {isAuthenticated ? (
                    <TopPicks text="More from Mindium" showImg={true}/>
                ) : (
                    <GetStarted
                        style={{width: "83%", marginLeft: "20px"}}
                        topStyle={{marginTop: "22px"}}
                    />
                )}
            </div>
        </div>
    );
}

const iconColor = {
    color: "rgba(117, 117, 117, 1)",
    cursor: "pointer",
};
