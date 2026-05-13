import { StateCreator } from 'zustand';
import { Contact, Message, Sender } from '../useChatStore';

export interface ChatSlice {
    contact: Contact;
    messages: Message[];
    useCustomColors: boolean;
    meBubbleColor: string | null;
    themBubbleColor: string | null;
    isTyping: boolean;

    updateContact: (contact: Partial<Contact>) => void;
    addMessage: (message: Omit<Message, 'id'>) => void;
    setMessages: (messages: Message[]) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    deleteMessage: (id: string) => void;
    reorderMessages: (fromIndex: number, toIndex: number) => void;
    setUseCustomColors: (use: boolean) => void;
    setMeBubbleColor: (color: string | null) => void;
    setThemBubbleColor: (color: string | null) => void;
    setIsTyping: (isTyping: boolean) => void;
}

export const createChatSlice: StateCreator<ChatSlice> = (set) => ({
    contact: {
        name: 'Friend',
        status: 'Online',
        avatar: null,
    },
    useCustomColors: false,
    meBubbleColor: null,
    themBubbleColor: null,
    isTyping: false,
    messages: [
        {
            id: '1',
            text: 'Hey!',
            sender: 'me',
            time: '10:00',
            status: 'read',
        },
        {
            id: '2',
            text: 'Want to build an app?',
            sender: 'me',
            time: '10:01',
            status: 'read',
        },
        {
            id: '3',
            text: 'Exactly!',
            sender: 'them',
            time: '10:02',
            status: 'read',
        },
    ],

    updateContact: (updates) =>
        set((state) => ({ contact: { ...state.contact, ...updates } })),
    setMessages: (messages) => set({ messages }),
    addMessage: (msg) =>
        set((state) => ({
            messages: [
                ...state.messages,
                { ...msg, id: crypto.randomUUID() },
            ],
        })),
    updateMessage: (id, updates) =>
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === id ? { ...m, ...updates } : m
            ),
        })),
    deleteMessage: (id) =>
        set((state) => ({
            messages: state.messages.filter((m) => m.id !== id),
        })),
    reorderMessages: (fromIndex, toIndex) =>
        set((state) => {
            const newMessages = [...state.messages];
            const [movedMessage] = newMessages.splice(fromIndex, 1);
            newMessages.splice(toIndex, 0, movedMessage);
            return { messages: newMessages };
        }),
    setUseCustomColors: (use) => set({ useCustomColors: use }),
    setMeBubbleColor: (color) => set({ meBubbleColor: color }),
    setThemBubbleColor: (color) => set({ themBubbleColor: color }),
    setIsTyping: (isTyping) => set({ isTyping }),
});
