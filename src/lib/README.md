# Mock Data and State Management

This directory contains the mock data utilities and state management for the responsive chat application.

## Files Overview

### `mockData.js`
- **Purpose**: Loads and manages data from `tmp.json`
- **Key Methods**:
  - `getCurrentUser()` - Get current user data
  - `getChatListWithUserInfo()` - Get formatted chat list for UI
  - `getMessagesForChat(chatId)` - Get messages for specific chat
  - `getUserById(userId)` - Find user by ID

### `appStore.js`
- **Purpose**: Zustand-based state management
- **State**:
  - `currentUser` - Currently logged in user
  - `selectedChatId` - Active chat ID
  - `chatList` - List of chats with user info
  - `currentMessages` - Messages for selected chat
- **Actions**:
  - `loginUser(email)` - Simple email-only login
  - `selectChat(chatId)` - Switch to different chat
  - `initializeApp()` - Load initial data

### `chatHelpers.js`
- **Purpose**: Utility functions for chat operations
- **Key Functions**:
  - `formatMessageTime()` - Format timestamps for display
  - `getUserDisplayName()` - Get user display name with fallbacks
  - `isValidEmail()` - Simple email validation
  - `searchChats()` - Filter chats by search term

### `index.js`
- **Purpose**: Main export file for easy imports

## Usage Example

```javascript
import { useAppStore, mockDataManager, isValidEmail } from '../lib';

// In a component
const { currentUser, loginUser, selectChat } = useAppStore();

// Login user
if (isValidEmail(email)) {
  loginUser(email);
}

// Select a chat
selectChat('FlMdgIKb7A2nQZN7csKr');
```

## Data Structure

The application uses the following data structure from `tmp.json`:

```javascript
{
  user_me: { id, avatar, username, email },
  other_users: [{ id, avatar, username, email }],
  chats: [{ id, createdAt, messages: [...] }],
  userchats: [{ id, chatId, isSeen, lastMessage, receiverId, updatedAt }]
}
```