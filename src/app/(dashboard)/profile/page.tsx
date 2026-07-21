"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, handleApiError } from "@/lib/api";
import PageSkeleton from "@/components/ui/PageSkeleton";
import "./profile.css";
export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { data: profile, isLoading: loading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      if (!response.ok) {
        throw new Error("Failed to load profile");
      }
      return response.profile;
    },
    meta: {
      errorMessage: "Failed to load profile"
    }
  });

  // Profile data for edits (syncs with query data when loaded)
  const [profileId, setProfileId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("");

  useEffect(() => {
    if (profile) {
      setProfileId(profile.id);
      setProfileName(profile.displayName);
      setProfileEmail(profile.email);
      setProfileRole(profile.role);
    }
  }, [profile]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const initials = profileName
    ? profileName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileName || !profileEmail) {
      Swal.fire("Warning", "Display name and email cannot be empty.", "warning");
      return;
    }

    try {
      setSaving(true);
      const response = await profileApi.updateProfile({
        displayName: profileName,
        email: profileEmail
      });

      if (response.ok) {
        Swal.fire("Success", "Profile updated successfully", "success");
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        Swal.fire("Error", "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      Swal.fire("Error", handleApiError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire("Warning", "All password fields are required.", "warning");
      return;
    }
    
    if (newPassword.length < 8) {
      Swal.fire("Security Error", "New password must be at least 8 characters long.", "error");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Swal.fire("Validation Error", "New password and confirmation do not match.", "error");
      return;
    }

    try {
      setChangingPassword(true);
      const response = await profileApi.changePassword({
        currentPassword,
        newPassword
      });

      if (response.ok) {
        Swal.fire("Password Updated", response.message || "Your password has been changed.", "success");
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Swal.fire("Error", "Failed to change password", "error");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      Swal.fire("Error", handleApiError(error), "error");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Account Settings</p>
            <h3>My Operator Profile</h3>
          </div>
        </div>
        <PageSkeleton layout="page" />
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Account Settings</p>
          <h3>My Operator Profile</h3>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
        {/* Profile Card & Edit Form */}
        <article className="panel-card">
          <div className="panel-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <p className="eyebrow">Personal Details</p>
              <h4>Edit Profile Information</h4>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              color: "#fff",
              fontSize: "1.6rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {initials}
            </div>
            <div>
              <h4 style={{ margin: 0, color: "#0f172a" }}>{profileName}</h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                <span className="badge info" style={{ textTransform: "capitalize" }}>
                  {profileRole.replace('_', ' ')}
                </span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="department-detail-form">
            <div className="policy-form-grid" style={{ gap: 16 }}>
              <label className="filter-control">
                <span>Display Name</span>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={saving}
                  required
                />
              </label>
              <label className="filter-control">
                <span>Email Address</span>
                <input 
                  type="email" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)}
                  disabled={saving}
                  required
                />
              </label>
              <label className="filter-control">
                <span>Role</span>
                <input 
                  type="text" 
                  value={profileRole.replace('_', ' ')}
                  disabled
                  style={{ 
                    backgroundColor: "#f1f5f9", 
                    cursor: "not-allowed",
                    textTransform: "capitalize"
                  }}
                />
                <small style={{ color: "#64748b", fontSize: "0.8rem", marginTop: 4, display: "block" }}>
                  Role cannot be changed
                </small>
              </label>
            </div>
            <button 
              type="submit" 
              className="export-summary-btn" 
              style={{ marginTop: 24 }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </article>

        {/* Password Changes Form */}
        <article className="panel-card">
          <div className="panel-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <p className="eyebrow">Security</p>
              <h4>Update Password</h4>
            </div>
          </div>

          <form onSubmit={handleSavePassword} className="department-detail-form">
            <div className="policy-form-grid" style={{ gap: 16 }}>
              <label className="filter-control">
                <span>Current Password</span>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={changingPassword}
                  placeholder="Enter current password"
                />
              </label>
              <label className="filter-control">
                <span>New Password</span>
                <input 
                  type="password" 
                  placeholder="At least 8 characters" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changingPassword}
                  minLength={8}
                />
              </label>
              <label className="filter-control">
                <span>Confirm New Password</span>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={changingPassword}
                  placeholder="Re-enter new password"
                />
              </label>
            </div>
            <button 
              type="submit" 
              className="export-summary-btn" 
              style={{ marginTop: 24, backgroundColor: "#1e293b" }}
              disabled={changingPassword}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
