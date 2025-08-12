class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    this.sessionTokenKey = import.meta.env.VITE_KEY_SESSION_TOKEN || 'session_token';
    this.token = localStorage.getItem(this.sessionTokenKey);
  }

  // Helper method to get headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Authentication methods
  async login(identifier, password) {
    const response = await fetch(`${this.baseURL}/api/v1/pub/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ identifier, password }),
    });

    const data = await this.handleResponse(response);
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem(this.sessionTokenKey, data.token);
    }
    
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/api/v1/user-me/get`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Chat management methods
  async getDMChats(limit = 100, offset = 0) {
    const response = await fetch(`${this.baseURL}/api/v1/chats/get-dm-chats?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getGroups() {
    const response = await fetch(`${this.baseURL}/api/v1/chats/get-groups`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getChannels() {
    const response = await fetch(`${this.baseURL}/api/v1/chats/get-channels`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getChatByEid(eid) {
    const response = await fetch(`${this.baseURL}/api/v1/chats/get-by-eid/${eid}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Get messages for a specific chat
  async getMessagesForChat(chatId, limit = 100, offset = 0) {
    const response = await fetch(`${this.baseURL}/api/v1/msgs/get-messages?chat_id=${chatId}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Messaging methods
  async sendMessage(chatId, text) {
    const response = await fetch(`${this.baseURL}/api/v1/msgs/send-message`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    return this.handleResponse(response);
  }

  // Utility methods
  setToken(token) {
    this.token = token;
    localStorage.setItem(this.sessionTokenKey, token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem(this.sessionTokenKey);
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;