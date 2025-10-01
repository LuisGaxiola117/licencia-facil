import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import LegalModal from './components/LegalModal';
import './styles/main.css';

function App() {
  const [showModal, setShowModal] = useState(true);

  const handleAccept = () => setShowModal(false);

  return (
    <div className="app-container">
      {showModal && <LegalModal onAccept={handleAccept} />}
      {!showModal && <LoginForm />}
    </div>
  );
}

export default App;