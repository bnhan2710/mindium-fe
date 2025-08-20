import {
  copyurlIcon,
  facebookIcon,
  linkedinIcon,
  moreIcon,
  savePost,
  twitterIcon,
} from "../assets/icons";
import ReactTimeAgo from "react-time-ago";
import { Link } from "react-router-dom";
import useShare from "../hooks/useShare";
import useClipboard from "../hooks/useClipboard";
import PostMenu from "./PostMenu";
import { DEFAULT_IMG } from "../App";

type PostAuthorProps = {
  postId: string;
  username: string;
  avatar: string;
  timestamp: string | number | Date;
  userId: string;
  title: string;
  postUrl: string;
  anchorEl: any;
  open: boolean;
  handleClose: () => void;
  deletePost(): void;
  editPost(): void;
  handleClick(e: any): void;
};

export default function PostAuthor({
  avatar,
  postId,
  timestamp,
  userId,
  username,
  title,
  handleClick,
  postUrl,
  anchorEl,
  deletePost,
  editPost,
  handleClose,
  open,
}: PostAuthorProps) {
  const { socialShare } = useShare();
  const [_, copy] = useClipboard();

  console.log('Timestamp PostAuthor', timestamp);

  function parseToEpochMs(value: string | number | Date | undefined | null): number | null {
    if (value == null) return null;
    if (value instanceof Date) {
      const ms = value.getTime();
      return Number.isFinite(ms) ? ms : null;
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      const numericCandidate = /^[0-9]+$/.test(trimmed) ? Number(trimmed) : Date.parse(trimmed);
      return Number.isFinite(numericCandidate) ? numericCandidate : null;
    }
    return null;
  }

  return (
    <div
      className="author_details"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "22px",
        marginTop: "18px",
      }}
    >
      <div
        className="author_post_details"
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Link to={`/users/${userId}`}>
          <img
            style={{ width: "50px", borderRadius: "50%" }}
            src={avatar || DEFAULT_IMG}
            alt=""
          />
        </Link>
        <div
          className="details-sameline"
          style={{
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link
            style={{ color: "inherit", textDecoration: "none" }}
            to={`/users/${userId}`}
          >
            {username}
          </Link>
          <div
            className="sameline"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <p style={{ fontSize: "13px", color: "gray" }}>
              {(() => {
                const ms = parseToEpochMs(timestamp);
                return ms != null ? (
                  <ReactTimeAgo date={ms} locale="en-US" timeStyle="round" />
                ) : null;
              })()}
            </p>
            <p style={{ fontSize: "13px", color: "gray" }}>3 min read</p>
          </div>
        </div>
      </div>
      <div
        className="shareIcons"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "25px",
        }}
      >
        <div
          className="oneSide"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            onClick={() =>
              socialShare(
                `https://twitter.com/intent/tweet?url=${postUrl}&text=${title}`
              )
            }
            style={iconStyle}
          >
            {twitterIcon}
          </span>
          <span
            onClick={() =>
              socialShare(
                `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`
              )
            }
            style={iconStyle}
          >
            {facebookIcon}
          </span>
          <span
            onClick={() =>
              socialShare(
                `https://www.linkedin.com/shareArticle?mini=true&url=${postUrl}&title=${title}`
              )
            }
            style={iconStyle}
          >
            {linkedinIcon}
          </span>
          <span onClick={() => copy(postUrl, "Link copied")} style={iconStyle}>
            {copyurlIcon}
          </span>
        </div>
        <div
          className="other_side"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={iconStyle}>{savePost}</span>
          <span onClick={handleClick} style={iconStyle}>
            {moreIcon}
          </span>
          <PostMenu
            anchorEl={anchorEl}
            deletePost={deletePost}
            open={open}
            handleClose={handleClose}
            editPost={editPost}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}

const iconStyle = {
  cursor: "pointer",
  color: "gray",
};
