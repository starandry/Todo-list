import React, { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from 'firebase/auth' // Импортируем тип User
import { auth } from '../../../firebaseConfig'
import styles from './Auth.module.scss' // Импортируем стили

const Auth: React.FC<{
    onLogin: (user: User) => void
}> = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            if (isLogin) {
                // Вход
                const userCredential = await signInWithEmailAndPassword(auth, email, password)
                onLogin(userCredential.user) // user возвращает тип User
            } else {
                // Регистрация
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                onLogin(userCredential.user) // user возвращает тип User
            }
        } catch (err) {
            setError((err as Error).message)
        }
    }

    return (
        <div className={styles['auth-container']}>
            <div className={styles['auth-box']}>
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                </form>
                {error && <p>{error}</p>}
                <button className={styles['switch-btn']} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Switch to Register' : 'Switch to Login'}
                </button>
            </div>
        </div>
    )
}

export default Auth
