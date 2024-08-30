import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConn } from '../Context';

interface NewMessageEvent {
  to: string;
  message: string;
  from: string;
  sent: string;
}

interface SendMessageEvent {
  to: string;
  message: string;
  from: string;
}

interface Event {
  type: string;
  payload: SendMessageEvent | NewMessageEvent;
}

const Chat = () => {
  const location=  useLocation()
  const { conn } = useConn();
  const [newMessage, setChatMessage] = useState<string>('');
  const [chats, setChats] = useState<string>('');
  const username = localStorage.getItem("username")


  const customEvent: Event = {
    type: '',
    payload: {
      to: '',
      message: '',
      from: '',
    },
  };
  const {evt} = location.state
  console.log(evt)
  
  const appendChatMessage = (messageEvent: NewMessageEvent) => {
    const formattedMsg = `from ${messageEvent.from} : ${messageEvent.message}`;
    setChats((prevChats) => `${prevChats}\n${formattedMsg}`);
  };
  useEffect(() => {
    if (evt) {
      console.log(evt);
      evt.forEach((e: Event) => {
        if((e.payload.to === username && e.payload.from === (window.location.href).split('/')[4])||e.payload.to === (window.location.href).split('/')[4] && e.payload.from === username){
          const messageEvent: NewMessageEvent = e.payload as NewMessageEvent;
          console.log(messageEvent)
          appendChatMessage(messageEvent);
        }
      });
    }
  }, []);



  useEffect(() => {
    if (conn) {
      conn.onmessage = function (evt) {
        console.log("Message received from backend:", evt);
        const eventData = JSON.parse(evt.data);
        const event = Object.assign({}, customEvent, eventData);
        routeEvent(event);
      };
    }
  }, []);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setChatMessage(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!conn) {
      console.error('WebSocket connection not established');
      return;
    }

    const from = localStorage.getItem('username') ?? '';
    const to = `${window.location.href}`.split('/')[4];
    const message = newMessage;

    if (message) {
      const outgoingEvent: SendMessageEvent = {
        to: to,
        message: message,
        from: from,
      };
      sendEvent('send_message', outgoingEvent);
      setChatMessage('');
    }
  };

  const sendEvent = (eventName: string, payload: SendMessageEvent) => {
    const event: Event = {
      type: eventName,
      payload: payload,
    };
    console.log("Sending event:", event);
    conn!.send(JSON.stringify(event));
  };

  

  const routeEvent = (event: Event) => {
    if (event.type === undefined) {
      console.error("No 'type' field in event");
      return;
    }
    switch (event.type) {
      case 'new_message':
        appendChatMessage(event.payload as NewMessageEvent);
        break;
      default:
        console.warn('Unsupported message type:', event.type);
        break;
    }
  };

  return (
<form onSubmit={handleSubmit} style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', 
    padding: '60px',
    backgroundColor: '#1ABC9C', 
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '1000px', 
    margin: 'auto',
    width:"100%"
}}>
    <textarea
        name="chats"
        value={chats}
        readOnly
        style={{
            width: '100%',
            height: '300px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #16A085', 
            backgroundColor: '#16A085', 
            color: '#FFFFFF', 
            resize: 'none',
            overflowY: 'auto'
        }}
    />
    <textarea
        name="message"
        value={newMessage}
        onChange={handleChange}
        style={{
            width: '100%',
            height: '100px', 
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #16A085', 
            backgroundColor: '#16A085', 
            color: '#FFFFFF',
            resize: 'none'
        }}
    />
    <button
        type="submit"
        style={{
            width: '100%',
            padding: '12px', 
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#E67E22',
            color: '#FFFFFF', 
            fontSize: '18px', 
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            fontWeight: 'bold'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#D35400')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#E67E22')}
    >
        Send
    </button>
</form>





  );
};

export default Chat;