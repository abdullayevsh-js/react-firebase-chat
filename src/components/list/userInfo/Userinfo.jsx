import './userInfo.css';
import useAppStore from '../../../lib/appStore.js';

function Userinfo() {
  const { currentUser, logoutUser } = useAppStore();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="userInfo">
      <div className="user">
        <div className="avatar-container">
          <img
            src={currentUser.avatar || "/avatar.png"}
            alt="User Avatar"
            className="user-avatar"
          />
          <div className="status-indicator"></div>
        </div>
        <div className="user-details">
          <h3 className="username">{currentUser.username}</h3>
          <p className="user-email">{currentUser.email}</p>
        </div>
      </div>

      <div className="user-actions">
        <button className="action-btn" title="More options">
          <img src="/more.png" alt="More options" className="action-icon" />
        </button>

        <button className="action-btn" title="Settings">
          <img src="/theme.png" alt="Settings" className="action-icon" />
        </button>

        <button className="action-btn logout-btn" onClick={logoutUser} title="Edit profile">
          <img src="/edit.png" alt="Edit profile" className="action-icon" />
        </button>
      </div>
    </div>
  );
}

export default Userinfo;