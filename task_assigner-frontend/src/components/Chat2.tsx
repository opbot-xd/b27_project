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

const Chats = () => {
  const { conn } = useConn();
  const [newMessage, setChatMessage] = useState<string>('');
  const [chats, setChats] = useState<NewMessageEvent[]>([]);

  const customEvent: Event = {
    type: '',
    payload: {
      to: '',
      message: '',
      from: '',
      sent: '',
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
    setChats((prevChats) => [...prevChats, messageEvent]);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          flex: 1,
          padding: '10px',
          overflowY: 'auto',
          backgroundColor: '#121212',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '10px',
        }}
      >
        {chats.map((chat, index) => (
          <div
            key={index}
            style={{
              padding: '10px',
              marginBottom: '10px',
              borderBottom: '1px solid #ddd',
            }}
          >
            <div><strong>From:</strong> {chat.from}</div>
            <div><strong>To:</strong> {chat.to}</div>
            <div><strong>Message:</strong> {chat.message}</div>
            <div>
              <small><strong>Sent:</strong> {new Date(chat.sent).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <textarea
          name="message"
          value={newMessage}
          onChange={handleChange}
          placeholder="Type your message here..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginRight: '10px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chats;
