import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { useConn } from '../Context';
import { FaComment } from 'react-icons/fa';


interface NewMessageEvent {
  to: string;
  message: string;
  from: string;
  time: string;
}
interface Event {
  type: string;
  payload: NewMessageEvent;
}
let sendEvent: Event[] = [];

const Home = () => {
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  axios.defaults.xsrfCookieName = "csrftoken";
  const GET_USERS_URL: string = import.meta.env.VITE_GET_USERS_URL as string;
  const LOGOUT_URL: string = import.meta.env.VITE_LOGOUT_URL as string;
  const username: string | null = localStorage.getItem("username");
  const [apiResponse, setApiResponse] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [logoutSuccessStatus, setLogoutSuccessStatus] = useState<boolean>(false);
  const [authorizationStatus, setAuthorizationStatus] = useState<boolean>(true);
  const [connection, setConnection] = useState<WebSocket>()



  const { setConn } = useConn();

  const getUsers = async () => {
    try {
      const response: AxiosResponse<any, any> = await axios.get(GET_USERS_URL, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
        }
      });
      console.log(response);
      setApiResponse(response.data['users']);
      setLoadingState(false);
    } catch (err) {
      console.error({ error: err });
      setAuthorizationStatus(false);
    }
  };
  const killWebSocket = () => {
    console.log("Disconnecting WebSocket");
    sendEvent = [];
    if (connection) {
        connection.onclose = () => {
            console.log("WebSocket connection closed");
        };
        connection.close(); 
        setConnection(undefined); 
        setConn(connection); 
    }
};
const setupWebSocket = async () => {
  if (window["WebSocket"]) {
      console.log("Window supports WebSockets");
      try {
          
          if (connection) {
              connection.close(); 
          }

          const newConnection = new WebSocket(`ws://localhost:8080/chat/ws?otp=otp&username=${username}`);
          newConnection.onopen = () => {
              console.log('Connected to WebSocket');
          };
          newConnection.onerror = (error) => {
              console.error('WebSocket Error:', error);
          };
          newConnection.onmessage = async function (evt) {
              console.log("Message received from backend:", evt);
              const eventData: Event = JSON.parse(evt.data);
              console.log(eventData);
              sendEvent.push(eventData);
              console.log(sendEvent);
          };

          setConn(newConnection);
          setConnection(newConnection);
      } catch (err) {
          console.log(`socket connection failed. ${err}`);
      }
  }
};


  const logout = async () => {
    try {
      await axios.post(LOGOUT_URL, JSON.stringify({ "message": "terminate session" }), { withCredentials: true, 
        headers:{
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
        }
       });
      localStorage.clear();
      sessionStorage.clear();
      setLogoutSuccessStatus(true);
    } catch (err) {
      console.error({ error: err });
    }
  };

  useEffect(() => {
    getUsers();
    killWebSocket()
    setupWebSocket(); 
  }, []); 

  if (logoutSuccessStatus) {
    return <Navigate to='/' />;
  }
  if (!authorizationStatus) {
    return <Navigate to='/unauthorized_access' />;
  }

  return (
    <>
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2C3E50', 
        color: '#ECF0F1', 
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        <button 
          onClick={logout}
          style={{
            backgroundColor: '#E74C3C', 
            color: '#ECF0F1', 
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#C0392B'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#E74C3C'}
        >
          Logout!
        </button>
        <Link to='/view_tasks' state = {{evt: sendEvent}}>
          <button 
            style={{
              backgroundColor: '#3498DB', 
              color: '#ECF0F1', 
              border: 'none',
              borderRadius: '5px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s',
              textDecoration: 'none'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#2980B9'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#3498DB'}
          >
            View Tasks!
          </button>
        </Link>
      </div>
      
      <h1 style={{
        textAlign: 'center',
        margin: '20px 0',
        color: '#F39C12' 
      }}>Welcome {username}!</h1>
      
      <h3 style={{
        color: '#F39C12', 
        textAlign: 'center'
      }}>List of users:</h3>
      
      <ul style={{
        listStyleType: 'none',
        padding: '0',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {loadingState === false ? apiResponse.map((element, index) => (
          <li key={index} style={{
            marginBottom: '10px',
            fontSize: '18px',
            color: '#ECF0F1', 
            display: 'flex',
            alignItems: 'center'
          }}>
            <Link to={`/assign/${element}`} style={{
              textDecoration: 'none',
              color: '#3498DB', 
              marginRight: '15px'
            }}>{element}</Link>
            <Link to={`/chat/${element}`} state = {{evt: sendEvent}} style={{
              display: 'flex',
              alignItems: 'center',
              color: '#3498DB' 
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <FaComment />
              </span>
              <span style={{ marginLeft: '5px' }}></span>
            </Link>
          </li>
        )) : <li>Loading...</li>}
      </ul>
    </>
  );
};

export default Home;
