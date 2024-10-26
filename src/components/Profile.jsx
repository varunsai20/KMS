import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './Profile.css';
import profile from '../assets/images/Profile-start.svg';
import upload from '../assets/images/Upload.svg';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const user_id = user?.user_id;
  const token = user?.access_token;

  const [profileImage, setProfileImage] = useState(profile);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    role: 'User',
    department: '',
    job_title: '',
    organization_name: '',
    primary_research_area: '',
    technical_skills: '',
    research_interests: '',
  });

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://13.127.207.184:80/user/profile/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response)
        const userDetails = response.data.user_profile;
        setFormData({
          fullname: userDetails.fullname,
          email: userDetails.email,
          role: userDetails.role,
          department: userDetails.department,
          job_title: userDetails.job_title,
          organization_name: userDetails.organization_name,
          primary_research_area: userDetails.primary_research_area,
          technical_skills: userDetails.technical_skills.join(', '),
          research_interests: userDetails.research_interests.join(', '),
        });
        if (userDetails.profile_picture_url) {
            setProfileImage(userDetails.profile_picture_url);
          }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (user_id) {
      fetchUserDetails();
    }
  }, [user_id, token]);

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
        console.log(imageUrl)
      const formData = new FormData();
      formData.append("file", file);
      console.log("File in FormData:", file);
        
      try {
        await axios.post(
          `http://13.127.207.184/user/upload_profile_picture?user_id=${user_id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log("Profile picture uploaded successfully.");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const updatedData = {
        ...formData,
        user_id,
      };

      await axios.put(
        "http://13.127.207.184:80/user/edit_user_profile",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Profile data saved successfully.");
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };
  return (
    <div className="profile-container">
      <div className="profile-body">
        {/* Form Section */}
        <form className="profile-form" onSubmit={handleSave}>
          {/* Basic Details */}
          <div className="form-section">
            <h3>Basic Details</h3>
            <div className="form-row">
              <div className="form-row-item">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />   
                           </div>
              <div className="form-row-item">
                <label>Email ID</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email ID"
                />
                              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="form-section">
            <h3>Role & Department</h3>
            <div className="form-row">
              <div className="form-row-item">
                <label>Role</label>
                <input type="text" value={formData.role} disabled />
                              </div>
              <div className="form-row-item">
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleInputChange}>
                  <option>Select Department</option>
                  <option>IT</option>
                  <option>HR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="form-section">
            <h3>Professional Details</h3>
            <div className="form-section-multiplerow">
              <div className="form-row">
                <div className="form-row-item">
                  <label>Job Title</label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    placeholder="Enter Job Title"
                  />
                                  </div>
                <div className="form-row-item">
                  <label>Primary Research Area</label>
                  <select
                    name="primary_research_area"
                    value={formData.primary_research_area}
                    onChange={handleInputChange}
                  >
                    <option>Select Research Area</option>
                    <option>DNA</option>
                    <option>Cancer</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-row-item">
                  <label>Organization</label>
                  <input
                  className='org'
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    placeholder="Enter organization name"
                  /></div>
              </div>
              
            </div>
          </div>

          {/* Skills & Research Interests */}
          <div className="form-section">
            <h3>Skills & User Interests</h3>
            <div className="form-row">
              <div className="form-row-item">
                <label>Technical Skills</label>
                <input
                  type="text"
                  name="technical_skills"
                  value={formData.technical_skills}
                  onChange={handleInputChange}
                  placeholder="Enter relevant software, lab techniques, etc."
                />
                              </div>
              <div className="form-row-item">
                <label>User Interests</label>
                <input
                  type="text"
                  name="research_interests"
                  value={formData.research_interests}
                  onChange={handleInputChange}
                  placeholder="Enter user interests"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="submit" className="create-button">
              Save
            </button>
          </div>
        </form>

        {/* Profile Picture Section */}
        <div className="profile-section">
          <div className="profile-picture">
            <img src={profileImage} alt="Profile" />
          </div>

          <div className='profile-upload-button'>
            <img className="profile-section-img" src={upload} alt="Upload Icon" />
            <label className="upload-button">
              Upload picture
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }} // Hidden file input
                onChange={handleImageChange} // Handle the image selection
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;