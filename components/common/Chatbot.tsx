import React, { useState, useRef, useEffect } from 'react';
import { useAuth, useChatbot, useTranslation } from '../../App';
import { getChatbotResponse } from '../../services/aiService';
import { ChatMessage, UserRole } from '../../types';
import Spinner from './Spinner';
import XIcon from '../icons/XIcon';
import AIIcon from '../icons/AIIcon';
import UserIcon from '../icons/UserIcon';
import SendIcon from '../icons/SendIcon';
import CameraIcon from '../icons/CameraIcon';

const Chatbot: React.FC = () => {
    const { user } = useAuth();
    const { t, language } = useTranslation();
    const { isChatbotOpen, toggleChatbot, messages, addMessage, pageContext } = useChatbot();
    
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    if (!isChatbotOpen || !user) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if ((!trimmedInput && !imagePreview) || isLoading) return;
        
        const userMessage: ChatMessage = { sender: 'user', text: trimmedInput, image: imagePreview || undefined };
        addMessage(userMessage);
        setInputValue('');
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setIsLoading(true);

        try {
            const aiResponseText = await getChatbotResponse([...messages, userMessage], pageContext, user.role, language);
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText };
            addMessage(aiMessage);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
            addMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-60 flex justify-end items-end z-50 animate-fade-in-fast">
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm h-[70vh] m-4 flex flex-col text-gray-800 dark:text-gray-200 transform transition-transform animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <AIIcon className="h-6 w-6 text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">RootBot Assistant</h2>
                    </div>
                    <button onClick={toggleChatbot} className="p-1 rounded-full text-gray-800 dark:text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-all transform active:scale-95">
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>
                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                    <AIIcon className="w-5 h-5 text-green-600" />
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md p-1 rounded-2xl ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-bl-none'}`}>
                                {msg.image && <img src={msg.image} alt="User upload" className="rounded-xl max-h-40 mb-2" />}
                                {msg.text && <p className="text-sm px-2 pb-2" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
                            </div>
                             {msg.sender === 'user' && (
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <AIIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="max-w-xs p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-2">
                        {imagePreview && (
                            <div className="relative w-24">
                                <img src={imagePreview} alt="Preview" className="rounded-lg h-24 w-24 object-cover" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"
                                    aria-label="Remove image"
                                >
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask or scan an herb..."
                                className="flex-1 p-3 text-sm text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                disabled={isLoading}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                                capture="environment"
                            />
                            {user.role === UserRole.Farmer && (
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Scan herb">
                                    <CameraIcon className="h-5 w-5" />
                                </button>
                            )}
                            <button type="submit" className="p-3 rounded-full bg-green-700 text-white hover:bg-green-800 disabled:bg-green-900 disabled:cursor-not-allowed transition-colors transform active:scale-95" disabled={isLoading || (!inputValue.trim() && !imagePreview)}>
                                {isLoading ? <Spinner size="h-5 w-5" /> : <SendIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default Chatbot;