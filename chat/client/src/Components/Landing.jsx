import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="register">
            <button
              style={{
                padding: '10px 20px',
                fontSize: '18px',
                backgroundColor: '#48BB78',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          </Link>
          <Link to="login">
            <button
              style={{
                padding: '10px 20px',
                fontSize: '18px',
                backgroundColor: 'white',
                color: '#48BB78',
                border: '2px solid #48BB78',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;