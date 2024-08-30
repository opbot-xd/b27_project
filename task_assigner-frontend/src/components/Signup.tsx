/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent, FormEvent, createContext } from 'react'
import {Navigate} from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import CryptoJs from 'crypto-js'

export const ConnContext = createContext<WebSocket | undefined>(undefined)
const Signup = () => {
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  axios.defaults.xsrfCookieName = "csrftoken";
  const SIGNUP_URL: string = import.meta.env.VITE_SIGNUP_URL as string
  interface Signup {
    username: string,
    password: string,
    email: string
  }


  const [formData, setFormdata] = useState<Signup>({ username: "", password: "", email: "" })
  const [successfulSignup, isSignupSuccessful] = useState<boolean>(false)
  // const [conn, setConn] = useState<WebSocket>()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormdata((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let password: string = formData.password
    try {
      password = await CryptoJs.SHA256(password).toString(CryptoJs.enc.Hex)
      setFormdata({password:password, username:formData.username, email:formData.email})
    } catch (err) {
      console.error({ message: err })
    }

    try {
      const response: AxiosResponse<any, any> = await axios.post(SIGNUP_URL, formData, {withCredentials: true})
      console.log(response)
      localStorage.setItem("username",formData.username)
      sessionStorage.setItem("access_token", response.data["access_token"])
      isSignupSuccessful(true)

      // if (window["WebSocket"]) {
      //   const connection = new WebSocket(`ws://${document.location.host}/ws?otp=otp&username=${formData.username}`);
      //   connection.onopen = () => {
      //     console.log('Connected to WebSocket');
      //   };
      //   connection.onerror = (error) => {
      //     console.error('WebSocket Error:', error);
      //   };
      //   setConn(connection); 
      // }
    } catch (err) {
      alert('Login Failed! Try Again');
      console.error({ error: err });
    }
  };

  if(successfulSignup){
    return(
      // <ConnContext.Provider value={conn}>
        <Navigate to = '/'/>
      // {/* </ConnContext.Provider> */}
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '60px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      backgroundColor: '#2C3E50',
      color: '#ECF0F1', 
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
  }}>
    <label style={{
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '10px',
        color: '#ECF0F1' 
    }}>Username:</label>
    <input
      type='text'
      name="username"
      value={formData.username}
      onChange={handleChange}
      style={{
          width: '100%',
          padding: '12px', 
          marginBottom: '20px',
          border: '1px solid #34495E', 
          borderRadius: '5px',
          fontSize: '16px',
          backgroundColor: '#34495E', 
          color: '#ECF0F1' 
      }}
    />
    
    <label style={{
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '10px',
        color: '#ECF0F1' 
    }}>Email:</label>
    <input
      type='text'
      name="email"
      value={formData.email}
      onChange={handleChange}
      style={{
          width: '100%',
          padding: '12px', 
          marginBottom: '20px',
          border: '1px solid #34495E', 
          borderRadius: '5px',
          fontSize: '16px',
          backgroundColor: '#34495E', 
          color: '#ECF0F1' 
      }}
    />
    
    <label style={{
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '10px',
        color: '#ECF0F1'
    }}>Password:</label>
    <input
      type='password'
      name="password"
      value={formData.password}
      onChange={handleChange}
      style={{
          width: '100%',
          padding: '12px', 
          marginBottom: '20px',
          border: '1px solid #34495E', 
          borderRadius: '5px',
          fontSize: '16px',
          backgroundColor: '#34495E',
          color: '#ECF0F1' 
      }}
    />
    
    <button type='submit' style={{
        width: '100%',
        padding: '12px',
        backgroundColor: '#27AE60', 
        color: '#ECF0F1', 
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer'
    }}>Signup!</button>
  </form>
  
  )
}
export default Signup
