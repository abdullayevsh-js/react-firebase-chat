import { useEffect } from 'react'
import useAppStore from './lib/appStore.js'
import Login from './components/login/Login.jsx'
import List from './components/list/List.jsx'
import Chat from './components/chat/Chat.jsx'
import './App.css'

// Import visual integration test for development
if (process.env.NODE_ENV === 'development') {
  import('./lib/visualIntegrationTest.js')
  import('./lib/requirementsTest.js')
}

function App() {
  const { isLoggedIn, initializeApp } = useAppStore()

  useEffect(() => {
    // Initialize app data when component mounts
    initializeApp()
  }, [initializeApp])

  // Show login if user is not logged in
  if (!isLoggedIn) {
    return <Login />
  }

  // Main app with two-panel layout (List + Chat only)
  return (
    <div className="app-main">
      <div className="app-sidebar">
        <List />
      </div>
      <div className="app-chat">
        <Chat />
      </div>
    </div>
  )
}

export default App
