import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Bugungi kun nomini o'zbek tilida olish uchun yordamchi funksiya
const getTodayDayName = () => {
    const days = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
    const todayIndex = new Date().getDay();
    return days[todayIndex];
};

const TodaySchedule = () => {
    const [todayLessons, setTodayLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDayOff, setIsDayOff] = useState(false);

    useEffect(() => {
        const fetchTodaySchedule = async () => {
            const dayId = getTodayDayName();
            
            // Yakshanba yoki boshqa dam olish kuni bo'lsa, serverga so'rov yubormaymiz
            if (dayId === 'yakshanba') {
                setIsDayOff(true);
                setLoading(false);
                return;
            }

            try {
                // Firestore'dan 'schedule' kolleksiyasidan bugungi kunga mos hujjatni olamiz
                // Masalan, 'dushanba', 'seshanba', ...
                const docRef = doc(db, 'schedule', dayId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().lessons) {
                    // Darslarni vaqt bo'yicha saralaymiz
                    const sortedLessons = docSnap.data().lessons.sort((a, b) => a.time.localeCompare(b.time));
                    setTodayLessons(sortedLessons);
                } else {
                    // Hujjat bor, lekin darslar yo'q yoki hujjat umuman yo'q
                    setIsDayOff(true);
                }
            } catch (error) {
                console.error("Bugungi jadvalni yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTodaySchedule();
    }, []);

    if (loading) {
        return <div className="today-schedule-widget"><p>Bugungi jadval yuklanmoqda...</p></div>;
    }

    return (
        <div className="today-schedule-widget">
            <h3>Bugungi Darslar</h3>
            {isDayOff || todayLessons.length === 0 ? (
                <p>Bugun darslar yo'q. Dam oling!</p>
            ) : (
                todayLessons.map((lesson, index) => (
                    <div key={index} className="schedule-item">
                        <div className="schedule-time">{lesson.time}</div>
                        <div className="schedule-details">
                            <p className="lesson-name">{lesson.name}</p>
                            <span className="lesson-info">{lesson.room} / {lesson.teacher}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default TodaySchedule;