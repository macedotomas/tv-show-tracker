import React, {Fragment, useState} from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify'


const Register = ({setAuth}) => {

  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: ""
  });

  const { username, email, password } = inputs;

  const onChange = e => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { username, email, password };

      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();
      
      // parseRes.data will contain the token if registration was successful
      if (parseRes?.data) {
        localStorage.setItem("token", parseRes.data);
        setAuth(true);
        toast.success("Registered Successfully!");
      } else {
        setAuth(false);
        toast.error(parseRes?.message || "Registration Failed. Please try again.");
      }
    } catch (err) {
      console.error(err.message);
    }
  }; 
  
  return (
    <Fragment>
      <h1>Register</h1>
      <form onSubmit={onSubmitForm}>
        <input  
          type="text" 
          name="username" 
          placeholder="username" 
          value={username} 
          onChange={onChange} />
        <input 
          type="text" 
          name="email" 
          placeholder="email" 
          value={email} 
          onChange={onChange} />
        <input 
          type="password" 
          name="password" 
          placeholder="password" 
          value={password} 
          onChange={onChange} />
        <button type="submit">Register</button>
      </form>
      <Link to="/login">Login</Link>
    </Fragment>
  ); 
};

export default Register;