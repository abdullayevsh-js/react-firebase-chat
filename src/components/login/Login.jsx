import { useState } from 'react';
import useAppStore from '../../lib/appStore.js';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginUser } = useAppStore();

  // Basic email format validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError('');
    
    // Validate email format
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Show loading state for smooth transition
    setIsLoading(true);
    
    // Simulate a brief loading delay for premium feel
    setTimeout(() => {
      loginUser(email);
      setIsLoading(false);
    }, 800);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to Chat</h1>
          <p>Enter your email to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={`email-input ${emailError ? 'error' : ''}`}
              disabled={isLoading}
              autoFocus
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Continue'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>No password required - just enter your email to get started</p>
        </div>
      </div>
    </div>
  );
};

export default Login;