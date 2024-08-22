import { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/chat?u=');

  const endpoint = 'http://localhost:8080/login';

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === 'username') setUsername(value);
    if (name === 'password') setPassword(value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(endpoint, { username, password });

      console.log('login', res);
      if (res.data.status) {
        setRedirect(true);
        setRedirectTo(`/chat?u=${username}`);
      } else {
        setMessage(res.data.message);
        setIsInvalid(true);
      }
    } catch (error) {
      console.log(error);
      setMessage('something went wrong');
      setIsInvalid(true);
    }
  };

  if (redirect) {
    return <Navigate to={redirectTo} replace={true} />;
  }

  return (
    <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ borderRadius: '8px', padding: '40px', border: '2px solid #ccc' }}>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Username"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            {isInvalid && <p style={{ color: 'red', marginTop: '5px' }}>invalid username or password</p>}
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#4CAF50',
              border: 'none',
              color: 'white',
              padding: '15px 32px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              margin: '4px 2px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Login
          </button>
        </form>
        <div style={{ paddingTop: '15px' }}>
          <p style={{ fontStyle: 'italic', fontSize: '18px', color: 'red' }}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;