import React from 'react';

function DataSecurityModal({ onClose, onReject }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Normativas de Seguridad de Datos en Trámites de Licencia de Conducir</h3>
        <p>
          Cuando solicitas una licencia de conducir, tus datos personales son protegidos bajo diversas normativas, principalmente:
        </p>
        <ul style={{marginBottom: 18, color: '#374151', fontSize: '1.05rem', lineHeight: 1.6}}>
          <li><b>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</b> (México)</li>
          <li><b>Reglamento General de Protección de Datos (GDPR)</b> (Unión Europea, si aplica)</li>
          <li><b>Leyes estatales y reglamentos locales</b> sobre protección de datos y privacidad</li>
        </ul>
        <p>
          <b>¿Por qué un sitio web puede pedirte una foto de tu licencia de conducir?</b>
        </p>
        <p style={{marginBottom: 10, color: '#374151', fontSize: '1.05rem', lineHeight: 1.6}}>
          Algunos sitios web solicitan una fotografía de tu licencia de conducir para validar tu identidad, comprobar que cuentas con un documento oficial vigente y prevenir fraudes. Esta práctica es común en trámites digitales, servicios de movilidad, alquiler de vehículos, aseguradoras y plataformas de verificación de identidad.
        </p>
        <p>
          <b>¿Qué datos pueden extraer de la foto de tu licencia?</b>
        </p>
        <ul style={{marginBottom: 10, color: '#374151', fontSize: '1.05rem', lineHeight: 1.6}}>
          <li>Nombre completo</li>
          <li>Fotografía personal</li>
          <li>Número de licencia</li>
          <li>Fecha de expedición y vigencia</li>
          <li>CURP o RFC (si aparece)</li>
          <li>Domicilio registrado</li>
          <li>Firma</li>
          <li>Entidad emisora</li>
        </ul>
        <p style={{marginBottom: 10}}>
          <b>¿Para qué se usan estos datos?</b>
        </p>
        <ul style={{marginBottom: 18, color: '#374151', fontSize: '1.05rem', lineHeight: 1.6}}>
          <li>Verificar que la licencia es auténtica y vigente.</li>
          <li>Corroborar que la persona que realiza el trámite es la titular del documento.</li>
          <li>Prevenir suplantación de identidad y fraudes.</li>
          <li>Cumplir con requisitos legales y de seguridad de la plataforma.</li>
          <li>En algunos casos, para validar la edad o el domicilio.</li>
        </ul>
        <p>
          Estos datos se utilizan exclusivamente para validar tu identidad, cumplir con los requisitos legales y garantizar la seguridad en el proceso. Las autoridades están obligadas a proteger tu información y no pueden compartirla sin tu consentimiento, salvo en los casos previstos por la ley.
        </p>
        <div style={{display: 'flex', gap: 10, marginTop: 18}}>
          <button onClick={onClose} style={{flex: 1}}>Aceptar</button>
          <button onClick={onReject} style={{flex: 1, background: '#e53e3e', color: '#fff'}}>Rechazar</button>
        </div>
      </div>
    </div>
  );
}

export default DataSecurityModal;
