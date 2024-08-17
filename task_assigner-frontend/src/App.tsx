// import { useState } from 'react'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './components/Home'
import Signup from './components/Signup'
import Login from './components/Login'
import NoPage from './components/NoPage'
import Assign from './components/Assign'
import View from './components/View'
import Unauthorized from './components/Unauthorized'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element = {<Login/>}/>
        <Route path='/signup' element = {<Signup/>}/>
        <Route path='/unauthorized_access' element = {<Unauthorized/>}/>
        <Route path='/home' element = {<Home/>}/>
        <Route path = '/view_tasks' element= {<View/>}/>
        <Route path='/assign/:username' element = {<Assign/>}/>
        <Route path='*' element = {<NoPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
