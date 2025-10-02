import React from 'react';

function ErrorModal({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '32px 28px',
        boxShadow: '0 8px 32px 0 rgba(60,72,88,0.18)',
        minWidth: 320,
        maxWidth: 400,
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{fontSize: 48, marginBottom: 12}}>( ͡❛ ⏥ ͡❛)</div>
        <div style={{fontSize: 18, color: '#e53e3e', fontWeight: 600, marginBottom: 18}}>{message}</div>
        <button onClick={onClose} style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: '1rem',
          fontWeight: 500,
          padding: '10px 32px',
          cursor: 'pointer',
          marginTop: 8
        }}>Cerrar</button>
      </div>
    </div>
  );
}

export default ErrorModal;
