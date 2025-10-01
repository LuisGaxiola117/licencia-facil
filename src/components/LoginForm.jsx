import React, { useState } from 'react';
import DataSecurityModal from './DataSecurityModal';




function LicenseUploadForm() {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [rejected, setRejected] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Aquí iría la lógica real de subida
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

  return (
    <div className="login-box">
      <h2>Sube tu Licencia de Conducir</h2>
      <p style={{color: '#374151', fontSize: '1.05rem', marginBottom: 18, textAlign: 'left'}}>
        Para validar tu identidad y protegerte contra fraudes, te pedimos subir una fotografía clara de tu licencia de conducir. <b>Solo se utilizarán los siguientes datos:</b>
      </p>
      <ul style={{color: '#374151', fontSize: '1.01rem', marginBottom: 18, textAlign: 'left', paddingLeft: 18}}>
        <li>Nombre completo</li>
        <li>Fotografía personal</li>
        <li>Número de licencia</li>
        <li>Fecha de expedición y vigencia</li>
        <li>CURP o RFC (si aparece)</li>
        <li>Entidad emisora</li>
      </ul>
      <p style={{color: '#64748b', fontSize: '0.98rem', marginBottom: 18, textAlign: 'left'}}>
        Estos datos se usan únicamente para verificar que tu documento es auténtico y vigente, y nunca serán compartidos con terceros sin tu consentimiento. Puedes consultar más detalles en el aviso de seguridad.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 18}}>
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
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              required
              style={{marginBottom: 0, width: '100%'}}
            />
          </div>
        </div>
        <button type="submit" disabled={!file}>
          Subir licencia
        </button>
      </form>
      {submitted && (
        <div style={{marginTop: 16, color: '#2563eb', fontWeight: 500, textAlign: 'center'}}>
          ¡Licencia enviada correctamente para validación!
        </div>
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
      {showSecurityModal && (
        <DataSecurityModal 
          onClose={() => setShowSecurityModal(false)} 
          onReject={() => { setShowSecurityModal(false); setRejected(true); }}
        />
      )}
    </div>
  );
}

export default LicenseUploadForm;