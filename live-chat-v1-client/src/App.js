import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainContainer from './components/MainContainer.jsx'
import Login from './pages/Login.jsx'
import WelcomePage from './components/WelcomePage.jsx'
import ChatArea from './components/ChatArea.jsx'
import CreateGroup from './components/CreateGroup.jsx'
import CreateContact from './components/CreateContact.jsx'
import AvailableGroups from './components/AvailableGroups.jsx'
import { useSelector } from 'react-redux'
import SignUp from './pages/SignUp.jsx'
import { HashRouter as Router } from 'react-router-dom';

function App() {
  const theme = useSelector((state) => state.themeKey)

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className={"app" + (theme ? "" : " dark")}>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='app' element={<MainContainer />}>
            <Route path='welcome' element={<WelcomePage />} />
            <Route path='chats/:chatId/:name' element={<ChatArea />} />
            <Route path='create-group' element={<CreateGroup />} />
            <Route path='contacts' element={<CreateContact />} />
            <Route path='groups' element={<AvailableGroups />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
