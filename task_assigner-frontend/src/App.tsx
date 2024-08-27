import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import NoPage from './components/NoPage';
import Assign from './components/Assign';
import Assigns from './components/Assign2';
import View from './components/View';
import Chat from './components/Chat';
import Chats from './components/Chat2';
import Unauthorized from './components/Unauthorized';
import ConnProvider from './Context';

function App() {
  return (
    <ConnProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/unauthorized_access' element={<Unauthorized />} />
          <Route path='/home' element={<Home />} />
          <Route path='/view_tasks' element={<View />} />
          <Route path='/assign/:username' element={<Assign />} />
          <Route path='/a' element={<Assigns />} />
          <Route path='/chat/:username' element={<Chat />} />
          <Route path='/c' element={<Chats />} />
          <Route path='*' element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </ConnProvider>
  );
}

export default App;
