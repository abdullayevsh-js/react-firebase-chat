import './list.css'
import Userinfo from './userInfo/Userinfo.jsx'
import ChatList from './chatList/ChatList.jsx'

function List() {
  return (
    <div className="list">
      <Userinfo />
      <ChatList />
    </div>
  )
}

export default List