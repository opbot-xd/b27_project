/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import CryptoJs from 'crypto-js';
import axios, { AxiosResponse } from 'axios';
// import { useConn } from '../Context'; 

interface LoginInfo {
  username: string;
  password: string;
}
// interface NewMessageEvent {
//   to: string;
//   message: string;
//   from: string;
//   time: string;
// }
// interface Event {
//   type: string;
//   payload: NewMessageEvent;
// }

// let sendEvent:Event[]=[];
const Login = () => {
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  axios.defaults.xsrfCookieName = "csrftoken";
  const LOGIN_ENDPOINT_URL: string = import.meta.env.VITE_LOGIN_ENDPOINT_URL as string;



  const [userData, setUserData] = useState<LoginInfo>({ username: '', password: '' });
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  // const [eventState, setEventState] = useState<Event[]>()

  // const customEvent: Event = {
  //   type: '',
  //   payload: {
  //     to: '',
  //     message: '',
  //     from: '',
  //     time: '',
  //   },
  // };

  // const { setConn } = useConn();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let password: string = userData.password;
    try {
      password = CryptoJs.SHA256(password).toString(CryptoJs.enc.Hex);
      setUserData({ password: password, username: userData.username });
    } catch (err) {
      console.error({ message: err });
    }



    try {
      const response: AxiosResponse<any, any> = await axios.post(LOGIN_ENDPOINT_URL, userData, { withCredentials: true });
      console.log(response);
      localStorage.setItem("username", userData.username);
      sessionStorage.setItem("access_token", response.data["access_token"]);
      

      // if (window["WebSocket"]) {
      //   console.log("windows support websockets")
      //   const connection = await new WebSocket(`ws://localhost:8080/chat/ws?otp=otp&username=${userData.username}`);
      //   connection.onopen = () => {
      //     console.log('Connected to WebSocket');
      //   };
      //   connection.onerror = (error) => {
      //     console.error('WebSocket Error:', error);
      //   };
      //   setConn(connection); 
      //   connection.onmessage = async function (evt) {
      //     console.log("Message received from backend:", evt);
      //     const eventData: Event = JSON.parse(evt.data);
      //     // const messEvent = Object.assign(customEvent, eventData);
      //     console.log(eventData)
      //     // console.log(eventData)
      //     sendEvent.push(eventData)
      //     // localStorage.setItem("chatsList",JSON.stringify(sendEvent))


          
          
      //     if(event.type===undefined){
      //       console.log('"type" not present');
      //       return;
      //     }
      //   }
      //   console.log(sendEvent)
      //   setEventState(sendEvent)
        setTimeout(()=>{
          setLoginSuccess(true);
        },100)
      // }



    } catch (err) {
      alert('Login Failed! Try Again');
      console.error({ error: err });
    }
  };

  if (loginSuccess) {
    return <Navigate to='/home'/>;
  }

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '50px',
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
    }}>Username:</label><br />
    <input type='text' name='username' value={userData.username} onChange={handleChange} style={{
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        border: '1px solid #34495E',
        borderRadius: '5px',
        fontSize: '16px',
        backgroundColor: '#34495E',
        color: '#ECF0F1' 
    }} /><br /><br />
    
    <label style={{
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '10px',
        color: '#ECF0F1' 
    }}>Password:</label><br />
    <input type='password' name='password' value={userData.password} onChange={handleChange} style={{
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        border: '1px solid #34495E',
        borderRadius: '5px',
        fontSize: '16px',
        backgroundColor: '#34495E', 
        color: '#ECF0F1' 
    }} /><br /><br />
    
    <Link to='/signup' style={{
        display: 'block',
        textAlign: 'center',
        marginTop: '10px',
        color: '#1E90FF', 
        textDecoration: 'none',
        fontSize: '14px'
    }}>Don't have an account? Sign up!</Link><br /><br />
    
    <button type='submit' style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#27AE60', 
        color: '#ECF0F1', 
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer'
    }}>Submit</button>
  </form>
  
  
  );
};

export default Login;
