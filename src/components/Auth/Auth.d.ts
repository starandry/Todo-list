import React from 'react'
import { User } from 'firebase/auth'
declare const Auth: React.FC<{
    onLogin: (user: User) => void
}>
export default Auth
