import React from 'react';
import { MessageCircle, User } from 'lucide-react';
import { Message } from './ChatBot';
import InteractiveChart from './InteractiveChart';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex items-start gap-2 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot
            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
            : 'bg-gradient-to-r from-green-500 to-teal-500'
        }`}
      >
        {isBot ? (
          <MessageCircle className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Contenido del mensaje */}
      <div className={`flex-1 max-w-[80%] ${isBot ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`p-3 rounded-lg ${
            isBot
              ? 'bg-muted rounded-tl-none'
              : 'bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-tr-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Gráfica si existe */}
        {message.chartData && (
          <div className="mt-3 w-full">
            <InteractiveChart data={message.chartData} />
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
