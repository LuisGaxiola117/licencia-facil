import React from 'react';

function LoginSuccessScreen({ onLogout }) {
  return (
    <div style={{textAlign:'center',marginTop:60}}>
      <h2 style={{color:'#2563eb'}}>¡Bienvenido!</h2>
      <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="login success" style={{width:180,margin:'32px auto',display:'block'}} />
      <p style={{fontSize:'1.1rem',color:'#374151'}}>Has iniciado sesión correctamente.</p>
      <div style={{margin:'32px auto',maxWidth:700}}>
        <iframe
          width="700"
          height="394"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          title="Rick Astley - Never Gonna Give You Up"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
      <button onClick={onLogout} style={{marginTop:24,padding:'10px 32px',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>Cerrar sesión</button>
    </div>
  );
}

export default LoginSuccessScreen;
