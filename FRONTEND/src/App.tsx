import { useState } from 'react';
import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import 'react-toastify/dist/ReactToastify.css';

import './App.scss';

import Navigation from './navigation';
import { ToastContainer } from 'react-toastify';
const App = () => {
  return (
    <>
      <div className="App">
        <Navigation />
        <ToastContainer />
      </div>
    
    </>
  );
};
export default App;
