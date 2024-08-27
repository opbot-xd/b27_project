import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
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
  const { conn } = useConn();
  const [newMessage, setChatMessage] = useState<string>('');
  const [chats, setChats] = useState<string>('');

  const customEvent: Event = {
    type: '',
    payload: {
      to: '',
      message: '',
      from: '',
    },
  };

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
        to,
        message,
        from,
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

  const appendChatMessage = (messageEvent: NewMessageEvent) => {
    const formattedMsg = `from ${messageEvent.from} : ${messageEvent.message}`;
    setChats((prevChats) => `${prevChats}\n${formattedMsg}`);
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
    <form onSubmit={handleSubmit}>
      <textarea name="chats" value={chats} readOnly />
      <textarea name="message" value={newMessage} onChange={handleChange} />
      <button type="submit">Send</button>
    </form>
  );
};

export default Chat;