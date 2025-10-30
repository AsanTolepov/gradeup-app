// src/components/pages/EditTimetablePage.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import './EditTimetablePage.css'; // <-- BU FAYL MAVJUDLIGINI TEKSHIRING

const EditTimetablePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'schedule'));
                const dayOrder = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba'];
                
                // Firestore'dan kelgan ma'lumotlarni saralashga tayyorlash
                const schedulesMap = new Map();
                querySnapshot.docs.forEach(doc => {
                    schedulesMap.set(doc.id, { id: doc.id, lessons: doc.data().lessons || [] });
                });

                // Kunlar bo'yicha to'g'ri tartibda yig'ib chiqish
                const sortedSchedules = dayOrder.map(day => {
                    return schedulesMap.get(day) || { id: day, lessons: [] };
                });

                setSchedules(sortedSchedules);
            } catch (error) {
                console.error("Tahrirlash uchun jadvallarni yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    const handleLessonChange = (dayIndex, lessonIndex, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex].lessons[lessonIndex][field] = value;
        setSchedules(newSchedules);
    };

    const addLesson = (dayIndex) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex].lessons.push({ time: '', name: '', room: '', teacher: '', type: '' });
        setSchedules(newSchedules);
    };

    const deleteLesson = (dayIndex, lessonIndex) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex].lessons.splice(lessonIndex, 1);
        setSchedules(newSchedules);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const batch = writeBatch(db);
            schedules.forEach(day => {
                // Agar kun uchun darslar bo'lsa, uni saqlaymiz
                if (day.lessons.length > 0) {
                    const docRef = doc(db, 'schedule', day.id);
                    batch.set(docRef, { lessons: day.lessons });
                }
            });
            await batch.commit();
            alert("Jadval muvaffaqiyatli saqlandi!");
        } catch (error) {
            console.error("Saqlashda xatolik:", error);
            alert("Saqlashda xatolik yuz berdi.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-screen">Jadval tahrirlovchi yuklanmoqda...</div>;

    return (
        <div className="edit-timetable-page">
            <div className="page-header">
                <h1>Jadvalni Tahrirlash</h1>
                <button onClick={handleSave} disabled={saving} className="save-button">
                    <FaSave /> {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
                </button>
            </div>

            <div className="timetable-grid">
                {schedules.map((day, dayIndex) => (
                    <div key={day.id} className="day-column">
                        <h3 className="day-title">{day.id}</h3>
                        {day.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="edit-lesson-card">
                                <button className="delete-lesson-btn" onClick={() => deleteLesson(dayIndex, lessonIndex)}><FaTrash /></button>
                                <input type="text" value={lesson.time} onChange={(e) => handleLessonChange(dayIndex, lessonIndex, 'time', e.target.value)} placeholder="Vaqti (08:30)" />
                                <input type="text" value={lesson.name} onChange={(e) => handleLessonChange(dayIndex, lessonIndex, 'name', e.target.value)} placeholder="Dars nomi" />
                                <input type="text" value={lesson.room} onChange={(e) => handleLessonChange(dayIndex, lessonIndex, 'room', e.target.value)} placeholder="Xona" />
                                <input type="text" value={lesson.teacher} onChange={(e) => handleLessonChange(dayIndex, lessonIndex, 'teacher', e.target.value)} placeholder="O'qituvchi" />
                                <input type="text" value={lesson.type} onChange={(e) => handleLessonChange(dayIndex, lessonIndex, 'type', e.target.value)} placeholder="Turi (Amaliyot)" />
                            </div>
                        ))}
                        <button className="add-lesson-btn" onClick={() => addLesson(dayIndex)}><FaPlus /> Dars qo'shish</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditTimetablePage;