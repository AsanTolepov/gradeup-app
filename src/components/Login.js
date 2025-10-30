import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': // Yangi versiyalarda bu xato keladi
                return 'Email yoki parol noto\'g\'ri.';
            case 'auth/invalid-email':
                return 'Noto\'g\'ri email formati kiritildi.';
            default:
                return 'Tizimga kirishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/'); // Muvaffaqiyatli kirishdan so'ng asosiy sahifaga o'tish
        } catch (err) {
            setError(getFriendlyErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>GRADEUP <br></br> Tizimga Kirish</h2>
                
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
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
                            placeholder="Parolingizni kiriting"
                            required
                        />
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Tekshirilmoqda...' : 'Kirish'}
                    </button>
                </form>

                <p className="switch-auth">
                    Hisobingiz yo'qmi? <Link to="/signup">Ro'yxatdan o'tish</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;