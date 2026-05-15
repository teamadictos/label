import React, { useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';

export default function Home() {
  const webcamRef = useRef(null);
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const focusBox = { top: 30, left: 10, width: 80, height: 30 };

  // 1. Importaciones (Arriba de todo)
import React, { useRef, useState, useCallback } from 'react';
// ... otras importaciones

export default function Home() {
  // 2. Definición de Estados y Refs
  const webcamRef = useRef(null);
  const [data, setData] = useState([]);
  // ...

  // ******************************************
  // AQUÍ ES DONDE SUSTITUYES LA FUNCIÓN:
  // ******************************************
  const capture = useCallback(async () => {
    // ... pega aquí el nuevo código con los alerts ...
  }, [webcamRef, isProcessing]); 
  // ******************************************

  // 3. El resto del código y el "return" (lo que se ve en pantalla)
  return (
    <div style={{ ... }}>
      {/* ... contenido de la app ... */}
    </div>
  );
}

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <Head>
        <title>OCR Lens</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </Head>

      {/* Visor de Cámara */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Marco de Enfoque (Google Lens Style) */}
      <div style={{ 
        position: 'absolute', 
        top: `${focusBox.top}%`, left: `${focusBox.left}%`, width: `${focusBox.width}%`, height: `${focusBox.height}%`,
        border: '2px solid rgba(255,255,255,0.3)', borderRadius: '16px', zIndex: 10,
        boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)'
      }}>
        {/* Esquinas blancas */}
        <div style={{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTop: '4px solid #fff', borderLeft: '4px solid #fff', borderTopLeftRadius: '12px' }} />
        <div style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTop: '4px solid #fff', borderRight: '4px solid #fff', borderTopRightRadius: '12px' }} />
        <div style={{ position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottom: '4px solid #fff', borderLeft: '4px solid #fff', borderBottomLeftRadius: '12px' }} />
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottom: '4px solid #fff', borderRight: '4px solid #fff', borderBottomRightRadius: '12px' }} />
      </div>

      {/* Botón de Disparo Inferior */}
      <div style={{ position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20, gap: '30px' }}>
        <button onClick={() => setShowHistory(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '15px', color: '#fff' }}>📋</button>
        
        <button 
          onClick={capture}
          disabled={isProcessing}
          style={{ width: '80px', height: '80px', backgroundColor: '#fff', borderRadius: '50%', border: '5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          {isProcessing ? '...' : ''}
        </button>

        <button 
          onClick={() => {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Labels");
            XLSX.writeFile(wb, "escaneo.xlsx");
          }} 
          style={{ background: '#10b981', border: 'none', borderRadius: '50%', padding: '15px', color: '#fff' }}
        >📊</button>
      </div>

      {/* Panel de Resultados (Slide Up) */}
      {showHistory && (
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '50%', backgroundColor: '#111', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', zIndex: 30, padding: '20px', overflowY: 'auto', borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Resultados ({data.length})</h3>
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '20px' }}>✕</button>
          </div>
          {data.map(item => (
            <div key={item.id} style={{ background: '#222', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px', borderLeft: '4px solid #3b82f6' }}>
              <small style={{ color: '#666' }}>{item.fecha}</small>
              <p style={{ margin: '5px 0 0 0' }}>{item.detalle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
