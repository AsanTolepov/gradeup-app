import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, storage, db } from '../../firebase';
import { updateProfile, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

import { FaUserCircle, FaCamera, FaSignOutAlt, FaChevronRight, FaSpinner, FaQuestionCircle, FaHeadset } from 'react-icons/fa';

import './ProfilePage.css';

const ProfilePage = () => {
    const { currentUser, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [photoURL, setPhotoURL] = useState(currentUser?.photoURL);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleUpload = useCallback(async () => {
        if (!photo || !currentUser) return;
        setLoading(true);

        const fileRef = ref(storage, `profile_pictures/${currentUser.uid}`);
        
        try {
            const snapshot = await uploadBytes(fileRef, photo);
            const newPhotoURL = await getDownloadURL(snapshot.ref);

            // Firebase Auth profilini yangilash
            await updateProfile(currentUser, { photoURL: newPhotoURL });
            
            // Firestore'dagi user hujjatini ham yangilash (agar mavjud bo'lmasa, yaratadi)
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, { photoURL: newPhotoURL }, { merge: true });

            setPhotoURL(newPhotoURL); // UI'ni yangilash
        } catch (error) {
            console.error("Rasm yuklashda xatolik:", error);
            alert("Rasm yuklashda xatolik yuz berdi.");
        } finally {
            setLoading(false);
            setPhoto(null);
        }
    }, [photo, currentUser]);

    // Agar fayl tanlansa, avtomatik yuklash
    useEffect(() => {
        if (photo) {
            handleUpload();
        }
    }, [photo, handleUpload]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="avatar-section">
                    <input 
                        type="file" 
                        id="photoInput" 
                        onChange={handleImageChange} 
                        accept="image/*"
                        style={{ display: 'none' }} 
                    />
                    <label htmlFor="photoInput" className="avatar-container">
                        {loading ? (
                            <FaSpinner className="spinner" size={80} />
                        ) : (
                            photoURL ? (
                                <img src={photoURL} alt="Profil rasmi" className="avatar-img" />
                            ) : (
                                <FaUserCircle size={80} className="avatar-placeholder" />
                            )
                        )}
                        <div className="camera-overlay">
                            <FaCamera size={20} />
                        </div>
                    </label>
                </div>
                
                <h2 className="user-name">{currentUser?.displayName || currentUser?.email}</h2>
                <p className="user-status">{isAdmin ? 'Admin' : 'Foydalanuvchi'}</p>
            </div>

            <div className="actions-list">
                <a href="/help" className="action-item">
                    <FaQuestionCircle className="action-icon" />
                    <span>Yordam</span>
                    <FaChevronRight className="action-arrow" />
                </a>
                <a href="/support" className="action-item">
                    <FaHeadset className="action-icon" />
                    <span>Qo'llab-quvvatlash</span>
                    <FaChevronRight className="action-arrow" />
                </a>
            </div>

            <div className="logout-section">
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt />
                    <span>Chiqish</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;