import React from 'react';
import { Message, Role } from '../types';
import { formatTime } from '../utils/helpers';
import { User, Bot, AlertCircle, Link as LinkIcon, Cpu } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  // Simple renderer for code blocks and text
  // In a real production app, we would use a robust Markdown library.
  // Here we use whitespace-pre-wrap to respect formatting from Gemini.
  const renderContent = (text: string) => {
    return (
      <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
        {text}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : isError ? 'bg-red-500' : 'bg-gradient-to-br from-gemini-start to-gemini-end'}`}>
          {isUser ? <User size={16} className="text-white" /> : isError ? <AlertCircle size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Metadata / Name */}
          <span className="text-xs text-gray-400 mb-1 px-1">
            {isUser ? 'You' : 'Gemini'} • {formatTime(message.timestamp)}
          </span>

          {/* Attachments Preview */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {message.attachments.map((att, idx) => (
                <img 
                  key={idx} 
                  src={att.previewUrl} 
                  alt="Attachment" 
                  className="w-32 h-32 object-cover rounded-lg border border-gray-700" 
                />
              ))}
            </div>
          )}

          {/* Text Bubble */}
          <div className={`p-4 rounded-2xl shadow-sm border ${
            isUser 
              ? 'bg-gray-750 border-gray-600 text-white rounded-tr-sm' 
              : isError
                ? 'bg-red-900/20 border-red-800 text-red-200 rounded-tl-sm'
                : 'bg-gray-850 border-gray-700 text-gray-200 rounded-tl-sm'
          }`}>
            {renderContent(message.text)}
          </div>

          {/* Grounding Sources (Search Results) */}
          {message.metadata?.groundingChunks && message.metadata.groundingChunks.length > 0 && (
            <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-800 w-full text-xs">
              <div className="flex items-center gap-2 mb-2 text-gray-400 uppercase font-bold tracking-wider">
                <LinkIcon size={12} />
                <span>Sources</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {message.metadata.groundingChunks.map((chunk, idx) => {
                  if (chunk.web) {
                    return (
                      <a 
                        key={idx} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 truncate hover:underline"
                      >
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Token Usage Stats (Developer Info) */}
          {message.metadata?.usage && !isUser && (
            <div className="mt-1 flex items-center gap-3 px-1">
               <div className="flex items-center gap-1 text-[10px] text-gray-500" title="Prompt Tokens">
                  <span className="uppercase">In:</span> {message.metadata.usage.promptTokens}
               </div>
               <div className="flex items-center gap-1 text-[10px] text-gray-500" title="Response Tokens">
                  <span className="uppercase">Out:</span> {message.metadata.usage.candidatesTokens}
               </div>
               {/* Just a visual flourish for the "Thinking" capability if enabled implicitly by high token count or model */}
               <Cpu size={10} className="text-gray-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
