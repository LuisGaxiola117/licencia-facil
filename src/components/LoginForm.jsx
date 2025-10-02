  import React, { useState } from 'react';
  import DataSecurityModal from './DataSecurityModal';
  import LegalModal from './LegalModal';
  import LoginSuccessScreen from './LoginSuccessScreen';
   import ErrorModal from './ErrorModal';

  function IdentityVerificationForm() {
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [rejected, setRejected] = useState(false);
    const [showLegal, setShowLegal] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [form, setForm] = useState({
      nombre: '',
      fecha: '',
      genero: '',
      correo: '',
      telefono: '',
      password: '',
    });
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

    const handleFileChange = (e) => {
      const selected = e.target.files[0];
      setFile(selected);
      if (selected && selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(selected);
      } else {
        setPreviewUrl(null);
      }
    };

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);
      // Validación para ambos: login y registro
      if (isLogin) {
        if (!form.correo || !form.password) {
          setError('Todos los campos son obligatorios. ( ͡❛ ⏥ ͡❛)');
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        // LOGIN
        try {
          const res = await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.correo,
              password: form.password
            })
          });
          const data = await res.json();
          if (res.ok) {
            setSuccess('¡Login exitoso!');
            setLoggedIn(true);
          } else {
            setError(data.message || 'Error al iniciar sesión');
            if (data.message && data.message.includes('⏥')) setShowErrorModal(true);
          }
        } catch (err) {
          setError('Error de conexión con el servidor');
        }
        setLoading(false);
        return;
      }
      // REGISTRO
      if (!form.nombre || !form.fecha || !form.genero || !form.correo || !form.telefono || !form.password || !file) {
        setError('Todos los campos son obligatorios. ( ͡❛ ⏥ ͡❛)');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      // Convertir imagen a base64
      const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      let licenseBase64 = '';
      try {
        licenseBase64 = await getBase64(file);
      } catch {
        setError('Error al procesar la imagen');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:4000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.nombre,
            dob: form.fecha,
            gender: form.genero,
            email: form.correo,
            phone: form.telefono,
            password: form.password,
            license: licenseBase64
          })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess('¡Usuario registrado correctamente!');
        } else {
          setError(data.message || 'Error al registrar');
          if (data.message && data.message.includes('⏥')) setShowErrorModal(true);
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
      }
      setLoading(false);
    };

    if (rejected) {
      return (
        <div className="login-box">
          <h2>Permiso Requerido</h2>
          <p style={{color: '#e53e3e', fontWeight: 500, marginTop: 18, textAlign: 'center'}}>
            Para continuar es necesario aceptar el aviso de seguridad y el uso de tus datos.<br />
            No es posible realizar el trámite sin tu consentimiento.
          </p>
        </div>
      );
    }

    if (showLegal) {
      return (
        <LegalModal
          onAccept={() => setShowLegal(false)}
          onReject={() => setRejected(true)}
        />
      );
    }

    if (loggedIn) {
      return <LoginSuccessScreen onLogout={() => {
        setLoggedIn(false);
        setForm({ ...form, password: '' });
        setIsLogin(true);
        setSuccess('');
        setError('');
      }} />;
    }

    return (
      <div className="login-box" style={{maxWidth: 520, boxShadow: '0 8px 32px 0 rgba(60,72,88,0.13), 0 1.5px 4px 0 rgba(60,72,88,0.08)'}}>
        <h2 style={{textAlign:'center',marginBottom:10}}>
          {isLogin ? 'Iniciar Sesión' : 'Verificación de Identidad'}
        </h2>
        <p style={{color: '#374151', fontSize: '1.08rem', marginBottom: 18, textAlign: 'center', fontWeight: 500}}>
          {isLogin
            ? 'Ingresa tus credenciales para acceder a tu cuenta.'
            : 'Completa los siguientes datos para crear tu cuenta y verificar tu identidad. Es obligatorio subir una foto de tu licencia para validar tu información.'}
        </p>
        <form onSubmit={handleSubmit} style={{marginTop: 10}}>
          {!isLogin && (
            <>
              <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:18}}>
                <div style={{flex:1,minWidth:180}}>
                  <label style={{fontWeight:600,display:'block',marginBottom:4}}>Nombre completo</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} type="text" placeholder="Nombre(s) y apellidos" />
                </div>
                <div style={{flex:1,minWidth:120}}>
                  <label style={{fontWeight:600,display:'block',marginBottom:4}}>Fecha de nacimiento</label>
                  <input name="fecha" value={form.fecha} onChange={handleChange} type="date" />
                </div>
              </div>
              <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:18}}>
                <div style={{flex:1,minWidth:120}}>
                  <label style={{fontWeight:600,display:'block',marginBottom:4}}>Género</label>
                  <select name="genero" value={form.genero} onChange={handleChange} style={{width:'100%',padding:'10px',borderRadius:8,border:'1.5px solid #d1d5db',background:'#f8fafc'}}>
                    <option value="">Selecciona</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div style={{flex:1,minWidth:180}}>
                  <label style={{fontWeight:600,display:'block',marginBottom:4}}>Correo electrónico</label>
                  <input name="correo" value={form.correo} onChange={handleChange} type="email" placeholder="ejemplo@correo.com" />
                </div>
                <div style={{flex:1,minWidth:140}}>
                  <label style={{fontWeight:600,display:'block',marginBottom:4}}>Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} type="tel" placeholder="10 dígitos" pattern="[0-9]{10}" />
                </div>
              </div>
            </>
          )}
          {isLogin && (
            <div style={{marginBottom:18}}>
              <label style={{fontWeight:600,display:'block',marginBottom:4}}>Correo electrónico</label>
              <input name="correo" value={form.correo} onChange={handleChange} type="email" placeholder="ejemplo@correo.com" />
            </div>
          )}
          <div style={{marginBottom:18}}>
            <label style={{fontWeight:600,display:'block',marginBottom:4}}>Contraseña</label>
            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Contraseña" />
          </div>
          {!isLogin && (
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 18}}>
              {previewUrl && (
                <div style={{textAlign: 'center', minWidth: 0}}>
                  <span style={{fontSize: '0.98rem', color: '#64748b'}}>Previsualización:</span>
                  <div style={{marginTop: 8, display: 'flex', justifyContent: 'center'}}>
                    <img
                      src={previewUrl}
                      alt="Previsualización de la licencia"
                      style={{width: 260, height: 180, objectFit: 'cover', borderRadius: 10, boxShadow: '0 4px 16px #0002', border: '2px solid #2563eb'}} />
                  </div>
                </div>
              )}
              <div style={{flex: 1, minWidth: 0}}>
                <label style={{fontWeight:600,display:'block',marginBottom:4}}>Foto de tu licencia</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{marginBottom: 0, width: '100%'}}
                />
              </div>
            </div>
          )}
          <button type="submit" disabled={loading || (!isLogin && !file)} style={{marginTop:8,marginBottom:8}}>
            {loading ? 'Enviando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta y verificar identidad'}
          </button>
        </form>
        {showErrorModal
          ? <ErrorModal message={error} onClose={() => setShowErrorModal(false)} />
          : error && <div style={{marginTop: 12, color: '#e53e3e', fontWeight: 500, textAlign: 'center'}}>{error}</div>
        }
        {success && (
          <div style={{marginTop: 12, color: '#2563eb', fontWeight: 500, textAlign: 'center'}}>{success}</div>
        )}
        <button
          type="button"
          style={{
            marginTop: 18,
            background: 'linear-gradient(90deg, #64748b 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: '0 2px 8px #2563eb22',
            cursor: 'pointer',
            padding: '12px 0',
            width: '100%',
            transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
          }}
          onClick={() => setShowSecurityModal(true)}
        >
          Seguridad y uso de tus datos
        </button>
        <button
          type="button"
          style={{
            marginTop: 10,
            background: 'none',
            color: '#2563eb',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            width: '100%'
          }}
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}
        >
          {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
        {showSecurityModal && (
          <DataSecurityModal 
            onClose={() => setShowSecurityModal(false)} 
            onReject={() => { setShowSecurityModal(false); setRejected(true); }}
          />
        )}
      </div>
    );
  }

  export default IdentityVerificationForm;