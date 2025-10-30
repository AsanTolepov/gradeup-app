import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <--- 1. 'Link' IMPORT QILINDI
import { collection, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
// 2. Ikonkalar to'g'ri import qilindi va keraksizi olib tashlandi
import { FaFileAlt, FaClipboardList, FaUsers } from 'react-icons/fa'; 

const DashboardPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [todaySchedule, setTodaySchedule] = useState(null);
    const [loadingSchedule, setLoadingSchedule] = useState(true);

    // E'lonlarni real vaqtda olish
    useEffect(() => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const announcementsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(announcementsData);
        });
        return () => unsubscribe();
    }, []);

    // Joriy kun nomini o'zbek tilida va kichik harflarda qaytaradigan funksiya
    const getTodayName = () => {
        const days = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
        const todayIndex = new Date().getDay();
        return days[todayIndex];
    };

    // Bugungi dars jadvalini olish
    useEffect(() => {
        const fetchTodaySchedule = async () => {
            setLoadingSchedule(true);
            const todayName = getTodayName();

            if (todayName === 'yakshanba') { 
                setTodaySchedule({ id: todayName, lessons: [] });
                setLoadingSchedule(false);
                return;
            }

            try {
                const docRef = doc(db, 'schedule', todayName);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTodaySchedule({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setTodaySchedule({ id: todayName, lessons: [] });
                }
            } catch (error) {
                console.error("Bugungi darslarni yuklashda xatolik:", error);
                setTodaySchedule({ id: todayName, lessons: [] });
            } finally {
                setLoadingSchedule(false);
            }
        };

        fetchTodaySchedule();
    }, []);

    const renderTodaySchedule = () => {
        if (loadingSchedule) {
            return <p>Darslar yuklanmoqda...</p>;
        }
        if (!todaySchedule || !todaySchedule.lessons || !todaySchedule.lessons.length === 0) {
            return <p>Bugun uchun rejalashtirilgan darslar yo'q.</p>;
        }
        return (
            <div>
                {todaySchedule.lessons.map((lesson, index) => (
                    <div key={index} className="lesson-card">
                        <span className="lesson-time">{lesson.time}</span>
                        <h4 className="lesson-name">{lesson.name}</h4>
                        <span className="lesson-details">{lesson.room} / {lesson.type}</span>
                        <span className="lesson-teacher">{lesson.teacher}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="page-header">
                <h1>GRADEUP</h1>
            </div>

            <div className="dashboard-grid">
                {/* Asosiy ustun */}
                <div className="main-column">
                    <div className="announcement-section">
                        <h2>So'nggi Yangiliklar</h2>
                        {announcements.length > 0 ? (
                            announcements.map(item => (
                                <div key={item.id} className="announcement-item">
                                    <p>{item.text}</p>
                                </div>
                            ))
                        ) : (
                            <p>Hozircha yangiliklar yo'q.</p>
                        )}
                    </div>

                    <div className="today-schedule-widget">
                        <h2>Bugungi Darslar</h2>
                        {renderTodaySchedule()}
                    </div>
                </div>

                {/* Yon ustun */}
                <div className="side-column">
                
                        <div className="widget">
                            <FaFileAlt size={28} style={{ color: 'var(--primary-color)' }} />
                            <h3>Testlar Bo'limi</h3>
                            <p>Yaqinda qo‘shiladi</p>
                        </div>
                    

                    <div className="widget">
                        <FaClipboardList size={28} style={{ color: '#198754' }}/>
                        <h3>Vazifalar</h3>
                        <p>Yaqinda qo‘shiladi</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;