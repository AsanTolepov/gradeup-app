import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    doc, 
    getDoc, 
    setDoc, 
    deleteDoc, // <--- O'chirish uchun import qilindi
    serverTimestamp 
} from 'firebase/firestore';
import { 
    FaBars, 
    FaBell, 
    FaTimes, 
    FaHome, 
    FaCalendarAlt, 
    FaUser, 
    FaSignOutAlt, 
    FaUserShield,
    FaTrash // <--- O'chirish ikonkasini import qilindi
} from 'react-icons/fa';

const MainLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    
    const notificationsRef = useRef(null);
    const navigate = useNavigate();
    const { currentUser, isAdmin } = useAuth();

    // Yangiliklarni va o'qilmagan xabarlar holatini tekshirish
    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, async (announcementsSnapshot) => {
            const announcementsData = announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(announcementsData);

            if (announcementsData.length === 0) {
                setHasUnread(false);
                return;
            }

            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const lastSeen = userData.lastSeenAnnouncements?.toDate();
                const latestAnnouncementTime = announcementsData[0].createdAt?.toDate();

                if (!lastSeen || (latestAnnouncementTime && latestAnnouncementTime > lastSeen)) {
                    setHasUnread(true);
                } else {
                    setHasUnread(false);
                }
            } else {
                setHasUnread(true);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Tashqarida bosilganda bildirishnomalarni yopish
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleNotificationToggle = async () => {
        const willBeOpen = !isNotificationsOpen;
        setNotificationsOpen(willBeOpen);

        if (willBeOpen && hasUnread) {
            setHasUnread(false);
            const userDocRef = doc(db, "users", currentUser.uid);
            try {
                await setDoc(userDocRef, {
                    lastSeenAnnouncements: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Ko'rilgan vaqtni yangilashda/yaratishda xatolik:", error);
            }
        }
    };

    // E'lonni o'chirish funksiyasi
    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm("Haqiqatan ham bu e'lonni o'chirmoqchimisiz?")) {
            try {
                const docRef = doc(db, 'announcements', id);
                await deleteDoc(docRef);
            } catch (error) {
                console.error("E'lonni o'chirishda xatolik:", error);
                alert("E'lonni o'chirishda xatolik yuz berdi.");
            }
        }
    };

    return (
        <div className="layout">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>GradeUp</h3>
                    <button className="close-btn" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/" end onClick={() => setSidebarOpen(false)}> <FaHome /> Boshqaruv paneli</NavLink>
                    <NavLink to="/timetable" onClick={() => setSidebarOpen(false)}> <FaCalendarAlt /> Dars jadvali</NavLink>
                    {isAdmin && (
                        <NavLink to="/admin" onClick={() => setSidebarOpen(false)}> <FaUserShield /> Admin Panel</NavLink>
                    )}
                </nav>
            </aside>

            <div className="main-content">
                <header className="header">
                    <div className="header-left">
                        <button className="menu-btn" onClick={() => setSidebarOpen(true)}><FaBars /></button>
                    </div>

                    <div className="header-right">
                        <div className="notifications-container" ref={notificationsRef}>
                            <button className="notification-btn" onClick={handleNotificationToggle}>
                                <FaBell />
                                {hasUnread && <span className="notification-dot"></span>}
                            </button>
                            {isNotificationsOpen && (
                                <div className="notifications-dropdown">
                                    <div className="notifications-header"><h4>Bildirishnomalar</h4></div>
                                    <div className="notifications-list">
                                        {announcements.length > 0 ? (
                                            announcements.map(item => (
                                                <div key={item.id} className="notification-item">
                                                    <p>{item.text}</p>
                                                    {isAdmin && (
                                                        <button 
                                                            className="delete-announcement-btn" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAnnouncement(item.id);
                                                            }}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : <p className="no-notifications">Yangi bildirishnomalar yo'q.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="desktop-profile-actions">
                            <span className="user-email">{currentUser?.email}</span>
                            <button onClick={handleLogout} className="desktop-logout-btn">
                                <FaSignOutAlt /> Chiqish
                            </button>
                        </div>
                    </div>
                </header>

                <main className="content-area">
                    <Outlet />
                </main>
            </div>

            <nav className="bottom-nav">
                <NavLink to="/" end><FaHome /><span>Panel</span></NavLink>
                <NavLink to="/timetable"><FaCalendarAlt /><span>Jadval</span></NavLink>
                <NavLink to="/profile"><FaUser /><span>Profil</span></NavLink>
            </nav>
        </div>
    );
};

export default MainLayout;