import { useState } from 'react'
import './messageInput.css'

function MessageInput() {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      // TODO: Implement message sending logic in future tasks
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="message-input">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="message-input-container">
          {/* Attachment Button */}
          <button 
            type="button" 
            className="input-action-btn attachment-btn"
            title="Attach file"
          >
            <img src="/img.png" alt="Attach" />
          </button>

          {/* Text Input */}
          <div className="text-input-wrapper">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="message-text-input"
              rows="1"
              maxLength="1000"
            />
          </div>

          {/* Emoji Button */}
          <button 
            type="button" 
            className="input-action-btn emoji-btn"
            title="Add emoji"
          >
            <img src="/emoji.png" alt="Emoji" />
          </button>

          {/* Send Button */}
          <button 
            type="submit" 
            className={`send-btn ${message.trim() ? 'send-btn-active' : ''}`}
            disabled={!message.trim()}
            title="Send message"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput