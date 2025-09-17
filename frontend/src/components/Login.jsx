import React, {Fragment, useState} from "react";
import { Link } from "react-router-dom";

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

      console.log(parseRes.data);

      // parseRes.data will contain the token if login was successful
      if (parseRes.data) {
        localStorage.setItem("token", parseRes.data);
        setAuth(true);
      } else {
        setAuth(false);
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