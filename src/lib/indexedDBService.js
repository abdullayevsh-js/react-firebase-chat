/**
 * IndexedDB Service for storing chat data locally
 * Provides persistent storage for messages, chats, and user data
 */

class IndexedDBService {
  constructor() {
    this.dbName = 'TelegramChatDB';
    this.dbVersion = 1;
    this.db = null;
  }

  /**
   * Initialize IndexedDB connection
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB connection failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB connected successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores for different data types
   */
  createObjectStores(db) {
    // Messages store
    if (!db.objectStoreNames.contains('messages')) {
      const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
      messagesStore.createIndex('chatId', 'chatId', { unique: false });
      messagesStore.createIndex('createdAt', 'createdAt', { unique: false });
      messagesStore.createIndex('senderId', 'senderId', { unique: false });
    }

    // Chats store
    if (!db.objectStoreNames.contains('chats')) {
      const chatsStore = db.createObjectStore('chats', { keyPath: 'chatId' });
      chatsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      chatsStore.createIndex('type', 'type', { unique: false });
    }

    // Users store (for caching user info)
    if (!db.objectStoreNames.contains('users')) {
      const usersStore = db.createObjectStore('users', { keyPath: 'id' });
      usersStore.createIndex('username', 'username', { unique: false });
    }

    // Chat metadata store (for last sync times, etc.)
    if (!db.objectStoreNames.contains('chatMetadata')) {
      const metadataStore = db.createObjectStore('chatMetadata', { keyPath: 'chatId' });
      metadataStore.createIndex('lastSyncAt', 'lastSyncAt', { unique: false });
    }
  }

  /**
   * Store messages for a chat
   */
  async storeMessages(messages) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');

      let completed = 0;
      const total = messages.length;

      if (total === 0) {
        resolve([]);
        return;
      }

      messages.forEach(message => {
        const request = store.put({
          ...message,
          storedAt: new Date().toISOString()
        });

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve(messages);
          }
        };

        request.onerror = () => {
          console.error('Error storing message:', request.error);
          reject(request.error);
        };
      });
    });
  }

  /**
   * Get messages for a specific chat
   */
  async getMessagesForChat(chatId, limit = 50) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const index = store.index('chatId');
      
      const request = index.getAll(chatId);

      request.onsuccess = () => {
        const messages = request.result || [];
        
        // Sort by creation time and limit results
        const sortedMessages = messages
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .slice(-limit); // Get the most recent messages

        resolve(sortedMessages);
      };

      request.onerror = () => {
        console.error('Error getting messages:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Store chat information
   */
  async storeChat(chat) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['chats'], 'readwrite');
      const store = transaction.objectStore('chats');

      const request = store.put({
        ...chat,
        storedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(chat);
      };

      request.onerror = () => {
        console.error('Error storing chat:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all stored chats
   */
  async getAllChats() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['chats'], 'readonly');
      const store = transaction.objectStore('chats');
      
      const request = store.getAll();

      request.onsuccess = () => {
        const chats = request.result || [];
        
        // Sort by last update time
        const sortedChats = chats.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        resolve(sortedChats);
      };

      request.onerror = () => {
        console.error('Error getting chats:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Store user information
   */
  async storeUser(user) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');

      const request = store.put({
        ...user,
        storedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(user);
      };

      request.onerror = () => {
        console.error('Error storing user:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Error getting user:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Update chat metadata (last sync time, etc.)
   */
  async updateChatMetadata(chatId, metadata) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['chatMetadata'], 'readwrite');
      const store = transaction.objectStore('chatMetadata');

      const request = store.put({
        chatId,
        ...metadata,
        updatedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(metadata);
      };

      request.onerror = () => {
        console.error('Error updating chat metadata:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get chat metadata
   */
  async getChatMetadata(chatId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['chatMetadata'], 'readonly');
      const store = transaction.objectStore('chatMetadata');
      
      const request = store.get(chatId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Error getting chat metadata:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Add a single message (for real-time updates)
   */
  async addMessage(message) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');

      const request = store.put({
        ...message,
        storedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(message);
      };

      request.onerror = () => {
        console.error('Error adding message:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all data (for logout)
   */
  async clearAllData() {
    if (!this.db) await this.init();

    const storeNames = ['messages', 'chats', 'users', 'chatMetadata'];
    
    return Promise.all(storeNames.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error(`Error clearing ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    }));
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported() {
    return 'indexedDB' in window;
  }
}

// Create and export a singleton instance
const indexedDBService = new IndexedDBService();
export default indexedDBService;