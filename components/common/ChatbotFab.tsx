import React from 'react';
import { useChatbot } from '../../App';
import ChatIcon from '../icons/ChatIcon';

const ChatbotFab: React.FC = () => {
  const { toggleChatbot } = useChatbot();

  return (
    <button
      onClick={toggleChatbot}
      className="fixed bottom-6 right-6 bg-green-700 hover:bg-green-800 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 active:scale-95 z-40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label="Open AI Assistant"
    >
      <ChatIcon className="h-7 w-7" />
    </button>
  );
};

export default ChatbotFab;