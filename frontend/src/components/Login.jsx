import React, {Fragment, useState} from "react";
import { Link } from "react-router-dom";

import { ToastContainer, toast } from 'react-toastify'

const Login = ({setAuth}) => {
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });

  const { email, password } = inputs;

  const onChange = e => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { email, password };

      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();

      // parseRes.data will contain the token if login was successful
      if (parseRes?.data) {
        localStorage.setItem("token", parseRes.data);
        setAuth(true);
        toast.success("Logged in Successfully!");
      } else {
        setAuth(false);
        toast.error(parseRes?.message || "Login Failed. Please try again.");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <h1>Login</h1>
      <form onSubmit={onSubmitForm}>
        <input
          type="text"
          name="email"
          placeholder="email"
          value={email}
          onChange={onChange}
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          value={password}
          onChange={onChange}
        />
        <button type="submit">Login</button>
      </form>
      <Link to="/register">Register</Link>
    </Fragment>
  );
};

export default Login;