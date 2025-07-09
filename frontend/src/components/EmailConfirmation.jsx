// src/components/EmailConfirmation.js

import React, { useState } from 'react';
import axios from 'axios';

const EmailConfirmation = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/confirm-email', { email, code });
            setMessage('Your email has been confirmed! You can now log in.');
        } catch (error) {
            setMessage('Invalid email or confirmation code.');
        }
    };

    return (
        <div>
            <h2>Confirm Your Email</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Enter confirmation code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                <button type="submit">Confirm</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default EmailConfirmation;