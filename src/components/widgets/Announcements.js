// src/components/widgets/Announcements.js

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const announcementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(announcementsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="announcement-section">
            <h3>So'nggi Yangiliklar</h3>
            {loading && <p>Yuklanmoqda...</p>}
            {!loading && announcements.length === 0 && <p>Hozircha yangiliklar yo'q.</p>}
            {announcements.map(item => (
                <div key={item.id} className="announcement-item">
                    <p>{item.text}</p>
                </div>
            ))}
        </div>
    );
};

export default Announcements;