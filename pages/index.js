import React, { useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Trash2, Loader2, Sparkles, X, ScanText } from 'lucide-react';

export default function Home() {
  const webcamRef = useRef(null);
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Definimos el área de enfoque (proporciones tipo "Lens")
  const focusBox = { top: 35, left: 15, width: 70, height: 25 };

  const capture = useCallback(async () => {
    setIsProcessing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (imageSrc) {
      try {
        // Lógica de recorte en Canvas (mantenemos esta parte vital para la precisión)
        const image = new Image();
        image.src = imageSrc;
        await image.decode();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sX = (focusBox.left * image.width) / 100;
        const sY = (focusBox.top * image.height) / 100;
        const sW = (focusBox.width * image.width) / 100;
        const sH = (focusBox.height * image.height) / 100;
        canvas.width = sW; canvas.height = sH;
        ctx.drawImage(image, sX, sY, sW, sH, 0, 0, sW, sH);
        const croppedImage = canvas.toDataURL('image/jpeg');

        // Procesar solo el recorte
        const result = await Tesseract.recognize(croppedImage, 'spa+eng');
        const text = result.data.text.trim();
        
        if (text) {
          setData(prev => [{
            id: Date.now(),
            fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            detalle: text,
          }, ...prev]);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    setIsProcessing(false);
  }, [webcamRef, focusBox]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labels");
    XLSX.writeFile(wb, "capturas_estilo_lens.xlsx");
  };

  return (
    <>
      <Head>
        <title>OCR Lens Pro MVP</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
        
        {/* --- 1. Visor de Cámara Completo --- */}
        <div className="relative flex-grow overflow-hidden z-0">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* --- 2. Visor de Foco Estilo "Lens" --- */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            <div 
              className="absolute border-2 border-dashed border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-2xl"
              style={{
                top: `${focusBox.top}%`,
                left: `${focusBox.left}%`,
                width: `${focusBox.width}%`,
                height: `${focusBox.height}%`,
              }}
            >
              {/* Esquinas flotantes tipo Lens */}
              <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-md"></div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-md"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-md"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-md"></div>
              
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 backdrop-blur-sm">
                 <ScanText size={14} /> Alinea el texto
              </div>
            </div>
          </div>

          {/* Overlay de Carga */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
              <Loader2 className="animate-spin text-white mb-3" size={48} />
              <p className="font-medium text-lg">Analizando...</p>
            </div>
          )}
        </div>

        {/* --- 3. Barra de Controles Inferior --- */}
        <div className="relative z-20 bg-slate-950/90 border-t border-slate-800 p-4 pb-6 backdrop-blur-md flex flex-col gap-4">
          
          <div className="flex items-center justify-between gap-4">
            {/* Botón Historial (izquierda) */}
            <button 
              onClick={() => setShowHistory(true)} 
              className="relative p-3 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-300"
            >
              <Sparkles size={24} />
              {data.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {data.length}
                </span>
              )}
            </button>

            {/* Botón de Captura (centro, estilo nativo) */}
            <button 
              onClick={capture} 
              disabled={isProcessing}
              className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 p-1 hover:bg-slate-100 disabled:opacity-50 active:scale-90 transition-all shadow-xl"
            >
              <div className="w-full h-full rounded-full border-2 border-slate-900 bg-white flex items-center justify-center">
                 <span className="w-6 h-6 bg-slate-900 rounded-sm"></span>
              </div>
            </button>

            {/* Botón Excel (derecha) */}
            <button 
              onClick={exportExcel}
              disabled={data.length === 0}
              className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 active:scale-95 transition-all"
            >
              <FileSpreadsheet size={24} />
            </button>
          </div>
        </div>

        {/* --- 4. Panel de Historial (Slide-up, tipo Google Lens) --- */}
        {showHistory && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end flex-col p-4" onClick={() => setShowHistory(false)}>
            <div className="bg-slate-900 w-full max-w-md mx-auto rounded-t-3xl shadow-2xl p-6 h-3/4 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                  <Sparkles className="text-blue-400" /> Resultados ({data.length})
                </h2>
                <div className='flex gap-2'>
                  {data.length > 0 && <button onClick={() => { if(confirm("¿Borrar todo?")) setData([]) }} className="text-red-400 p-2 rounded-full bg-red-950/50"><Trash2 size={18} /></button>}
                  <button onClick={() => setShowHistory(false)} className="text-slate-400 p-2 rounded-full bg-slate-800"><X size={18} /></button>
                </div>
              </div>

              <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                {data.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                     <ScanText size={60} strokeWidth={1}/>
                     <p className="text-center font-medium">Usa la cámara para capturar texto<br/>Aparecerá aquí.</p>
                  </div>
                ) : (
                  data.map(item => (
                    <div key={item.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-inner group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-blue-400 font-mono text-xs px-2 py-0.5 bg-blue-950/50 rounded-full">{item.fecha}</span>
                      </div>
                      <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">{item.detalle}</p>
                    </div>
                  ))
                )}
              </div>
              
              {data.length > 0 && (
                 <button onClick={exportExcel} className="w-full bg-emerald-600 p-3 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500">
                    <FileSpreadsheet size={18} /> Descargar Excel
                 </button>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
