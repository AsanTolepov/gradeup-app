import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Bu email manzili allaqachon ro\'yxatdan o\'tgan.';
            case 'auth/invalid-email':
                return 'Noto\'g\'ri email formati kiritildi.';
            case 'auth/weak-password':
                return 'Parol juda oddiy. Kamida 6 ta belgidan iborat bo\'lishi kerak.';
            default:
                return 'Ro\'yxatdan o\'tishda kutilmagan xatolik yuz berdi.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Muvaffaqiyatli ro'yxatdan o'tgandan so'ng login sahifasiga o'tish va foydalanuvchi o'z ma'lumotlari bilan kirishi mumkin
            navigate('/login'); 
        } catch (err) {
            setError(getFriendlyErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

   return (
    <div className="auth-container">
        <div className="auth-card">
            <h2>GRADEUP <br></br> Ro'yxatdan o'tish</h2>
            
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Emailingizni kiriting"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Parol</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Parol yarating (min. 6 belgi)"
                        required
                    />
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish'}
                </button>
            </form>
            
            <p className="switch-auth">
                Hisobingiz bormi? <Link to="/login">Kirish</Link>
            </p>
        </div>
    </div>
    );
};

export default Signup;