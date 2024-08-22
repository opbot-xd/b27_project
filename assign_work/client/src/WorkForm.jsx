import  { useEffect, useState } from 'react';
import SocketConnection from '../socket_connections.js';

const WorkForm = () => {
  const [conn,setConn] = useState()
  const [works,setWorks] = useState([])
  const [user] = useState()
  const [formData, setFormData] = useState({
    username: '',
    to: '',
    work: '',
    link: '',
    fromts: '',
    tots: '',
  });

  useEffect(()=>{
    const conn1 = new SocketConnection();
    setConn(conn1);
    conn1.connect(message=>{
        const msg  = JSON.parse(message.data)
        if(msg.to == user){
            setWorks(...works,msg)
        }
    })
    conn1.connected(user)
    console.log('exiting');
  },[])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // const handleChange2 = (e) =>{
  //   if (e.target.name === "user"){
  //       setUser(e.target.value)
  //   }
  // }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert timestamps to integers
    const submissionData = {
      ...formData,
      fromTS: parseInt(formData.fromTS),
      toTS: parseInt(formData.toTS),
    };
    console.log('Form submitted:', submissionData);
    conn.sendMsg(formData)
    setFormData({
        username: '',
        to: '',
        work: '',
        link: '',
        fromTS: '',
        toTS: '',
      })
    // Here you would typically send the data to your backend
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="to">To:</label>
        <input
          type="text"
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="work">Work (Problem Statement):</label>
        <textarea
          id="work"
          name="work"
          value={formData.work}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="link">Link:</label>
        <input
          type="url"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="fromTS">From Timestamp (Work Assigned):</label>
        <input
          type="number"
          id="fromTS"
          name="fromTS"
          value={formData.fromts}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="toTS">To Timestamp (Last Date of Submission):</label>
        <input
          type="number"
          id="toTS"
          name="toTS"
          value={formData.tots}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
    <div>
        {works.map((work)=>{
            <div>
            <div>{work.from}</div>
            <div>{work.problem}</div>
            <div>{work.link}</div>
            <div>{work.tots}</div>
            <div>{work.formts}</div>
            </div>
})}
    </div>
    </>
  );
};

export default WorkForm;