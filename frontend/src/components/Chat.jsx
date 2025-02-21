import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';

const Chat = () => {
  const { auth, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('general');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:5000');

    // Join the default room
    socketRef.current.emit('join_room', room);

    // Listen for messages
    socketRef.current.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Fetch existing messages
    fetchMessages();

    return () => {
      socketRef.current.disconnect();
    };
  }, [room]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/${room}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      content: message,
      sender: auth.userId,
      room: room
    };

    try {
      const response = await axios.post('http://localhost:5000/api/messages', messageData);
      socketRef.current.emit('send_message', response.data);
      setMessages(prev => [...prev, response.data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Chat Room: {room}</h1>
          <div className="flex items-center gap-4">
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="general">General</option>
              <option value="random">Random</option>
              <option value="tech">Tech</option>
            </select>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender._id === auth.userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender._id === auth.userId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              <div className="font-medium text-sm">
                {msg.sender.username}
              </div>
              <div>{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;