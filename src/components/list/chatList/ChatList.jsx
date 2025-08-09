import { useState, useEffect } from 'react'
import './chatList.css'
import mockDataManager from '../../../lib/mockData.js'
import useAppStore from '../../../lib/appStore.js'

function ChatList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [chatList, setChatList] = useState([])
  const [filteredChats, setFilteredChats] = useState([])
  const { selectChat, selectedChatId } = useAppStore()

  useEffect(() => {
    // Load chat list with user information
    const chats = mockDataManager.getChatListWithUserInfo()
    setChatList(chats)
    setFilteredChats(chats)
  }, [])

  useEffect(() => {
    // Filter chats based on search term
    if (searchTerm.trim() === '') {
      setFilteredChats(chatList)
    } else {
      const filtered = chatList.filter(chat => 
        chat.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredChats(filtered)
    }
  }, [searchTerm, chatList])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const truncateMessage = (message, maxLength = 35) => {
    if (!message) return 'No messages yet'
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
  }

  const handleChatClick = (chatId, event) => {
    event.preventDefault()
    event.stopPropagation()
    selectChat(chatId)
  }

  return (
    <div className="chatList">
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chat Items */}
      <div className="chat-items-container">
        {filteredChats.length === 0 ? (
          <div className="chat-item--no-chats">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div 
              key={chat.chatId} 
              className={`chat-item ${selectedChatId === chat.chatId ? 'chat-item--active' : ''}`}
              onClick={(e) => handleChatClick(chat.chatId, e)}
            >
              <div className="chat-item--avatar">
                <img 
                  src={chat.user?.avatar || '/avatar.png'} 
                  alt={chat.user?.username || 'User'}
                />
                <div className="chat-item--online-indicator"></div>
              </div>
              
              <div className="chat-item--chat-content">
                <div className="chat-item--chat-header">
                  <span className="chat-item--chat-username">
                    {chat.user?.username || 'Unknown User'}
                  </span>
                  <span className="chat-item--chat-time">
                    {formatTime(chat.updatedAt)}
                  </span>
                </div>
                
                <div className="chat-item--chat-preview">
                  <span className="chat-item--last-message">
                    {truncateMessage(chat.lastMessage)}
                  </span>
                  {!chat.isSeen && (
                    <div className="chat-item--unread-indicator">
                      <span className="chat-item--unread-count">1</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChatList