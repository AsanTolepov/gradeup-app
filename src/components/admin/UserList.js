// src/components/admin/UserList.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './UserList.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <p>Foydalanuvchilar yuklanmoqda...</p>;
    }

    return (
        <div className="user-list-widget">
            <h3>Tizim Foydalanuvchilari</h3>
            <div className="user-table">
                <div className="user-table-header">
                    <span>Email</span>
                    <span>Ro'yxatdan o'tgan sana</span>
                    <span>Roli</span>
                </div>
                {users.map(user => (
                    <div key={user.id} className="user-table-row">
                        <span>{user.email}</span>
                        <span>{user.createdAt?.toDate().toLocaleDateString('uz-UZ')}</span>
                        <span className={`role-${user.role}`}>{user.role}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;