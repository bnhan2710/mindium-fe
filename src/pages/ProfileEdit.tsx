import { useState, useEffect } from "react";
import { useAuth } from "../contexts/Auth";
import { httpRequest } from "../interceptor/axiosInterceptor";
import { url } from "../baseUrl";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEdit({ isOpen, onClose }: ProfileEditProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const [characterCounts, setCharacterCounts] = useState({
    name: 0,
    bio: 0
  });
  const queryClient = useQueryClient();

  // Load current user data
  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile();
    }
  }, [isOpen, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await httpRequest.get(`${url}/users/${user?.id}`);
      const userData = response.data;
      setProfileData({
        name: userData.name || "",
        bio: userData.bio || "",
        avatar: userData.avatar || "",
      });
      setCharacterCounts({
        name: (userData.name || "").length,
        bio: (userData.bio || "").length
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === "name" || field === "bio") {
      setCharacterCounts(prev => ({
        ...prev,
        [field]: value.length
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileData(prev => ({
      ...prev,
      avatar: ""
    }));
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: () => httpRequest.put(`${url}/users/${user?.id}`, {
      name: profileData.name.trim(),
      bio: profileData.bio.trim(),
      avatar: profileData.avatar,
    }),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["is-following"] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts"] });
      
      onClose();
      window.location.reload(); // Refresh to show updated profile
    },
    onError: (error: any) => {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  });

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (profileData.name.length > 50) {
      toast.error("Name must be 50 characters or less");
      return;
    }

    if (profileData.bio.length > 160) {
      toast.error("Bio must be 160 characters or less");
      return;
    }

    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: "32rem",
          margin: "0 1rem",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#111827",
            margin: 0
          }}>Profile information</h2>
          <button
            onClick={onClose}
            style={{
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              padding: "4px",
              borderRadius: "4px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: "1.5rem"
        }}>
          {/* Photo Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.75rem"
            }}>Photo</label>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}>
              <div style={{ position: "relative" }}>
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Profile"
                    style={{
                      width: "4rem",
                      height: "4rem",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #d1d5db"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    backgroundColor: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <span style={{
                      fontSize: "1.5rem",
                      color: "#9ca3af",
                      fontWeight: "600"
                    }}>
                      {profileData.name.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
              
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <label style={{
                  cursor: "pointer",
                  color: "#16a34a",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}>
                  Update
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                <button
                  onClick={handleRemoveImage}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            
            <p style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              marginTop: "0.5rem",
              lineHeight: "1.25rem"
            }}>
              Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels per side.
            </p>
          </div>

          {/* Name Field */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.5rem"
            }}>
              Name*
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                  paddingRight: "3rem"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                maxLength={50}
                placeholder="Enter your name"
              />
              <div style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.875rem",
                color: "#9ca3af"
              }}>
                {characterCounts.name}/50
              </div>
            </div>
          </div>

          {/* Short Bio */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.5rem"
            }}>
              Short bio
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  minHeight: "4rem"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                rows={3}
                maxLength={160}
                placeholder="Tell us a bit about yourself..."
              />
              <div style={{
                position: "absolute",
                right: "0.75rem",
                bottom: "0.5rem",
                fontSize: "0.875rem",
                color: "#9ca3af"
              }}>
                {characterCounts.bio}/160
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          padding: "1.5rem",
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb"
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              backgroundColor: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "white")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !profileData.name.trim()}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: (loading || !profileData.name.trim()) ? "#d1d5db" : "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: (loading || !profileData.name.trim()) ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => {
              if (!loading && profileData.name.trim()) {
                e.currentTarget.style.backgroundColor = "#15803d";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && profileData.name.trim()) {
                e.currentTarget.style.backgroundColor = "#16a34a";
              }
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}