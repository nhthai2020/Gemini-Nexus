import React, { useRef, useState } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Attachment } from '../types';
import { fileToBase64 } from '../utils/helpers';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        const newAttachment: Attachment = {
          mimeType: file.type,
          data: base64,
          previewUrl: URL.createObjectURL(file)
        };
        setAttachments([...attachments, newAttachment]);
      } catch (err) {
        console.error("Failed to process image", err);
      }
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSend(input, attachments);
    setInput('');
    setAttachments([]);
    // Reset textarea height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const adjustHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      target.style.height = 'auto';
      target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
      setInput(target.value);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex gap-3 mb-3 overflow-x-auto py-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={att.previewUrl} 
                alt="preview" 
                className="h-20 w-20 object-cover rounded-lg border border-gray-600 shadow-md" 
              />
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="relative flex items-end gap-2 bg-gray-850 border border-gray-700 rounded-xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
        
        {/* Upload Button */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition-colors"
          title="Upload Image"
          disabled={isLoading}
        >
          <ImageIcon size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileSelect} 
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={adjustHeight}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... (Shift+Enter for new line)"
          className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 resize-none py-3 max-h-[150px] outline-none text-sm md:text-base scrollbar-hide"
          rows={1}
          disabled={isLoading}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!input.trim() && attachments.length === 0) || isLoading}
          className={`p-3 rounded-lg flex items-center justify-center transition-all ${
            (!input.trim() && attachments.length === 0) || isLoading
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
          }`}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
