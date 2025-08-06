import {Link} from "react-router-dom";
import "./storyCard.css";
import { DEFAULT_IMG } from "../App";

type StoryCardProps = {
    showImg: boolean;
    username: string;
    title: string;
    userId: string;
    postId: string;
    slug: string;
    image: string;
    avatar: string;
};

export default function StoryCard({
                                      showImg,
                                      image,
                                      postId,
                                      slug,
                                      title,
                                      userId,
                                      username,
                                      avatar,
                                  }: StoryCardProps) {
    return (
        <div style={{marginLeft: "8px", marginBottom: showImg ? "15px" : "0px"}}>
            <div
                className="firstLine"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <Link to={`/users/${userId}`}>
                    <img
                        style={{width: "22px", borderRadius: "50%"}}
                        src={avatar || DEFAULT_IMG}
                        alt=""
                    />
                </Link>
                <Link
                    className="font"
                    to={`/users/${userId}`}
                    style={{
                        fontFamily: "Roboto Slab",
                        fontSize: "12.75px",
                        letterSpacing: "0.25px",
                        color: "rgb(29 29 29)",
                        textDecoration: "none",
                        marginTop: "-4px",
                    }}
                >
                    {username}
                </Link>
            </div>
            <div
                className="post_details"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <Link
                    to={`/blog/${postId}/${slug}`}
                    style={{
                        fontFamily: "Poppins",
                        fontWeight: "bolder",
                        fontSize: "14px",
                        marginTop: "5px",
                        marginRight: showImg ? "10px" : 0,
                        color: "inherit",
                        textDecoration: "none",
                    }}
                >
                    {title}
                </Link>
                {showImg && (
                    <Link to={`/blog/${postId}/${slug}`} className="img">
                        <img
                            style={{
                                marginTop: "-12px",
                                width: "55px",
                                height: "55px",
                                objectFit: "cover",
                            }}
                            src={image}
                            alt=""
                        />
                    </Link>
                )}
            </div>
        </div>
    );
}
