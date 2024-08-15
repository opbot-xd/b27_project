import React from 'react';

const ContactList = (contacts, sendMessage) => {
  const contactList = contacts.map(c => {
    const ts = new Date(c.last_activity * 1000);

    return (
      <div key={c.username}>
        <div
          style={{textAlign:"left",marginTop:"2",marginBottom:"2",paddingRight:"2",borderRadius:"20",
            borderColor:"-moz-initial",
            borderBottomColor:'whiteAlpha.500'}}
          key={c.username}
          onClick={() => sendMessage(c.username)}
        >
          <p> {c.username} </p>
          <p  style={{fontSize:"xs"}}>
            {' '}
            {ts.toDateString()}{' '}
          </p>
        </div>
        <hr />
      </div>
    );
  });

  return contactList;
};

export default ContactList;
