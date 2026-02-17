import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import { UserContext } from "../../context/UserContext.jsx";
import { useContext } from "react";

const Profile = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [plan, setPlan] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const USER_ID = userData?.id || userData?._id;
  const { updateUser } = useContext(UserContext);


  // ================= FETCH USER =================
  const getUser = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${USER_ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setFormData(res.data.user);
      setPreview(res.data.user.avatar);
    } catch (err) {
      console.log("Profile Error:", err);
    }
  };

  // ================= FETCH PLAN =================
  const getPlan = async () => {
    try {
     const res = await axios.get(
  `http://localhost:5000/api/subscriptions/my-plan`,
  { headers: { Authorization: `Bearer ${token}` } }
);

      setPlan(res.data.plan);
    } catch (err) {
      setPlan(null);
    }
  };

  useEffect(() => {
    if (USER_ID && token) {
      getUser();
      getPlan();
    }
  }, [USER_ID, token]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      if (imageFile) {
        form.append("image", imageFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/users/${USER_ID}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data.user);
      setFormData(res.data.user);
      setPreview(`${res.data.user.avatar}?t=${Date.now()}`);
      updateUser({
               ...res.data.user,
            id: res.data.user._id
              });



      alert("Profile Updated Successfully ✅");
      setOpen(false);
      setImageFile(null);

    } catch (err) {
      console.log("Update Error:", err.response?.data || err.message);
      alert("Update failed ❌");
    }
  };

  if (!user) return <h3>Loading profile...</h3>;

  return (
    <div className="profile-page">

      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-image-wrapper">
            <img
              src={preview || "https://i.pravatar.cc/150?img=12"}
              alt="profile"
              className="profile-img"
            />
            {/* <label className="camera-icon">
              📷
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </label> */}
          </div>

          <div>
            <h2>{user.name}</h2>
            <p>{user.role}</p>
            <span>{user.address}</span>
          </div>
        </div>

        <div className="info-box">
          <div className="info-header">
            <h3>Personal Information</h3>
            <button className="edit-btn" onClick={() => setOpen(true)}>Edit</button>
          </div>

          <div className="info-grid">
            <div><label>Name</label><p>{user.name}</p></div>
            <div><label>Email</label><p>{user.email}</p></div>
            <div><label>Phone</label><p>{user.phone}</p></div>
            <div><label>Address</label><p>{user.address}</p></div>
            <div><label>Role</label><p>{user.role}</p></div>
          </div>
        </div>
      </div>

      {/* ================= PLAN ================= */}
      <div className="info-box plan-box">
        <div className="info-header">
          <h3>My Subscription Plan</h3>
        </div>

        {plan ? (
          <div className="info-grid">
            <div><label>Plan Name</label><p>{plan.planName}</p></div>
            <div><label>Amount</label><p>₹{plan.amount}</p></div>
            <div><label>Status</label><p className="status active">{plan.status}</p></div>
            <div><label>Start</label><p>{new Date(plan.startDate).toLocaleDateString()}</p></div>
            <div><label>Expiry</label><p>{new Date(plan.expiryDate).toLocaleDateString()}</p></div>
          </div>
        ) : (
          <p className="no-plan">No active plan purchased</p>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="modal-body">

              <div className="input-group image-edit-group">
                <label>Profile Image</label>
               <div className="image-edit-wrapper">
  <img src={preview} alt="preview" className="edit-profile-img" />

  <label className="upload-icon">
    📷
    <input type="file" hidden onChange={handleImageChange} />
  </label>
</div>

              </div>

              <div className="input-group">
                <label>Name</label>
                <input name="name" value={formData.name || ""} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input name="email" value={formData.email || ""} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input name="phone" value={formData.phone || ""} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Address</label>
                <input name="address" value={formData.address || ""} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Role</label>
                <select name="role" value={formData.role || ""} onChange={handleChange}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
                <button className="save-btn" onClick={handleUpdate}>Save Changes</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
