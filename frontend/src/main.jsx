import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
// import Dashboard from './pages/Dashboard.jsx'
import Class from './pages/Class.jsx'
import Post from './pages/Post.jsx'
import Profil from './pages/Profil.jsx'

const router = createBrowserRouter([
  {
    path : "/",
    element : <App />,
    children : [
      {
        path : "/",
        element : <Login />
      },
      {
        path : "/register",
        element : <Register />
      },
      {
        path : "class",
        element : <Class />
      },
      {
        path : "/home",
        element : <Home />
      },

      {
        path : "/about",
        element : <About />
      },
      {
        path : "/profil",
        element : <Profil />
      },
      {
        path : "/post/:id",
        element : <Post />
      },
    ],
  },
]);
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
