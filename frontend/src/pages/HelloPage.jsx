import { useState, useEffect } from 'react';
import { getHelloMessage } from '../api/apiService';

function HelloPage() {
    const [message, setMessage] = useState('Loading message from backend...');
    const [error, setError] = useState(null);

    useEffect(() => {
        // Call the API when the component loads
        getHelloMessage()
            .then(response => {
                // Set the message from the 'data' property of the response
                setMessage(response.data.message);
            })
            .catch(err => {
                console.error("Error fetching data: ", err);
                setError("Could not fetch data. Make sure the backend is running.");
            });
    }, []); // The empty array ensures this effect runs only once

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Backend Data</h1>
            {error ? <p style={{ color: 'red' }}>{error}</p> : <p>{message}</p>}
        </div>
    );
}

export default HelloPage;