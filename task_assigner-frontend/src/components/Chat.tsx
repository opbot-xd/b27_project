import { ChangeEvent, FormEvent, useState } from 'react';
import { useConn } from '../Context'; 
const Chat = () => {
  const { conn } = useConn();
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

  const [newMessage, setChatMessage] = useState<string>('');
  const [chats, setChats] = useState<string>('');

  let customEvent: Event = {
    type: '',
    payload: {
      to: '',
      message: '',
      from: '',
    },
  };

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

    if (message != null) {
      let outgoingEvent: SendMessageEvent = {
        to: to,
        message: message,
        from: from,
      };
      sendEvent('send_message', outgoingEvent);
    }

    function sendEvent(eventName: string, payload: SendMessageEvent) {
      const event: Event = {
        type: eventName,
        payload: payload,
      };
      console.log(event)
      conn!.send(JSON.stringify(event));
    }

    conn.onmessage = function (evt) {
      console.log(evt);
      const eventData = JSON.parse(evt.data);
      const event = Object.assign(customEvent, eventData);
      routeEvent(event);
    };

    const appendChatMessage = (messageEvent: Event & (SendMessageEvent | NewMessageEvent)) => {
      const formattedMsg = `from ${messageEvent.from} : ${messageEvent.message}`;
      setChats((prevChats) => `${prevChats}\n${formattedMsg}`);
    };

    const routeEvent = (event: Event) => {
      if (event.type === undefined) {
        alert("no 'type' field in event");
      }
      switch (event.type) {
        case 'new_message':
          const messageEvent = Object.assign(customEvent, event.payload);
          appendChatMessage(messageEvent);
          break;
        default:
          alert('unsupported message type');
          break;
      }
    };
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea name="chats" value={chats} readOnly />
      <textarea name="message" value={newMessage} onChange={handleChange} />
      <button>Send</button>
    </form>
  );
};

export default Chat;
