import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime'
import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth' // Импортируем тип User
import { auth } from '../../../firebaseConfig'
import styles from './Auth.module.scss'
const Auth = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState(null)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            if (isLogin) {
                // Вход
                const userCredential = await signInWithEmailAndPassword(auth, email, password)
                onLogin(userCredential.user)
            } else {
                // Регистрация
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                onLogin(userCredential.user)
            }
        } catch (err) {
            setError(err.message)
        }
    }
    return _jsx('div', {
        className: styles['auth-container'],
        children: _jsxs('div', {
            className: styles['auth-box'],
            children: [
                _jsx('h2', { children: isLogin ? 'Login' : 'Register' }),
                _jsxs('form', {
                    onSubmit: handleSubmit,
                    children: [
                        _jsx('input', {
                            type: 'email',
                            placeholder: 'Email',
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                        }),
                        _jsx('input', {
                            type: 'password',
                            placeholder: 'Password',
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                        }),
                        _jsx('button', { type: 'submit', children: isLogin ? 'Login' : 'Register' }),
                    ],
                }),
                error && _jsx('p', { children: error }),
                _jsx('button', {
                    className: styles['switch-btn'],
                    onClick: () => setIsLogin(!isLogin),
                    children: isLogin ? 'Switch to Register' : 'Switch to Login',
                }),
            ],
        }),
    })
}
export default Auth
