/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import CryptoJs from 'crypto-js';
import axios, { AxiosResponse } from 'axios';
import { useConn } from '../Context'; 

const Login = () => {
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  axios.defaults.xsrfCookieName = "csrftoken";
  const LOGIN_ENDPOINT_URL: string = import.meta.env.VITE_LOGIN_ENDPOINT_URL as string;

  interface LoginInfo {
    username: string;
    password: string;
  }

  const [userData, setUserData] = useState<LoginInfo>({ username: '', password: '' });
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  const { setConn } = useConn();

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
      

      if (window["WebSocket"]) {
        console.log("windows support websockets")
        const connection = await new WebSocket(`ws://localhost:8080/chat/ws?otp=otp&username=${userData.username}`);
        connection.onopen = () => {
          console.log('Connected to WebSocket');
        };
        connection.onerror = (error) => {
          console.error('WebSocket Error:', error);
        };
        setConn(connection); 
        setLoginSuccess(true);
      }
    } catch (err) {
      alert('Login Failed! Try Again');
      console.error({ error: err });
    }
  };

  if (loginSuccess) {
    return <Navigate to='/home' />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Username:</label><br />
      <input type='text' name='username' value={userData.username} onChange={handleChange} /><br /><br />
      <label>Password:</label><br />
      <input type='password' name='password' value={userData.password} onChange={handleChange} /><br /><br />
      <Link to='/signup'>Don't have an account? Sign up!</Link><br /><br />
      <button type='submit'>Submit</button>
    </form>
  );
};

export default Login;
