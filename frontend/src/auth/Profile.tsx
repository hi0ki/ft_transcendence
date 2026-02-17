import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        alert('You are not logged in!');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  return (
    <div>
      <h2>Profile</h2>
      {user ? <p>Email: {user.email}</p> : <p>Loading...</p>}
    </div>
  );
};

export default Profile;
