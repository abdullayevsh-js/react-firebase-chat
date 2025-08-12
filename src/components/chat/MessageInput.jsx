import { useState } from 'react'
import useAppStore from '../../lib/appStore.js'
import './messageInput.css'

function MessageInput() {
  const [message, setMessage] = useState('')
  
  // Get store state and actions
  const { 
    selectedChatId, 
    isSendingMessage, 
    error, 
    sendMessage, 
    clearError,
    isLoggedIn 
  } = useAppStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim() || isSendingMessage) return
    
    // Clear any previous errors
    clearError()
    
    // Send message via store action (Requirements 5.1, 5.2, 5.3)
    const result = await sendMessage(message.trim())
    
    // Clear input only if message was sent successfully
    if (result.success) {
      setMessage('')
    }
    // If failed, keep the message in input for retry (Requirement 5.3)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSendingMessage) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Check if message input should be disabled (Requirements 5.4, 5.5)
  const isDisabled = !isLoggedIn || !selectedChatId || isSendingMessage
  const canSend = message.trim() && !isDisabled

  return (
    <div className="message-input">
      {/* Error Display */}
      {error && (
        <div className="message-error">
          <span className="error-text">{error}</span>
          <button 
            className="error-dismiss" 
            onClick={clearError}
            title="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form">
        <div className={`message-input-container ${isDisabled ? 'disabled' : ''}`}>
          {/* Attachment Button */}
          <button 
            type="button" 
            className="input-action-btn attachment-btn"
            title="Attach file"
            disabled={isDisabled}
          >
            <img src="/img.png" alt="Attach" />
          </button>

          {/* Text Input */}
          <div className="text-input-wrapper">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !isLoggedIn 
                  ? "Please log in to send messages..." 
                  : !selectedChatId 
                    ? "Select a chat to send messages..." 
                    : "Type a message..."
              }
              className="message-text-input"
              rows="1"
              maxLength="1000"
              disabled={isDisabled}
            />
          </div>

          {/* Emoji Button */}
          <button 
            type="button" 
            className="input-action-btn emoji-btn"
            title="Add emoji"
            disabled={isDisabled}
          >
            <img src="/emoji.png" alt="Emoji" />
          </button>

          {/* Send Button */}
          <button 
            type="submit" 
            className={`send-btn ${canSend ? 'send-btn-active' : ''} ${isSendingMessage ? 'sending' : ''}`}
            disabled={!canSend}
            title={
              isSendingMessage 
                ? "Sending..." 
                : !isLoggedIn 
                  ? "Please log in to send messages" 
                  : !selectedChatId 
                    ? "Select a chat to send messages" 
                    : "Send message"
            }
          >
            {isSendingMessage ? (
              <span className="sending-indicator">
                <span className="spinner"></span>
                Sending...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput