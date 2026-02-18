import ChatApp from './components/Chat/ChatApp'
import Navbar from './components/Navbar/Navbar'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-content">
        <ChatApp />
      </div>
    </div>
  )
}

export default App
