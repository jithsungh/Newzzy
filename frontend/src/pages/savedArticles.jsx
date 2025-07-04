import React from 'react'
import { useAuth } from '../context/authContext';
import { Navigate } from "react-router-dom";

const savedArticles = () => {
  const { user,setLogout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }
  return (
    <div>savedArticles</div>
  )
}

export default savedArticles