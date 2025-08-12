# Design Document

## Overview

This design transforms the existing mock-based React chat application into a fully functional messaging app by integrating real backend APIs and WebSocket connections. The design maintains the current architecture and UI while replacing the mock data layer with real API services.

## Architecture

### Current vs New Architecture

**Current Flow:**
```
Components → Zustand Store → MockDataManager → tmp.json
```

**New Flow:**
```
Components → Zustand Store → API Services → Real Backend
                          → WebSocket Manager → Real-time Updates
```

### Core Integration Points

1. **Authentication Service**: Replace mock login with real API authentication
2. **API Service Layer**: Replace MockDataManager with HTTP API calls
3. **WebSocket Manager**: Add real-time messaging capabilities
4. **Environment Configuration**: Add environment variable support

## Components and Interfaces

### 1. API Service Layer (`src/lib/apiService.js`)

Replaces the current MockDataManager with real HTTP API calls:

```javascript
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    this.token = localStorage.getItem('session_token')
  }

  // Authentication
  async login(identifier, password)
  async getCurrentUser()
  
  // Chat Management
  async getDMChats(limit = 100, offset = 0)
  async getGroups()
  async getChannels()
  async getChatByEid(eid)
  
  // Messaging
  async sendMessage(chatId, text)
}
```

### 2. WebSocket Manager (`src/lib/websocketManager.js`)

Handles real-time messaging:

```javascript
class WebSocketManager {
  constructor(store) {
    this.wsURL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'
    this.store = store
    this.ws = null
    this.reconnectAttempts = 0
  }

  connect(token)
  disconnect()
  handleMessage(event)
  handleJoinChat(data)
  handleNewMessage(data)
  reconnect()
}
```

### 3. Enhanced Zustand Store (`src/lib/appStore.js`)

Extended to handle real API integration:

```javascript
const useAppStore = create((set, get) => ({
  // Existing state...
  
  // New state
  connectionStatus: 'disconnected', // 'connecting', 'connected', 'disconnected'
  isLoading: false,
  error: null,
  
  // Enhanced actions
  loginUser: async (identifier, password) => {
    // Real API authentication
  },
  
  initializeApp: async () => {
    // Load real data and establish WebSocket
  },
  
  loadChats: async () => {
    // Fetch all chat types from API
  },
  
  sendMessage: async (chatId, text) => {
    // Send message via API
  }
}))
```

### 4. Environment Configuration

**File**: `.env` (to be created)

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080
```

## Data Models

### API Response Mapping

Transform API responses to match existing component expectations:

**Chat List Transformation:**
```javascript
// API Response → Component Format
{
  // DM Chats
  dmChats: apiDMChats.map(chat => ({
    id: chat.id,
    type: 'dm',
    lastMessage: chat.last_message,
    updatedAt: chat.updated_at,
    // ... other fields
  })),
  
  // Groups & Channels
  groups: apiGroups.map(group => ({ /* transform */ })),
  channels: apiChannels.map(channel => ({ /* transform */ }))
}
```

**WebSocket Message Mapping:**
```javascript
// WebSocket Event → Store Format
{
  type: 'message',
  message: {
    id: wsMessage.id,
    chatId: wsMessage.chat_id,
    senderId: wsMessage.sender_id,
    text: wsMessage.text,
    createdAt: wsMessage.created_at,
    // ... other fields
  }
}
```

## Error Handling

### API Error Handling Strategy

1. **Network Errors**: Show retry options with exponential backoff
2. **Authentication Errors**: Redirect to login and clear stored tokens
3. **Validation Errors**: Display field-specific error messages
4. **Server Errors**: Show generic error with support contact info

### WebSocket Error Handling

1. **Connection Failures**: Automatic reconnection with visual indicators
2. **Authentication Failures**: Re-authenticate and reconnect
3. **Message Delivery Failures**: Queue messages for retry

### Error State Management

```javascript
// Store error state structure
{
  error: {
    type: 'api' | 'websocket' | 'auth',
    message: string,
    code: string,
    retryable: boolean
  }
}
```

## Testing Strategy

### Integration Testing Approach

1. **API Integration Tests**: Mock API responses and test data transformation
2. **WebSocket Integration Tests**: Mock WebSocket events and test real-time updates
3. **Authentication Flow Tests**: Test login, token storage, and auto-login
4. **Error Handling Tests**: Test various error scenarios and recovery

### Component Testing Updates

Update existing components to work with real data:

1. **Login Component**: Test with real authentication API
2. **Chat List**: Test with real chat data from multiple endpoints
3. **Message Display**: Test with real WebSocket message events
4. **Message Input**: Test message sending with API integration

### Development Testing

1. **Environment Switching**: Test with different API base URLs
2. **Offline Behavior**: Test WebSocket reconnection and error states
3. **Token Expiration**: Test authentication refresh flows

## Implementation Strategy

### Phase 1: API Service Layer
- Create `apiService.js` with all HTTP API methods
- Add environment variable configuration
- Update authentication flow in store

### Phase 2: WebSocket Integration
- Create `websocketManager.js` for real-time messaging
- Integrate WebSocket with Zustand store
- Add connection status management

### Phase 3: Store Integration
- Update all store actions to use real APIs
- Replace mock data calls with API service calls
- Add proper error handling and loading states

### Phase 4: Component Updates
- Update components to handle real data structures
- Add loading states and error displays
- Test all user flows with real backend

### Phase 5: Polish & Testing
- Add comprehensive error handling
- Implement reconnection logic
- Add development and production environment support

## Security Considerations

1. **Token Storage**: Store session tokens securely in localStorage
2. **API Security**: Include Authorization headers in all authenticated requests
3. **WebSocket Security**: Authenticate WebSocket connections with Bearer tokens
4. **Environment Variables**: Keep sensitive configuration in environment variables
5. **Error Messages**: Avoid exposing sensitive information in error messages

## Performance Considerations

1. **API Caching**: Cache chat lists and user data appropriately
2. **WebSocket Efficiency**: Handle message batching for high-volume chats
3. **Memory Management**: Clean up WebSocket connections and event listeners
4. **Loading Optimization**: Show skeleton screens during data loading
5. **Reconnection Strategy**: Implement exponential backoff for WebSocket reconnections