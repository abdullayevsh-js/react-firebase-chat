import { useEffect, useRef } from 'react'
import useAppStore from '../../lib/appStore.js'
import { formatMessageTime, getUserDisplayName, getUserAvatar, isMessageFromCurrentUser, getOtherUserInChat } from '../../lib/chatHelpers.js'
import MessageInput from './MessageInput.jsx'
import './chat.css'

function Chat() {
  const { currentUser, selectedChatId, currentChat, currentMessages } = useAppStore()
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && currentMessages.length > 0) {
      // Use requestAnimationFrame to ensure smooth scrolling without layout shifts
      requestAnimationFrame(() => {
        const container = messagesEndRef.current?.parentElement
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  }, [currentMessages])

  // If no chat is selected, show empty state
  if (!selectedChatId || !currentChat) {
    return (
      <div className="chat">
        <div className="chat-empty">
          <div className="chat-empty-content">
            <h3>Welcome to Chat</h3>
            <p>Select a conversation to start messaging</p>
          </div>
        </div>
      </div>
    )
  }

  // Get the other user in the chat for header display
  const otherUser = getOtherUserInChat(selectedChatId, currentUser?.id)

  return (
    <div className="chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-user">
          <img 
            src={getUserAvatar(otherUser)} 
            alt={getUserDisplayName(otherUser)}
            className="chat-header-avatar"
          />
          <div className="chat-header-info">
            <h3 className="chat-header-name">{getUserDisplayName(otherUser)}</h3>
            <span className="chat-header-status">Online</span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn">
            <img src="/phone.png" alt="Call" />
          </button>
          <button className="chat-action-btn">
            <img src="/video.png" alt="Video" />
          </button>
          <button className="chat-action-btn">
            <img src="/info.png" alt="Info" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        <div className="messages-container">
          {currentMessages.map((message, index) => {
            const isOwn = isMessageFromCurrentUser(message, currentUser?.id)
            const showAvatar = !isOwn && (index === 0 || !isMessageFromCurrentUser(currentMessages[index - 1], currentUser?.id))
            
            return (
              <div 
                key={`${message.createdAt}-${index}`}
                className={`message ${isOwn ? 'message-own' : 'message-other'}`}
              >
                {showAvatar && (
                  <img 
                    src={getUserAvatar(otherUser)} 
                    alt={getUserDisplayName(otherUser)}
                    className="message-avatar"
                  />
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p className="message-text">{message.text}</p>
                    <span className="message-time">{formatMessageTime(message.createdAt)}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Area */}
      <MessageInput />
    </div>
  )
}

export default Chat