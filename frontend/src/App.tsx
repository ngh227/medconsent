import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SendForm from './components/Agreement/SendForm';
import StatusCheck from './components/Agreement/StatusCheck';

function App() {
  return (
    <div className="container mx-auto p-4">
      <SendForm />
      <StatusCheck />
    </div>
  );
}

export default App;