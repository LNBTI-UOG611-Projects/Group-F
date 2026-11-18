import { useState } from "react";
import "./CustomerProfile.css";

function CustomerProfile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSave(event) {
    event.preventDefault();
    setIsEditing(false);
    setMessage(
      "Changes are saved temporarily. Database connection is pending."
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-heading">
          <div>
            <h2>My Profile</h2>
            <p>View and manage your personal information.</p>
          </div>

          <button
            type="button"
            className="profile-edit-button"
            onClick={() => {
              setIsEditing(!isEditing);
              setMessage("");
            }}
          >
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="profile-fields">
            <div className="profile-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled
                placeholder="Email will come from your account"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="phone">Contact Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your contact number"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your address"
                rows="3"
              />
            </div>
          </div>

          {isEditing && (
            <button type="submit" className="profile-save-button">
              Save Changes
            </button>
          )}

          {message && <p className="profile-message">{message}</p>}
        </form>
      </div>
    </section>
  );
}

export default CustomerProfile;