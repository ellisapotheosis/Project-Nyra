import React from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const MessageFeed: React.FC = () => {
  const { messages } = useMessageStore();

  const typeBadgeColors = {
    system: 'bg-gray-200 text-gray-800',
    agent: 'bg-blue-200 text-blue-800',
    user: 'bg-green-200 text-green-800'
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="text-center text-gray-500">
          <LoadingSpinner />
          <p>No messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Message Stream</h2>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {messages.slice(0, 50).map((message) => (
          <div
            key={message.id}
            className="p-2 rounded bg-gray-50 flex items-start gap-2"
          >
            <span
              className={`
                px-2 py-1 rounded text-xs
                ${typeBadgeColors[message.type]}
              `}
            >
              {message.type}
            </span>
            <div>
              <div className="text-sm font-medium">{message.sender}</div>
              <div className="text-xs text-gray-600">{message.content}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};