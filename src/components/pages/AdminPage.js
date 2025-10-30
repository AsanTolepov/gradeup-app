// src/components/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaTrash, FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './AdminPage.css';

const AdminPage = () => {
    const [announcementText, setAnnouncementText] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // success / error
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(list);
            setLoadingAnnouncements(false);
        }, (error) => {
            console.error("E'lonlarni yuklashda xato:", error);
            setLoadingAnnouncements(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!announcementText.trim()) return;

        setLoading(true);
        setMessage('');
        setMessageType('');

        try {
            await addDoc(collection(db, 'announcements'), {
                text: announcementText.trim(),
                createdAt: serverTimestamp()
            });
            setMessage("E'lon muvaffaqiyatli qo'shildi!");
            setMessageType('success');
            setAnnouncementText('');
        } catch (error) {
            console.error("Xatolik:", error);
            setMessage("Xatolik yuz berdi. Qayta urinib ko'ring.");
            setMessageType('error');
        } finally {
            setLoading(false);
            setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 4000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu e'lonni o'chirishni xohlaysizmi?")) return;

        try {
            await deleteDoc(doc(db, 'announcements', id));
            setMessage("E'lon o'chirildi.");
            setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("O'chirishda xato:", error);
            setMessage("O'chirishda xatolik yuz berdi.");
            setMessageType('error');
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Yangi e'lonlar qo'shing va boshqaring</h2>
            </div>

            {/* Xabar bildirishnomasi */}
            {message && (
                <div className={`alert alert-${messageType}`}>
                    {messageType === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span>{message}</span>
                </div>
            )}

            {/* Yangi e'lon qo'shish */}
            <div className="card form-card">
                <h2>Yangi E'lon</h2>
                <form onSubmit={handleSubmit} className="announcement-form">
                    <textarea
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="Bu yerda e'lon matnini yozing..."
                        rows="4"
                        maxLength="500"
                        required
                    />
                    <div className="form-actions">
                        <span className="char-count">{announcementText.length}/500</span>
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? (
                                <>
                                    <FaSpinner className="spin" /> Yuborilmoqda...
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane /> Yuborish
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Mavjud e'lonlar */}
            <div className="card announcements-card">
                <h2>Mavjud E'lonlar</h2>
                {loadingAnnouncements ? (
                    <div className="loading">
                        <FaSpinner className="spin large" /> Yuklanmoqda...
                    </div>
                ) : announcements.length > 0 ? (
                    <ul className="announcement-list">
                        {announcements.map((item) => (
                            <li key={item.id} className="announcement-item">
                                <div className="announcement-text">{item.text}</div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="delete-btn"
                                    title="O'chirish"
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-state">Hozircha hech qanday e'lon yo'q.</p>
                )}
            </div>
        </div>
    );
};

export default AdminPage;