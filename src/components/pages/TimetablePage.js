import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <--- Link'ni import qilamiz
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext'; // <--- useAuth'ni import qilamiz
import { FaEdit } from 'react-icons/fa'; // <--- Ikonka import qilamiz

const WEEK_DAYS_ORDER = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba'];

const TimetablePage = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth(); // <--- Admin statusini olamiz

    useEffect(() => {
        const fetchTimetable = async () => {
            // ... (bu qism o'zgarmaydi)
            try {
                const scheduleCollection = collection(db, 'schedule');
                const scheduleSnapshot = await getDocs(scheduleCollection);
                
                const scheduleData = scheduleSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const sortedSchedule = scheduleData.sort((a, b) => {
                    const indexA = WEEK_DAYS_ORDER.indexOf(a.id);
                    const indexB = WEEK_DAYS_ORDER.indexOf(b.id);
                    return indexA - indexB;
                });

                setTimetable(sortedSchedule);
            } catch (error) {
                console.error("Dars jadvalini yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    if (loading) {
        return <div className="loading-screen">Dars jadvali yuklanmoqda...</div>;
    }

    return (
        <div className="timetable-page">
            <div className="page-header">
                <h1>To'liq Dars Jadvali</h1>
                
                {/* ===== ADMIN UCHUN TAHRIRLASH TUGMASI ===== */}
                {isAdmin && (
                    <Link to="/admin/edit-timetable" className="edit-button">
                        <FaEdit /> Tahrirlash
                    </Link>
                )}
            </div>

            <div className="timetable-grid">
                {/* ... (bu qism o'zgarmaydi) ... */}
                {timetable.length > 0 ? (
                    timetable.map(day => (
                        <div key={day.id} className="day-column">
                            <h3 className="day-title">{day.id}</h3>
                            {day.lessons && day.lessons.length > 0 ? (
                                day.lessons.map((lesson, index) => (
                                    <div key={index} className="lesson-card">
                                        <span className="lesson-time">{lesson.time}</span>
                                        <h4 className="lesson-name">{lesson.name}</h4>
                                        <span className="lesson-details">{lesson.room} / {lesson.type}</span>
                                        <span className="lesson-teacher">{lesson.teacher}</span>
                                    </div>
                                ))
                            ) : (
                                <p>Bu kunga darslar kiritilmagan.</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Dars jadvali topilmadi yoki hali kiritilmagan.</p>
                )}
            </div>
        </div>
    );
};

export default TimetablePage;