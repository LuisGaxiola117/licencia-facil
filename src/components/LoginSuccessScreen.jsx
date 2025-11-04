import React, { useState } from 'react';

function LoginSuccessScreen({ onLogout }) {
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState('sha256');
  const [output, setOutput] = useState('');
  const [working, setWorking] = useState(false);

  const enc = new TextEncoder();
  const bufToHex = (buffer) => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  const bufToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  async function hashSHA256(text) {
    const data = enc.encode(text);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return bufToHex(hash);
  }

  async function derivePBKDF2(password, saltBytes, iterations = 100000, keyLen = 32) {
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' }, keyMaterial, keyLen * 8);
    return derived;
  }

  async function simulateBcryptLike(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derived = await derivePBKDF2(password, salt, 200000, 24);
    return { salt: bufToHex(salt), hash: bufToBase64(derived) };
  }

  async function handleSimulate(e) {
    e && e.preventDefault();
    if (!password) {
      setOutput('Introduce una contraseña para probar.');
      return;
    }
    setWorking(true);
    try {
      if (method === 'sha256') {
        const h = await hashSHA256(password);
        setOutput(`SHA-256: ${h}`);
      } else if (method === 'pbkdf2') {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const derived = await derivePBKDF2(password, salt, 150000, 32);
        setOutput(`PBKDF2 (salt hex ${bufToHex(salt)}, iterations 150000): ${bufToBase64(derived)}`);
      } else if (method === 'bcrypt-sim') {
        const res = await simulateBcryptLike(password);
        setOutput(`Simulated bcrypt (PBKDF2): salt=${res.salt} hash(base64)=${res.hash}`);
      }
    } catch (err) {
      setOutput('Error durante la simulación: ' + String(err));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div style={{textAlign:'center',marginTop:60}}>
      <h2 style={{color:'#2563eb'}}>¡Bienvenido!</h2>
      <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="login success" style={{width:180,margin:'32px auto',display:'block'}} />
      <p style={{fontSize:'1.1rem',color:'#374151'}}>Has iniciado sesión correctamente.</p>
      <div style={{margin:'32px auto',maxWidth:700}}>
        <div style={{textAlign:'left',color:'#374151',lineHeight:1.6}}>
          <h4 style={{marginTop:12}}>SHA‑256 / SHA‑384 / SHA‑512</h4>
          <p>Son funciones que crean una "huella" de cualquier dato. Son muy rápidas y buenas para verificar archivos, pero por ser rápidas no son adecuadas por sí solas para proteger contraseñas: un atacante puede probar muchas contraseñas por segundo.</p>

          <h4 style={{marginTop:12}}>Bcrypt</h4>
          <p>Bcrypt está hecho para contraseñas. Añade un "salt" (valor aleatorio) y puede ralentizar el cálculo (cost), lo que dificulta los ataques. Es una buena opción práctica hoy en día.</p>

          <h4 style={{marginTop:12}}>SHA256CRYPT</h4>
          <p>Es una forma de usar SHA‑256 con un salt y varias rondas. Mejora respecto a SHA‑256 simple, pero en general bcrypt o Argon2 suelen ser preferibles para nuevas aplicaciones.</p>

          <h4 style={{marginTop:12}}>PBKDF2</h4>
          <p>PBKDF2 aplica muchas iteraciones de una función hash con un salt para volver más caro el intento de adivinar contraseñas. Si configuras suficientes iteraciones, es seguro y muy usado donde no hay Argon2.</p>

          <h4 style={{marginTop:12}}>Consejo práctico</h4>
          <ul>
            <li>Usa un algoritmo adaptativo (Argon2 es la opción moderna; bcrypt o PBKDF2 son buenas alternativas).</li>
            <li>Siempre usa un <strong>salt</strong> único por contraseña y guarda el parámetro de coste (rounds) junto al hash.</li>
            <li>No uses SHA‑2 solo (SHA‑256/384/512) para almacenar contraseñas sin sal y sin iteraciones.</li>
          </ul>
        </div>

        {/* Simulación interactiva */}
        <div style={{marginTop:18,padding:12,background:'#f8fafc',borderRadius:8,border:'1px solid #e6eef8'}}>
          <h4 style={{marginBottom:8,color:'#0f172a'}}>Simulación</h4>
          <p style={{marginTop:0,color:'#374151'}}>Introduce una contraseña y elige un método para ver una huella/resultado. Esto es solo demostrativo: el almacenamiento seguro debe realizarse en el servidor con bcrypt/argon2 o PBKDF2 con parámetros fuertes.</p>

          <form onSubmit={handleSimulate} style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña de ejemplo" style={{padding:'8px 10px',flex:'1 1 220px',borderRadius:6,border:'1px solid #cbd5e1'}} />
            <select value={method} onChange={e => setMethod(e.target.value)} style={{padding:8,borderRadius:6,border:'1px solid #cbd5e1'}}>
              <option value="sha256">SHA-256 (rápido, no ideal para contraseñas)</option>
              <option value="pbkdf2">PBKDF2 (iteraciones, derivación)</option>
              <option value="bcrypt-sim">Simulación tipo bcrypt (PBKDF2 con más rounds)</option>
            </select>
            <button type="submit" disabled={working} style={{padding:'8px 14px',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>{working ? 'Procesando...' : 'Simular'}</button>
          </form>

          <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',background:'#fff',padding:12,marginTop:12,borderRadius:6,border:'1px solid #e6eef8'}}>{output || 'Resultado aparecerá aquí'}</pre>
          <p style={{fontSize:'0.9rem',color:'#475569',marginTop:8}}>Nota: bcrypt y Argon2 normalmente se ejecutan en el servidor y usan técnicas específicas; aquí usamos PBKDF2 para demostrar cómo cambia la salida cuando aplicas salt e iteraciones.</p>
        </div>

      </div>
      <button onClick={onLogout} style={{marginTop:24,padding:'10px 32px',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>Cerrar sesión</button>
    </div>
  );
}

export default LoginSuccessScreen;
