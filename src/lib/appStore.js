import { create } from 'zustand';
import mockDataManager from './mockData.js'; // TODO: Remove after task 4 (WebSocket) and task 5 (message sending) are complete
import apiService from './apiService.js';
import WebSocketManager from './websocketManager.js';
import indexedDBService from './indexedDBService.js';

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
  error: null,
  isSendingMessage: false,

  // WebSocket connection state
  connectionStatus: 'disconnected', // 'connecting', 'connected', 'disconnected'
  websocketManager: null,

  // Actions for user management
  loginUser: async (identifier, password) => {
    try {
      set({ isLoading: true, error: null });

      // Authenticate with real API
      const loginResponse = await apiService.login(identifier, password);

      // Get current user data
      const currentUser = await apiService.getCurrentUser();

      set({
        currentUser,
        isLoggedIn: true,
        isLoading: false,
        error: null
      });

      // Load real chat data
      await get().loadChats();

      // Connect WebSocket for real-time updates
      get().connectWebSocket(apiService.token);

      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Login failed',
        currentUser: null,
        isLoggedIn: false
      });

      return { success: false, error: error.message || 'Login failed' };
    }
  },

  // Get current user action
  getCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });

      const currentUser = await apiService.getCurrentUser();

      set({
        currentUser,
        isLoggedIn: true,
        isLoading: false,
        error: null
      });

      return { success: true, user: currentUser };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to get user data',
        currentUser: null,
        isLoggedIn: false
      });

      // Clear invalid token
      apiService.clearToken();

      return { success: false, error: error.message || 'Failed to get user data' };
    }
  },

  logoutUser: async () => {
    // Disconnect WebSocket
    get().disconnectWebSocket();

    // Clear stored token
    apiService.clearToken();

    // Clear IndexedDB data
    try {
      await indexedDBService.clearAllData();
      console.log('IndexedDB data cleared on logout');
    } catch (dbError) {
      console.error('Error clearing IndexedDB data:', dbError);
    }

    set({
      currentUser: null,
      isLoggedIn: false,
      selectedChatId: null,
      chatList: [],
      currentChat: null,
      currentMessages: [],
      error: null,
      connectionStatus: 'disconnected'
    });
  },

  // Load chats from real API endpoints
  loadChats: async () => {
    try {
      set({ isLoading: true, error: null });

      // Fetch all chat types in parallel
      const [dmChatsResponse, groupsResponse, channelsResponse] = await Promise.all([
        apiService.getDMChats(),
        apiService.getGroups(),
        apiService.getChannels()
      ]);

      // Debug: Log the raw API responses
      console.log('API Responses:', {
        dmChats: dmChatsResponse,
        groups: groupsResponse,
        channels: channelsResponse
      });

      // Transform API responses to match existing component structure
      const transformedChats = [];

      // Transform DM chats
      if (dmChatsResponse && dmChatsResponse.length > 0) {
        dmChatsResponse.forEach(dmChat => {
          // Extract user information from various possible fields
          const userId = dmChat.receiver_id || dmChat.user_id || dmChat.id;
          const username = dmChat.receiver_username || dmChat.username || dmChat.name || dmChat.title || `User ${userId}`;
          const avatar = dmChat.receiver_avatar || dmChat.avatar || dmChat.photo || '/avatar.png';
          const email = dmChat.receiver_email || dmChat.email || '';

          transformedChats.push({
            id: dmChat.id,
            chatId: dmChat.id,
            eid: dmChat.eid || dmChat.id, // Store the EID for API calls
            type: 'dm',
            isSeen: dmChat.is_seen || false,
            lastMessage: dmChat.last_message || dmChat.last_message_text || 'No messages yet',
            receiverId: userId,
            updatedAt: dmChat.updated_at ? new Date(dmChat.updated_at).getTime() : Date.now(),
            user: {
              id: userId,
              username: username,
              avatar: avatar,
              email: email
            },
            chat: {
              id: dmChat.id,
              createdAt: dmChat.created_at,
              messages: [] // Messages will be loaded separately when chat is selected
            },
            lastMessageTime: dmChat.updated_at ? new Date(dmChat.updated_at) : new Date()
          });
        });
      }

      // Transform Groups
      if (groupsResponse && groupsResponse.length > 0) {
        groupsResponse.forEach(group => {
          const groupName = group.name || group.title || group.username || `Group ${group.id}`;
          const groupAvatar = group.avatar || group.photo || '/avatar.png';

          transformedChats.push({
            id: group.id,
            chatId: group.id,
            eid: group.eid || group.id, // Store the EID for API calls
            type: 'group',
            isSeen: group.is_seen || false,
            lastMessage: group.last_message || group.last_message_text || 'No messages yet',
            updatedAt: group.updated_at ? new Date(group.updated_at).getTime() : Date.now(),
            user: {
              id: group.id,
              username: groupName,
              avatar: groupAvatar,
              email: ''
            },
            chat: {
              id: group.id,
              createdAt: group.created_at,
              messages: []
            },
            lastMessageTime: group.updated_at ? new Date(group.updated_at) : new Date()
          });
        });
      }

      // Transform Channels
      if (channelsResponse && channelsResponse.length > 0) {
        channelsResponse.forEach(channel => {
          const channelName = channel.name || channel.title || channel.username || `Channel ${channel.id}`;
          const channelAvatar = channel.avatar || channel.photo || '/avatar.png';

          transformedChats.push({
            id: channel.id,
            chatId: channel.id,
            eid: channel.eid || channel.id, // Store the EID for API calls
            type: 'channel',
            isSeen: channel.is_seen || false,
            lastMessage: channel.last_message || channel.last_message_text || 'No messages yet',
            updatedAt: channel.updated_at ? new Date(channel.updated_at).getTime() : Date.now(),
            user: {
              id: channel.id,
              username: channelName,
              avatar: channelAvatar,
              email: ''
            },
            chat: {
              id: channel.id,
              createdAt: channel.created_at,
              messages: []
            },
            lastMessageTime: channel.updated_at ? new Date(channel.updated_at) : new Date()
          });
        });
      }

      // Sort chats by last update time (most recent first)
      transformedChats.sort((a, b) => b.updatedAt - a.updatedAt);

      set({
        chatList: transformedChats,
        isLoading: false,
        error: null
      });

      return { success: true, chats: transformedChats };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load chats'
      });

      return { success: false, error: error.message || 'Failed to load chats' };
    }
  },

  // Actions for chat management
  selectChat: async (chatId) => {
    try {
      set({ isLoading: true, error: null });

      // Find the chat in our current chat list to get the EID
      const state = get();
      const selectedChatItem = state.chatList.find(chat => chat.chatId === chatId);

      console.log('Selecting chat:', { chatId, selectedChatItem });

      if (!selectedChatItem) {
        throw new Error('Chat not found in chat list');
      }

      // First, try to load messages from IndexedDB for instant display
      let cachedMessages = [];
      try {
        cachedMessages = await indexedDBService.getMessagesForChat(chatId);
        console.log('=== CACHED MESSAGES DEBUG ===');
        console.log('Cached messages from IndexedDB:', cachedMessages.length);
        console.log('First few cached messages:', cachedMessages.slice(0, 3));

        if (cachedMessages.length > 0) {
          // Show cached messages immediately
          console.log('Showing cached messages immediately');
          set({
            selectedChatId: chatId,
            currentChat: {
              id: chatId,
              chatId: chatId,
              type: selectedChatItem.type,
              user: selectedChatItem.user
            },
            currentMessages: cachedMessages,
            isLoading: true, // Keep loading while fetching fresh data
            error: null
          });
        }
      } catch (dbError) {
        console.error('Error loading cached messages:', dbError);
      }

      // Then fetch fresh data from API
      try {
        const eid = selectedChatItem.eid || chatId;
        console.log('=== SELECTING CHAT DEBUG ===');
        console.log('Selected chat item:', selectedChatItem);
        console.log('Using chatId:', chatId);
        console.log('Using EID for API call:', eid);

        const chatDetails = await apiService.getChatByEid(eid);
        console.log('=== API RESPONSE DEBUG ===');
        console.log('Chat details from API:', chatDetails);
        console.log('Chat details type:', typeof chatDetails);
        console.log('Chat details keys:', Object.keys(chatDetails || {}));
        console.log('Messages in response:', chatDetails?.messages);
        console.log('Messages array length:', chatDetails?.messages?.length || 0);
        console.log('Messages array type:', typeof chatDetails?.messages);

        // Transform the API response to match component expectations
        const transformedChat = {
          id: chatDetails.id || chatId,
          chatId: chatId,
          type: selectedChatItem.type,
          user: selectedChatItem.user,
          createdAt: chatDetails.created_at,
          updatedAt: chatDetails.updated_at
        };

        // Transform messages from API response
        let transformedMessages = (chatDetails.messages || []).map(msg => ({
          id: msg.id,
          chatId: chatId,
          senderId: msg.sender_id,
          text: msg.text,
          createdAt: msg.created_at,
          updatedAt: msg.updated_at,
          messageType: msg.message_type || 'text',
          sender: msg.sender || {
            id: msg.sender_id,
            username: msg.sender_username || 'Unknown',
            avatar: msg.sender_avatar || '/avatar.png'
          }
        }));

        // If no messages in chat details, try to fetch messages separately
        if (transformedMessages.length === 0) {
          try {
            console.log('No messages in chat details, fetching messages separately...');
            console.log('Using chatId for messages API:', chatId);
            console.log('Using eid for messages API:', eid);
            
            // Try with both chatId and eid to see which works
            let messagesResponse;
            try {
              messagesResponse = await apiService.getMessagesForChat(chatId);
              console.log('Messages from separate API call (using chatId):', messagesResponse);
            } catch (chatIdError) {
              console.log('Failed with chatId, trying with eid:', chatIdError.message);
              try {
                messagesResponse = await apiService.getMessagesForChat(eid);
                console.log('Messages from separate API call (using eid):', messagesResponse);
              } catch (eidError) {
                console.error('Both chatId and eid failed for messages API:', eidError.message);
                messagesResponse = null;
              }
            }

            console.log('=== MESSAGES API RESPONSE DEBUG ===');
            console.log('Messages response type:', typeof messagesResponse);
            console.log('Messages response length:', messagesResponse?.length);
            console.log('First few messages:', messagesResponse?.slice(0, 3));

            if (messagesResponse && messagesResponse.length > 0) {
              transformedMessages = messagesResponse.map(msg => {
                console.log('Transforming message:', msg);
                return {
                  id: msg.id,
                  chatId: chatId,
                  senderId: msg.sender_id,
                  text: msg.text,
                  createdAt: msg.created_at,
                  updatedAt: msg.updated_at,
                  messageType: msg.message_type || 'text',
                  sender: msg.sender || {
                    id: msg.sender_id,
                    username: msg.sender_username || 'Unknown',
                    avatar: msg.sender_avatar || '/avatar.png'
                  }
                };
              });
              console.log('Transformed messages:', transformedMessages);
            }
          } catch (messageError) {
            console.error('Error fetching messages separately:', messageError);
          }
        }

        console.log('=== FINAL MESSAGE PROCESSING ===');
        console.log('Transformed messages from API:', transformedMessages.length);
        console.log('Cached messages available:', cachedMessages.length);

        // If API didn't return messages but we have cached messages, use cached messages
        if (transformedMessages.length === 0 && cachedMessages.length > 0) {
          console.log('API returned no messages, using cached messages');
          transformedMessages = cachedMessages;
        }

        // Store fresh messages in IndexedDB only if we got new messages from API
        if (transformedMessages.length > 0 && transformedMessages !== cachedMessages) {
          try {
            await indexedDBService.storeMessages(transformedMessages);
            await indexedDBService.storeChat(selectedChatItem);
            console.log('Fresh messages stored in IndexedDB');
          } catch (dbError) {
            console.error('Error storing messages in IndexedDB:', dbError);
          }
        }

        // If still no messages but we have a last message in chat list, create a placeholder
        if (transformedMessages.length === 0 && selectedChatItem.lastMessage && selectedChatItem.lastMessage !== 'No messages yet') {
          console.log('Creating placeholder message from chat list data');
          transformedMessages.push({
            id: `placeholder-${Date.now()}`,
            chatId: chatId,
            senderId: selectedChatItem.receiverId || selectedChatItem.user?.id || 'unknown',
            text: selectedChatItem.lastMessage,
            createdAt: selectedChatItem.lastMessageTime?.toISOString() || new Date().toISOString(),
            updatedAt: selectedChatItem.lastMessageTime?.toISOString() || new Date().toISOString(),
            messageType: 'text',
            sender: {
              id: selectedChatItem.receiverId || selectedChatItem.user?.id || 'unknown',
              username: selectedChatItem.user?.username || 'Unknown',
              avatar: selectedChatItem.user?.avatar || '/avatar.png'
            }
          });
        }

        // Sort messages by creation time (oldest first)
        transformedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        console.log('=== SETTING FINAL MESSAGES ===');
        console.log('Final message count:', transformedMessages.length);
        console.log('Message IDs:', transformedMessages.map(m => m.id));
        console.log('Message texts preview:', transformedMessages.map(m => m.text?.substring(0, 30)));

        set({
          selectedChatId: chatId,
          currentChat: transformedChat,
          currentMessages: transformedMessages,
          isLoading: false,
          error: null
        });

      } catch (apiError) {
        console.error('API error, using cached data if available:', apiError);

        // If API fails but we have cached messages, use them
        if (cachedMessages.length > 0) {
          set({
            selectedChatId: chatId,
            currentChat: {
              id: chatId,
              chatId: chatId,
              type: selectedChatItem.type,
              user: selectedChatItem.user
            },
            currentMessages: cachedMessages,
            isLoading: false,
            error: 'Using cached messages (offline)'
          });
        } else {
          throw apiError; // Re-throw if no cached data available
        }
      }

    } catch (error) {
      console.error('Error selecting chat:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to load chat'
      });
    }
  },

  // Helper to get chat list (deprecated - will be removed after full migration)
  refreshChatList: () => {
    const chatList = mockDataManager.getChatListWithUserInfo();
    set({ chatList });
  },

  // WebSocket connection management actions
  initializeWebSocket: () => {
    const state = get();
    if (!state.websocketManager) {
      const wsManager = new WebSocketManager({ getState: get });
      set({ websocketManager: wsManager });
    }
  },

  connectWebSocket: (token) => {
    const state = get();
    if (state.websocketManager && token) {
      state.websocketManager.connect(token);
    }
  },

  disconnectWebSocket: () => {
    const state = get();
    if (state.websocketManager) {
      state.websocketManager.disconnect();
    }
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // Handle real-time message updates from WebSocket
  addMessageToChat: async (message) => {
    const state = get();

    // Store message in IndexedDB
    try {
      await indexedDBService.addMessage(message);
      console.log('Real-time message stored in IndexedDB');
    } catch (dbError) {
      console.error('Error storing real-time message in IndexedDB:', dbError);
    }

    // Update current messages if this message belongs to the selected chat
    if (state.selectedChatId === message.chatId) {
      // Check if message already exists to prevent duplicates
      const messageExists = state.currentMessages.some(existingMsg => existingMsg.id === message.id);
      if (!messageExists) {
        const updatedMessages = [...state.currentMessages, message];
        console.log('Adding new real-time message. Total messages now:', updatedMessages.length);
        set({ currentMessages: updatedMessages });
      } else {
        console.log('Message already exists, skipping duplicate:', message.id);
      }
    }

    // Update chat list with new last message
    const updatedChatList = state.chatList.map(chat => {
      if (chat.chatId === message.chatId) {
        return {
          ...chat,
          lastMessage: message.text,
          updatedAt: new Date(message.createdAt).getTime(),
          lastMessageTime: new Date(message.createdAt),
          isSeen: state.selectedChatId === message.chatId // Mark as seen if currently viewing
        };
      }
      return chat;
    });

    // Sort chats by last update time (most recent first)
    updatedChatList.sort((a, b) => b.updatedAt - a.updatedAt);

    set({ chatList: updatedChatList });
  },

  // Handle chat membership updates from WebSocket
  updateChatMembership: (chatId, userId, data) => {
    // This can be extended based on specific requirements for join_chat events
    console.log('Chat membership updated:', { chatId, userId, data });

    // For now, we'll just log the event
    // Future implementations might update chat member lists, etc.
  },

  // Send message action with proper error handling
  sendMessage: async (text) => {
    const state = get();

    // Check if a chat is selected (Requirement 5.4, 5.5)
    if (!state.selectedChatId) {
      set({ error: 'No chat selected. Please select a chat to send messages.' });
      return { success: false, error: 'No chat selected' };
    }

    // Check if user is authenticated
    if (!state.isLoggedIn || !apiService.isAuthenticated()) {
      set({ error: 'You must be logged in to send messages.' });
      return { success: false, error: 'Not authenticated' };
    }

    try {
      set({ isSendingMessage: true, error: null });

      // Send message via API (Requirement 5.1)
      const response = await apiService.sendMessage(state.selectedChatId, text);

      // Create message object for immediate UI update (match expected structure)
      const newMessage = {
        id: response.id || `temp-${Date.now()}`, // Use API response ID or fallback
        chatId: state.selectedChatId,
        senderId: state.currentUser?.id,
        text: text,
        createdAt: response.created_at || new Date().toISOString(),
        updatedAt: response.updated_at || new Date().toISOString(),
        messageType: 'text',
        sender: {
          id: state.currentUser?.id,
          username: state.currentUser?.username || 'You',
          avatar: state.currentUser?.avatar || '/avatar.png'
        }
      };

      // Add message to current chat messages immediately (Requirement 5.2)
      const updatedMessages = [...state.currentMessages, newMessage];

      // Store message in IndexedDB
      try {
        await indexedDBService.addMessage(newMessage);
        console.log('Sent message stored in IndexedDB');
      } catch (dbError) {
        console.error('Error storing sent message in IndexedDB:', dbError);
      }

      // Update chat list with new last message
      const updatedChatList = state.chatList.map(chat => {
        if (chat.chatId === state.selectedChatId) {
          return {
            ...chat,
            lastMessage: text,
            updatedAt: new Date().getTime(),
            lastMessageTime: new Date(),
            isSeen: true // Mark as seen since user just sent it
          };
        }
        return chat;
      });

      // Sort chats by last update time (most recent first)
      updatedChatList.sort((a, b) => b.updatedAt - a.updatedAt);

      set({
        currentMessages: updatedMessages,
        chatList: updatedChatList,
        isSendingMessage: false,
        error: null
      });

      return { success: true, message: newMessage };
    } catch (error) {
      // Handle message sending failure (Requirement 5.3)
      const errorMessage = error.message || 'Failed to send message. Please try again.';

      set({
        isSendingMessage: false,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  // Initialize app data
  initializeApp: async () => {
    set({ isLoading: true });

    // Initialize IndexedDB
    try {
      await indexedDBService.init();
      console.log('IndexedDB initialized');
    } catch (dbError) {
      console.error('IndexedDB initialization failed:', dbError);
    }

    // Initialize WebSocket manager
    get().initializeWebSocket();

    // Check if user has stored token and auto-login
    if (apiService.isAuthenticated()) {
      const result = await get().getCurrentUser();
      if (result.success) {
        // Load real chat data for authenticated user
        await get().loadChats();

        // Connect WebSocket for real-time updates
        get().connectWebSocket(apiService.token);

        set({ isLoading: false });
        return;
      }
    }

    // No valid token, just load basic app state
    set({
      isLoading: false,
      chatList: [] // No chats for unauthenticated users
    });
  }
}));

export default useAppStore;