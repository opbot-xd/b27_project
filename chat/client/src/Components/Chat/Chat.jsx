/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios';

import SocketConnection from '../../socket-connection';

import {
  Container,
  Flex,
  Textarea,
  Box,
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Button,
  Input,
} from '@chakra-ui/react';

import ChatHistory from './ChatHistory';
import ContactList from './ContactList';

const  Chat =(props)=> {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     socketConn: '',
  //     username: '',
  //     message: '',
  //     to: '',
  //     isInvalid: false,
  //     endpoint: 'http://localhost:8080',
  //     contact: '',
  //     contacts: [],
  //     renderContactList: [],
  //     chats: [],
  //     chatHistory: [],
  //     msgs: [],
  //   };
  // }

  const [socketConn, setSocketConn] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [to, setTo] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [endpoint] = useState('http://localhost:8080');
  const [contact, setContact] = useState('');
  const [contacts, setContacts] = useState([]);
  const [renderContactList, setRenderContactList] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);


  const componentDidMount = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const user = queryParams.get('u');
    setUsername(user)
    // this.getContacts(user);
    getContacts(user)

    const conn = new SocketConnection();
    await setSocketConn(conn);
    // conn.connect(msg => console.log('message received'));
    // connect to ws connection
    conn.connect(message => {
      const msg = JSON.parse(message.data);

      // update UI only when message is between from and to
      if (to === msg.from || username === msg.from) {
        this.setState(
          {
            chats: [...this.state.chats, msg],
          },
          () => {
            this.renderChatHistory(this.state.username, this.state.chats);
          }
        );
      }
    });

    this.state.socketConn.connected(user);

    console.log('exiting');
  };

  // on change of input, set the value to the message state
  // onChange = event => {
  //   this.setState({ [event.target.name]: event.target.value });
  // };
  const handleChange = (event) => {
    const { name, value } = event.target; // Destructure name and value from event object
    if(name==="name"){
      setUsername(value); // Update name state based on input value
    }
    else if(name==="message"){
      setMessage(value)
    }
    // setMessage(''); // Reset message state on name change (optional, depends on your logic)
  };

  const onSubmit = async (e) => {
    if (e.charCode === 0 && e.code === 'Enter') {
      e.preventDefault();
      const msg = {
        type: 'message',
        chat: {
          from: username,
          to: to,
          message: message,
        },
      };

      await socketConn.sendMsg(msg);
      setMessage('')
      // on error change isInvalid to true and message
    }
  };

  const getContacts = async (user) => {
    const res = await axios.get(
      `${endpoint}/contact-list?username=${user}`
    );
    console.log(res.data);
    if (res.data['data'] !== undefined) {
      setContacts(res.data.data );
      setRenderContactList(res.data.data);
    }
  };

  const fetchChatHistory = async (u1 = 'user1', u2 = 'user2') => {
    const res = await axios.get(
      `http://localhost:8080/chat-history?u1=${u1}&u2=${u2}`
    );

    console.log(res.data, res.data.data.reverse());
    if (res.data.status && res.data['data'] !== undefined) {
      setChats(res.data.data.reverse() );
      renderChatHistoryfunc(u1, res.data.data.reverse());
    } else {
      setChatHistory([]);
    }
  };

  const addContact = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${this.state.endpoint}/verify-contact`, {
        username: contact,
      });

      console.log(res.data);
      if (!res.data.status) {
        setIsInvalid(true)
      } else {
        // reset state on success
        setIsInvalid(true)

        // let contacts = contacts;
        contacts.unshift({
          username: contact,
          last_activity: Date.now() / 1000,
        });
        renderContactListfunc(contacts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderChatHistoryfunc = (currentUser, chats) => {
    const history = ChatHistory(currentUser, chats);
    setChatHistory(history);
  };

  const renderContactListfunc = contacts => {
    const renderContactList = ContactList(contacts, to);

    setRenderContactList(renderContactList)
  };

  const sendMessageTo = (to) => {
    setTo(to)
    fetchChatHistory(username, to);
  };

    return (
      // <Container>
      //   <p style={{ textAlign: 'right', paddingBottom: '10px' }}>
      //     {this.state.username}
      //   </p>
      //   <Container paddingBottom={2}>
      //     <Box>
      //       <FormControl isInvalid={this.state.isInvalid}>
      //         <InputGroup size="md">
      //           <Input
      //             variant="flushed"
      //             type="text"
      //             placeholder="Add Contact"
      //             name="contact"
      //             value={this.state.contact}
      //             onChange={handleChange}
      //           />
      //           <InputRightElement width="6rem">
      //             <Button
      //               colorScheme={'teal'}
      //               h="2rem"
      //               size="lg"
      //               variant="solid"
      //               type="submit"
      //               onClick={this.addContact}
      //             >
      //               Add
      //             </Button>
      //           </InputRightElement>
      //         </InputGroup>
      //         {!this.state.isContactInvalid ? (
      //           ''
      //         ) : (
      //           <FormErrorMessage>contact does not exist</FormErrorMessage>
      //         )}
      //       </FormControl>
      //     </Box>
      //   </Container>
      //   <Flex>
      //     <Box
      //       textAlign={'left'}
      //       overflowY={'scroll'}
      //       flex="1"
      //       h={'32rem'}
      //       borderWidth={1}
      //       borderRightWidth={0}
      //       borderRadius={'xl'}
      //     >
      //       {this.state.renderContactList}
      //     </Box>

      //     <Box flex="2">
      //       <Container
      //         borderWidth={1}
      //         borderLeftWidth={0}
      //         borderBottomWidth={0}
      //         borderRadius={'xl'}
      //         textAlign={'right'}
      //         h={'25rem'}
      //         padding={2}
      //         overflowY={'scroll'}
      //         display="flex"
      //         flexDirection={'column-reverse'}
      //       >
      //         {this.state.chatHistory}
      //       </Container>

      //       <Box flex="1">
      //         <FormControl onKeyDown={onSubmit} onSubmit={onSubmit}>
      //           <Textarea
      //             type="submit"
      //             borderWidth={1}
      //             borderRadius={'xl'}
      //             minH={'7rem'}
      //             placeholder="Aur Sunao... Press enter to send..."
      //             size="lg"
      //             resize={'none'}
      //             name="message"
      //             value={this.state.message}
      //             onChange={handleChange}
      //             isDisabled={this.state.to === ''}
      //           />
      //         </FormControl>
      //       </Box>
      //     </Box>
      //   </Flex>
      // </Container>
      <div></div>
    );
  }

export default Chat;
