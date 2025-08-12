import { useState } from 'react';
import useAppStore from '../../lib/appStore.js';
import './login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginUser } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setIdentifierError('');
    setPasswordError('');
    setLoginError('');
    
    // Validate inputs
    if (!identifier.trim()) {
      setIdentifierError('Username or email is required');
      return;
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    // Show loading state
    setIsLoading(true);
    
    try {
      const result = await loginUser(identifier, password);
      
      if (!result.success) {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    // Clear errors when user starts typing
    if (identifierError) {
      setIdentifierError('');
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
    if (loginError) {
      setLoginError('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to Chat</h1>
          <p>Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              value={identifier}
              onChange={handleIdentifierChange}
              placeholder="Username or email"
              className={`email-input ${identifierError ? 'error' : ''}`}
              disabled={isLoading}
              autoFocus
            />
            {identifierError && <span className="error-message">{identifierError}</span>}
          </div>

          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password"
              className={`email-input ${passwordError ? 'error' : ''}`}
              disabled={isLoading}
            />
            {passwordError && <span className="error-message">{passwordError}</span>}
          </div>

          {loginError && (
            <div className="input-group">
              <span className="error-message">{loginError}</span>
            </div>
          )}
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Enter your username/email and password to access your chats</p>
        </div>
      </div>
    </div>
  );
};

export default Login;