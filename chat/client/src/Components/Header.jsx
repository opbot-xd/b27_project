import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <div style={{textAlign:"center",fontSize:"48px"}}>
<Link to="/">
             Chat App
        </Link>
    </div>
        
  );
}

export default Header;
