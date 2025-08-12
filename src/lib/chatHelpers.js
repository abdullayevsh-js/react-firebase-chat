/**
 * Helper functions for chat selection and user management
 * Provides utility functions for common chat operations
 */

/**
 * Format timestamp for display
 * @param {string|number} timestamp - Timestamp to format
 * @returns {string} Formatted time string
 */
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('en-US', { 
      weekday: 'short' 
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

/**
 * Get display name for a user
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  return user.username || user.email || 'Anonymous';
};

/**
 * Get user avatar with fallback
 * @param {Object} user - User object
 * @returns {string} Avatar URL or default
 */
export const getUserAvatar = (user) => {
  if (!user || !user.avatar) {
    return '/avatar.png'; // Default avatar
  }
  return user.avatar;
};

/**
 * Check if a message is from the current user
 * @param {Object} message - Message object
 * @param {string} currentUserId - Current user ID
 * @returns {boolean} True if message is from current user
 */
export const isMessageFromCurrentUser = (message, currentUserId) => {
  return message.senderId === currentUserId;
};

/**
 * Get the other user in a chat (not the current user)
 * This function now expects the chat data to be passed in to avoid circular dependencies
 * @param {Object} currentChat - Current chat object
 * @param {string} currentUserId - Current user ID
 * @returns {Object|null} Other user object
 */
export const getOtherUserInChat = (currentChat, currentUserId) => {
  if (!currentChat) return null;
  
  // For DM chats, return the other user
  if (currentChat.type === 'dm') {
    // If the chat user is not the current user, return the chat user
    if (currentChat.user?.id !== currentUserId) {
      return currentChat.user;
    }
    // Otherwise, try to find the receiver info
    if (currentChat.receiverId && currentChat.receiverId !== currentUserId) {
      return {
        id: currentChat.receiverId,
        username: currentChat.user?.username || 'Unknown',
        avatar: currentChat.user?.avatar || '/avatar.png'
      };
    }
  }
  
  // For groups and channels, return the chat info as user
  return currentChat.user || {
    id: currentChat.id,
    username: currentChat.user?.username || 'Unknown',
    avatar: currentChat.user?.avatar || '/avatar.png'
  };
};

/**
 * Get unread message count for a chat
 * This function now expects the chat data to be passed in to avoid circular dependencies
 * @param {Object} chat - Chat object
 * @returns {number} Number of unread messages
 */
export const getUnreadCount = (chat) => {
  if (!chat || chat.isSeen) return 0;
  
  // Return 1 if not seen (can be enhanced later with actual unread count)
  return 1;
};

/**
 * Search chats by user name or last message
 * @param {Array} chatList - List of chats
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered chat list
 */
export const searchChats = (chatList, searchTerm) => {
  if (!searchTerm.trim()) return chatList;
  
  const term = searchTerm.toLowerCase();
  
  return chatList.filter(chatItem => {
    const userName = getUserDisplayName(chatItem.user).toLowerCase();
    const lastMessage = chatItem.lastMessage?.toLowerCase() || '';
    
    return userName.includes(term) || lastMessage.includes(term);
  });
};

/**
 * Sort chats by last message time (most recent first)
 * @param {Array} chatList - List of chats
 * @returns {Array} Sorted chat list
 */
export const sortChatsByTime = (chatList) => {
  return [...chatList].sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
};

/**
 * Validate email format (simple validation for mock login)
 * @param {string} email - Email to validate
 * @returns {boolean} True if email format is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get chat preview text
 * @param {Object} chatItem - Chat item with messages
 * @returns {string} Preview text
 */
export const getChatPreview = (chatItem) => {
  if (!chatItem.lastMessage) return 'No messages yet';
  
  const maxLength = 50;
  const message = chatItem.lastMessage;
  
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};