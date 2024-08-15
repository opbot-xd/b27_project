import React from 'react';
import './Chat.css';

const ChatHistory = (currentUser, chats) => {
  const history = chats.map(m => {
    // incoming message on left side
    let margin = '0%';
    let bgcolor = 'darkgray';
    let textAlign = 'left';

    if (m.from === currentUser) {
      // outgoing message to right
      margin = '20%';
      bgcolor = 'teal.400';
      textAlign = 'right';
    }

    const ts = new Date(m.timestamp * 1000);

    return (
      <div style={{textAlign:{textAlign},
      width:'80%',
      padding:"2",
      marginTop:"2",
      marginBottom:"2",
      marginLeft:{margin},
      paddingRight:"2",
      bg:{bgcolor},
      borderRadius:"20"}}
        key={m.id}
        
      >
        <p> {m.message} </p>
        <p style={{fontSize:"xs"}} >
          {' '}
          {ts.toUTCString()}{' '}
        </p>
      </div>
    );
  });

  return <div>{history}</div>;
};

export default ChatHistory;
