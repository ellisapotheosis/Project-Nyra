import React from 'react';
import { useMessageStore } from '@/store/messageStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MESSAGE_TYPE_CSS_COLORS, MESSAGE_TYPE_LABELS } from '@/types/messages';

export const MessageFeed: React.FC = () => {
  const { messages } = useMessageStore();

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
                px-2 py-1 rounded text-xs font-medium
                ${MESSAGE_TYPE_CSS_COLORS[message.type] || MESSAGE_TYPE_CSS_COLORS.system}
              `}
            >
              {MESSAGE_TYPE_LABELS[message.type]}
            </span>
            <div>
              <div className="text-sm font-medium">{message.source}</div>
              <div className="text-xs text-gray-600">{message.content}</div>
              <div className="text-xs text-gray-400 mt-1">
                {message.timestamp instanceof Date
                  ? message.timestamp.toLocaleTimeString()
                  : new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};