/**
 * WebSocket Manager for real-time messaging
 * Handles WebSocket connection, authentication, and message events
 */

class WebSocketManager {
  constructor(store) {
    this.store = store;
    this.wsURL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080';
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.isConnecting = false;
    this.shouldReconnect = true;
    this.token = null;
  }

  /**
   * Establish WebSocket connection with authentication
   * @param {string} token - Bearer token for authentication
   */
  connect(token) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.token = token;
    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      // Update connection status to connecting
      this.store.getState().setConnectionStatus('connecting');

      // Construct WebSocket URL with token
      const wsUrl = `${this.wsURL}/api/v1/ws?token=${encodeURIComponent(token)}`;

      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl);

      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.store.getState().setConnectionStatus('disconnected');
      this.store.getState().setError({
        type: 'websocket',
        message: 'Failed to establish WebSocket connection',
        code: 'WS_CONNECTION_ERROR',
        retryable: true
      });
    }
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen() {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    // Update connection status
    this.store.getState().setConnectionStatus('connected');
    this.store.getState().clearError();
  }

  /**
   * Send authentication message to WebSocket server
   */
  authenticate() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.token) {
      const authMessage = {
        type: 'auth',
        authorization: `Bearer ${this.token}`
      };
      this.ws.send(JSON.stringify(authMessage));
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event - WebSocket message event
   */
  handleMessage(event) {

    try {
      const dataList = JSON.parse(event.data);

      dataList.forEach(data => {
        
        switch (data.type) {
          case 'message':
            this.handleNewMessage(data);
            break;
          case 'join_chat':
            this.handleJoinChat(data);
            break;
          case 'error':
            console.error('WebSocket error:', data.message);
            this.store.getState().setError({
              type: 'websocket',
              message: data.message || 'WebSocket error',
              code: data.code || 'WS_ERROR',
              retryable: data.retryable !== false
            });
            break;
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
        
      });

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle new message from WebSocket
   * @param {Object} data - Message data from WebSocket
   */
  handleNewMessage(data) {
    
    if (!data.message) {
      console.error('Invalid message data received:', data);
      return;
    }

    const message = {
      id: data.message.id,
      chatId: data.message.chat_id,
      senderId: data.message.sender_id,
      text: data.message.text,
      createdAt: data.message.created_at,
      updatedAt: data.message.updated_at,
      messageType: data.message.message_type || 'text',
      // Add any additional message properties
      ...data.message
    };

    // Add message to the appropriate chat
    this.store.getState().addMessageToChat(message);
  }

  /**
   * Handle join_chat event from WebSocket
   * @param {Object} data - Join chat data from WebSocket
   */
  handleJoinChat(data) {
    if (!data.chat_id || !data.user_id) {
      console.error('Invalid join_chat data received:', data);
      return;
    }

    // Update chat membership status
    this.store.getState().updateChatMembership(data.chat_id, data.user_id, data);
  }

  /**
   * Handle WebSocket connection close
   * @param {CloseEvent} event - WebSocket close event
   */
  handleClose(event) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnecting = false;
    this.store.getState().setConnectionStatus('disconnected');

    // Attempt reconnection if it wasn't a clean close and we should reconnect
    if (this.shouldReconnect && event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket errors
   * @param {Event} event - WebSocket error event
   */
  handleError(event) {
    console.error('WebSocket error:', event);
    this.isConnecting = false;

    this.store.getState().setError({
      type: 'websocket',
      message: 'WebSocket connection error',
      code: 'WS_ERROR',
      retryable: true
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.store.getState().setError({
        type: 'websocket',
        message: 'Unable to reconnect to server',
        code: 'WS_MAX_RECONNECT_ATTEMPTS',
        retryable: false
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.shouldReconnect && this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Manually trigger reconnection
   */
  reconnect() {
    if (this.token) {
      this.reconnectAttempts = 0;
      this.connect(this.token);
    }
  }

  /**
   * Disconnect WebSocket and prevent reconnection
   */
  disconnect() {
    this.shouldReconnect = false;
    this.isConnecting = false;

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.store.getState().setConnectionStatus('disconnected');
  }

  /**
   * Send a message through WebSocket (if needed for real-time features)
   * @param {Object} message - Message to send
   */
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Get current connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return 'disconnected';
    }
  }
}

export default WebSocketManager;