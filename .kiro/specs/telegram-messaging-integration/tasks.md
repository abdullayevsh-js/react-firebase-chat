# Implementation Plan

- [x] 1. Set up environment configuration and API service foundation
  - Create `.env` file with `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` variables
  - Create `src/lib/apiService.js` with authentication and chat API methods
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Integrate real authentication system
  - Update `loginUser` action in `appStore.js` to use real API authentication with identifier/password
  - Add token storage and retrieval from localStorage
  - Add `getCurrentUser` action to fetch from `/api/v1/user-me/get` endpoint
  - Update Login component to handle identifier/password instead of email-only
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3_

- [x] 3. Replace mock chat data with real API calls
  - Add `loadChats` action to appStore to fetch from DM, groups, and channels endpoints
  - Transform API responses to match existing component data structure
  - Update `initializeApp` to load real data instead of mock data
  - Remove dependency on mockDataManager in store
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Implement WebSocket real-time messaging
  - Create `src/lib/websocketManager.js` for WebSocket connection management
  - Integrate WebSocket with Zustand store for real-time message updates
  - Handle `join_chat` and `message` events from WebSocket
  - Add connection status management to store
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Add message sending functionality
  - Update `MessageInput` component to send messages via API service
  - Add `sendMessage` action to store with proper error handling
  - Update UI to show message sending states and errors
  - Connect message input to selected chat context
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Add comprehensive error handling and loading states
  - Implement error handling for API calls and WebSocket in store
  - Add loading indicators for authentication and data fetching
  - Add WebSocket reconnection logic with connection status display
  - Add error state management and user-friendly error messages
  - Handle authentication expiration and redirect to login
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_