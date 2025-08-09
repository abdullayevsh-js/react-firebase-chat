import tmpData from '../tmp.json' with { type: 'json' };

/**
 * Mock data utility for loading and managing tmp.json data
 * Provides functions to access user data, chats, and messages
 */

class MockDataManager {
  constructor() {
    this.data = tmpData;
  }

  /**
   * Get the current user data
   * @returns {Object} Current user object
   */
  getCurrentUser() {
    return this.data.user_me;
  }

  /**
   * Get all other users
   * @returns {Array} Array of other users
   */
  getOtherUsers() {
    return this.data.other_users;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID to find
   * @returns {Object|null} User object or null if not found
   */
  getUserById(userId) {
    if (userId === this.data.user_me.id) {
      return this.data.user_me;
    }
    return this.data.other_users.find(user => user.id === userId) || null;
  }

  /**
   * Get all chats
   * @returns {Array} Array of chat objects
   */
  getChats() {
    return this.data.chats;
  }

  /**
   * Get chat by ID
   * @param {string} chatId - Chat ID to find
   * @returns {Object|null} Chat object or null if not found
   */
  getChatById(chatId) {
    return this.data.chats.find(chat => chat.id === chatId) || null;
  }

  /**
   * Get messages for a specific chat
   * @param {string} chatId - Chat ID
   * @returns {Array} Array of messages for the chat
   */
  getMessagesForChat(chatId) {
    const chat = this.getChatById(chatId);
    return chat ? chat.messages : [];
  }

  /**
   * Get user chats (chat list with metadata)
   * @returns {Array} Array of user chat objects
   */
  getUserChats() {
    return this.data.userchats;
  }

  /**
   * Get chat list with user information for display
   * @returns {Array} Array of chat items with user info
   */
  getChatListWithUserInfo() {
    return this.data.userchats.map(userChat => {
      const chat = this.getChatById(userChat.chatId);
      const otherUser = this.getUserById(userChat.receiverId);
      
      return {
        ...userChat,
        chat,
        user: otherUser,
        lastMessageTime: new Date(userChat.updatedAt)
      };
    });
  }

  /**
   * Get the latest message for a chat
   * @param {string} chatId - Chat ID
   * @returns {Object|null} Latest message or null
   */
  getLatestMessage(chatId) {
    const messages = this.getMessagesForChat(chatId);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }
}

// Create and export a singleton instance
const mockDataManager = new MockDataManager();
export default mockDataManager;