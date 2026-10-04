import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X as CloseIcon } from 'lucide-react';
import type { ChatMessage } from '../services/chat.service';

const getSocketUrl = () => {
    const rawUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    try {
        const url = new URL(rawUrl);
        return url.origin;
    } catch {
        return 'http://localhost:5000';
    }
};

const SOCKET_URL = getSocketUrl();

interface ToastNotification {
    id: string;
    name: string;
    message: string;
}

interface ChatContextType {
    socket: Socket | null;
    unseenCount: number;
    clearUnseenCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [unseenCount, setUnseenCount] = useState(0);
    const [toast, setToast] = useState<ToastNotification | null>(null);
    const originalTitle = useRef(document.title);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket']
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('👑 Admin Global Socket Connected');
            newSocket.emit('admin:join');
        });

        newSocket.on('admin:new-notification', (data: { phone: string; message: ChatMessage, lead?: any }) => {
            if (data.message.sender === 'LEAD') {
                // Show global toast
                const toastId = Date.now().toString();
                setToast({ 
                    id: toastId, 
                    name: data.lead?.studentName || data.phone, 
                    message: data.message.content 
                });
                setTimeout(() => {
                    setToast(prev => prev?.id === toastId ? null : prev);
                }, 5000);

                // Update tab title
                document.title = `🔔 New Message! | Admin Panel`;

                // Increment unseen count
                // Only increment if we are not currently viewing this user's chat.
                // Since this context is global, we might need the SupportCenter to tell us what it's viewing.
                // For now, we increment always, and SupportCenter will reset it when viewing.
                setUnseenCount(prev => prev + 1);
            }
        });

        return () => {
            newSocket.disconnect();
            document.title = originalTitle.current;
        };
    }, []);

    const clearUnseenCount = () => {
        setUnseenCount(0);
        document.title = originalTitle.current;
    };

    return (
        <ChatContext.Provider value={{ socket, unseenCount, clearUnseenCount }}>
            {children}
            
            {/* Global Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed top-4 left-1/2 z-[9999] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Bell className="w-5 h-5 animate-bounce" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-black uppercase tracking-widest">{toast.name}</h4>
                            <p className="text-[11px] font-bold opacity-90 truncate max-w-[200px]">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-full">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
