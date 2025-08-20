import {Link} from "react-router-dom";
import {mediumLogo, moreIcon, NotificationIcon} from "../assets/icons";
import AvatarMenu from "./AvatarMenu";

type WriteNavType = {
    onClick(): void;
    disabled: boolean;
    buttonText: string;
    onClearDraft?: () => void;
};

export default function WriteNavbar({
                                        onClick,
                                        disabled,
                                        buttonText,
                                        onClearDraft,
                                    }: WriteNavType) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                height: "70px",
            }}
        >
            <div className="left_write_nav">
                <Link to="/">{mediumLogo}</Link>
            </div>
            <div
                className="right_write_nav"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "18px",
                }}
            >
                {/* cbe4ca */}
                <button
                    disabled={disabled}
                    onClick={() => {
                        !disabled && onClick();
                    }}
                    style={{
                        color: "white",
                        backgroundColor: disabled ? "#cbe4ca" : "#1a8917",
                        border: "none",
                        outline: "none",
                        padding: "6px 12px",
                        borderRadius: "15px",
                        letterSpacing: "0.2px",
                        cursor: "pointer",
                    }}
                >
                    {buttonText}
                </button>
                {onClearDraft && (
                    <button
                        onClick={onClearDraft}
                        style={{
                            color: "#666",
                            backgroundColor: "transparent",
                            border: "1px solid #ddd",
                            outline: "none",
                            padding: "6px 12px",
                            borderRadius: "15px",
                            cursor: "pointer",
                        }}
                    >
                        Clear Draft
                    </button>
                )}
                <span style={{color: "gray", cursor: "pointer"}}>{moreIcon}</span>
                <Link to="/notifications">
          <span style={{color: "gray", cursor: "pointer"}}>
            {NotificationIcon}
          </span>
                </Link>
                <AvatarMenu/>
            </div>
        </div>
    );
}
