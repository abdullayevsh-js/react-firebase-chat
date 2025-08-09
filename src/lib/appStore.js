import { create } from 'zustand';
import mockDataManager from './mockData.js';

/**
 * Simple state management for current user and chat data
 * Uses Zustand for lightweight state management
 */

const useAppStore = create((set, get) => ({
  // Current user state
  currentUser: null,
  isLoggedIn: false,

  // Chat state
  selectedChatId: null,
  chatList: [],
  currentChat: null,
  currentMessages: [],

  // UI state
  isLoading: false,

  // Actions for user management
  loginUser: (email) => {
    const currentUser = mockDataManager.getCurrentUser();
    // Simple email-only login - just set the user as logged in
    set({
      currentUser: { ...currentUser, email },
      isLoggedIn: true,
      chatList: mockDataManager.getChatListWithUserInfo()
    });
  },

  logoutUser: () => {
    set({
      currentUser: null,
      isLoggedIn: false,
      selectedChatId: null,
      chatList: [],
      currentChat: null,
      currentMessages: []
    });
  },

  // Actions for chat management
  selectChat: (chatId) => {
    const chat = mockDataManager.getChatById(chatId);
    const messages = mockDataManager.getMessagesForChat(chatId);
    
    set({
      selectedChatId: chatId,
      currentChat: chat,
      currentMessages: messages
    });
  },

  // Helper to get chat list
  refreshChatList: () => {
    const chatList = mockDataManager.getChatListWithUserInfo();
    set({ chatList });
  },

  // Initialize app data
  initializeApp: () => {
    set({ isLoading: true });
    
    // Simulate loading delay
    setTimeout(() => {
      set({
        isLoading: false,
        chatList: mockDataManager.getChatListWithUserInfo()
      });
    }, 500);
  }
}));

export default useAppStore;