

import React, { useState } from 'react';
import DataSecurityModal from './DataSecurityModal';

function LegalModal({ onAccept, onReject }) {
  const [showSecurity, setShowSecurity] = useState(false);

  if (showSecurity) {
    return (
      <DataSecurityModal
        onClose={onAccept}
        onReject={onReject}
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Aviso de Privacidad y Deslinde de Responsabilidad</h3>
        <p>
          Esta aplicación recopila datos personales con fines de identificación y validación de trámites relacionados con licencias de conducir. La información será tratada conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
        </p>
        <p>
          El uso de esta aplicación no garantiza la aprobación automática de trámites. El usuario es responsable de proporcionar información veraz. La autoridad correspondiente se reserva el derecho de validar, rechazar o solicitar documentación adicional.
        </p>
        <div style={{display: 'flex', gap: 10, marginTop: 18}}>
          <button onClick={onAccept} style={{flex: 1}}>Acepto</button>
          <button onClick={() => setShowSecurity(true)} style={{flex: 1, background: '#e53e3e', color: '#fff'}}>Rechazar</button>
        </div>
      </div>
    </div>
  );
}

export default LegalModal;