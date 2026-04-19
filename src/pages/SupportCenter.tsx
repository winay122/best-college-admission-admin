import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, Phone, CheckCircle, Clock, Search, MessageSquare, GraduationCap, Bell, X as CloseIcon } from 'lucide-react';
import { getLeadHistory, getAllLeadsWithChats } from '../services/chat.service';
import type { ChatMessage, LeadWithChat } from '../services/chat.service';
import { AnimatePresence, motion } from 'framer-motion';
import { formatTime, formatDateDivider, groupMessagesByDate } from '../utils/chat-utils';

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

export default function SupportCenter() {
    const [inbox, setInbox] = useState<LeadWithChat[]>([]);
    const [selectedLead, setSelectedLead] = useState<LeadWithChat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ name: string, message: string } | null>(null);
    const [seenMap, setSeenMap] = useState<Record<string, string>>({}); // phone -> lastSeenMsgId

    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const originalTitle = useRef(document.title);

    // 1. Stable Socket Connection
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('👑 Admin Socket Connected');
            socket.emit('admin:join');
        });

        socket.on('message:new', (msg: ChatMessage) => {
            // Update messages list if it's the current lead
            setSelectedLead(current => {
                if (current && msg.leadPhone === current.phone) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    // Mark as seen if we're looking at it
                    setSeenMap(prev => ({ ...prev, [msg.leadPhone]: msg.id }));
                } else if (msg.sender === 'LEAD') {
                    updateTitleNotification();
                }
                return current;
            });

            // Update inbox preview and RE-SORT
            setInbox(prev => {
                const updated = prev.map(l =>
                    l.phone === msg.leadPhone ? { ...l, lastMessage: msg } : l
                );
                return sortInbox(updated);
            });
        });

        socket.on('admin:new-notification', (data: { phone: string; message: ChatMessage }) => {
            if (data.message.sender === 'LEAD') {
                setToast({ name: data.phone, message: data.message.content });
                setTimeout(() => setToast(null), 5000);
                updateTitleNotification();
            }

            setInbox(prev => {
                const updated = prev.map(l =>
                    l.phone === data.phone ? { ...l, lastMessage: data.message } : l
                );
                return sortInbox(updated);
            });
        });

        loadInbox();

        return () => {
            socket.disconnect();
            document.title = originalTitle.current;
        };
    }, []);

    // 2. Room Joining logic when lead changes
    useEffect(() => {
        if (selectedLead && socketRef.current) {
            loadHistory(selectedLead.phone);
            socketRef.current.emit('admin:join', selectedLead.phone);
            document.title = originalTitle.current; // Clear notification
            // Mark last message seen
            if (selectedLead.lastMessage) {
                setSeenMap(prev => ({ ...prev, [selectedLead.phone]: selectedLead.lastMessage!.id }));
            }
        }
    }, [selectedLead]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sortInbox = (list: LeadWithChat[]) => {
        return [...list].sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return dateB - dateA; // Newest first
        });
    };

    const updateTitleNotification = () => {
        document.title = `🔔 New Message! | Admin Panel`;
    };

    const loadInbox = async () => {
        try {
            const data = await getAllLeadsWithChats();
            setInbox(sortInbox(data));
        } catch (err) {
            console.error('Failed to load inbox:', err);
        }
    };

    const loadHistory = async (phone: string) => {
        try {
            const history = await getLeadHistory(phone);
            setMessages(history);
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedLead) return;

        socketRef.current?.emit('admin:message', {
            phone: selectedLead.phone,
            content: inputValue.trim()
        });
        setInputValue('');
    };

    const filteredInbox = inbox.filter(l =>
        l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans relative">

            {/* ─── TOAST NOTIFICATION ──────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="absolute top-4 left-1/2 z-[150] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]"
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

            {/* ─── LEFT PANEL: INBOX ──────────────────────────────── */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Support Inbox
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredInbox.map(lead => {
                        const isActive = selectedLead?.phone === lead.phone;
                        const hasUnseen = lead.lastMessage &&
                            lead.lastMessage.sender === 'LEAD' &&
                            seenMap[lead.phone] !== lead.lastMessage.id;

                        return (
                            <button
                                key={lead.phone}
                                onClick={() => setSelectedLead(lead)}
                                className={`w-full p-4 flex items-start gap-3 transition-all border-b border-gray-50/50 hover:bg-white ${isActive ? 'bg-white shadow-sm shadow-blue-100 ring-1 ring-blue-500/10' : ''} ${hasUnseen ? 'bg-blue-50/40' : ''}`}
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    {hasUnseen && !isActive && (
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-xs truncate ${hasUnseen ? 'font-black text-blue-700' : 'font-bold text-gray-900'}`}>{lead.studentName}</h3>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                                            {lead.lastMessage ? formatDateDivider(new Date(lead.lastMessage.createdAt)) === 'Today' ? formatTime(lead.lastMessage.createdAt) : 'Recent' : 'New'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 truncate mt-0.5">{lead.phone}</p>
                                    {lead.lastMessage && (
                                        <p className={`text-[10px] truncate mt-1 italic ${hasUnseen ? 'font-black text-blue-600' : 'font-medium text-gray-400'}`}>
                                            {lead.lastMessage.sender === 'ADMIN' ? 'You: ' : ''}{lead.lastMessage.content}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── CENTER PANEL: CHAT ─────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {selectedLead ? (
                    <>
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-gray-900 leading-none">{selectedLead.studentName}</h2>
                                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-1">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                        Active Session
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                            {messageGroups.map((group, groupIdx) => (
                                <React.Fragment key={groupIdx}>
                                    <div className="flex justify-center my-6">
                                        <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                                            {group.date}
                                        </span>
                                    </div>
                                    {group.messages.map((msg, i) => (
                                        <div key={msg.id || i} className={`flex flex-col ${msg.sender === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm ${msg.sender === 'ADMIN'
                                                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200 shadow-lg'
                                                : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 mt-1.5 px-1">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Reply to student..."
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                            />
                            <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95 transition-all">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
                        <MessageSquare className="w-20 h-20 text-gray-400 mb-6" />
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Select a Lead</h2>
                        <p className="text-sm font-bold text-gray-500 mt-2">Pick a student from the inbox to start providing instant support</p>
                    </div>
                )}
            </div>

            {/* ─── RIGHT PANEL: DETAILS ──────────────────────────── */}
            {selectedLead && (
                <div className="w-72 border-l border-gray-100 p-6 bg-gray-50/30 overflow-y-auto">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Student Context
                    </h3>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1.5 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-[9px] font-black uppercase text-gray-400">Student Name</span>
                            <span className="text-xs font-black text-gray-900">{selectedLead.studentName}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-[9px] font-black uppercase text-gray-400">Contact Number</span>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-gray-900">{selectedLead.phone}</span>
                                <Phone className="w-3 h-3 text-blue-600" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-[9px] font-black uppercase text-gray-400 mb-3">Verification Badge</h4>
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black">
                                <CheckCircle className="w-3 h-3" />
                                IDENTIFIED LEAD
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
