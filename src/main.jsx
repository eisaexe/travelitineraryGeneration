import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ViewTrip from './view-trip/[tripid]/index.jsx'
import MyTrips from './my-trips/index.jsx'
import Chatbot from './chatbot/index.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path:'/create-trip',
    element: <CreateTrip />
  },
  {
    path: '/view-trip/:tripid',
    element: <ViewTrip />
  },
  {
    path:'my-trips',
    element:<MyTrips />
  },
  {
    path:'chatbot',
    element:<Chatbot />
  },
])
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
    <Header />
    <Toaster />
    <RouterProvider router={router}/>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
