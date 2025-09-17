import React, {Fragment, useState, useEffect} from "react";
import { toast } from "react-toastify";


const Dashboard = ({setAuth}) => {
  
  const [name, setName] = useState("");


  async function getName() {
    try {

      const token = localStorage.getItem("token") || '';

      const response = await fetch("http://localhost:3000/dashboard",  {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      const parseRes = await response.json();
      
      setName(parseRes.username);
      

    } catch (err) {
      console.error(err.message);
    }
  }


  useEffect(() => {
    getName();
  }, []);


  const logout = e => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.info("Logged out Successfully!");
  }

  return (
    <Fragment>
      <h1>Dashboard {name}</h1>
      <button onClick={e => logout(e)}>Logout</button>
    </Fragment>
  );
};

export default Dashboard;