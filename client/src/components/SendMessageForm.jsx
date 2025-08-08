import React, { useState } from 'react';

const SendMessageForm = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-100 border-t border-gray-200 flex items-center">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-whatsappLightGreen"
            />
            <button
                type="submit"
                className="ml-4 px-4 py-2 bg-whatsappLightGreen text-white rounded-lg hover:bg-whatsappGreen focus:outline-none focus:ring-2 focus:ring-whatsappLightGreen"
            >
                Send
            </button>
        </form>
    );
};

export default SendMessageForm;
