'use client';

import React from 'react';
import { MessageStream } from '@/components/messages/MessageStream';

const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-white">Messages</h1>
      <MessageStream />
    </div>
  );
};

export default MessagesPage;
