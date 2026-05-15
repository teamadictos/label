import React, { useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';
import { Camera, FileSpreadsheet, Trash2, Loader2, Crop } from 'lucide-react';

export default function Home() {
  const webcamRef = useRef(null);
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado para el área de selección (en porcentaje de 0 a 100)
  const [box, setBox] = useState({ top: 30, left: 20, width: 60, height: 20 });

  const capture = useCallback(async () => {
    setIsProcessing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (imageSrc) {
      try {
        // Creamos un canvas temporal para recortar la imagen
        const image = new Image();
        image.src = imageSrc;
        await image.decode();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculamos las dimensiones reales basadas en el porcentaje del box
        const sX = (box.left * image.width) / 100;
        const sY = (box.top * image.height) / 100;
        const sW = (box.width * image.width) / 100;
        const sH = (box.height * image.height) / 100;

        canvas.width = sW;
        canvas.height = sH;
        ctx.drawImage(image, sX, sY, sW, sH, 0, 0, sW, sH);
        
        const croppedImage = canvas.toDataURL('image/jpeg');

        // Procesar solo el recorte
        const result = await Tesseract.recognize(croppedImage, 'spa+eng');
        const text = result.data.text.trim();
        
        if (text) {
          setData(prev => [{
            id: Date.now(),
            fecha: new Date().toLocaleTimeString(),
            detalle: text,
          }, ...prev]);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    setIsProcessing(false);
  }, [webcamRef, box]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4">
      <Head><title>OCR Lens Pro</title></Head>

      <header className="my-4 text-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crop className="text-blue-400" /> Label Selector
        </h1>
      </header>

      <main className="w-full max-w-md space-y-4">
        {/* Visor de Cámara con Selector */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-slate-700 bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="w-full h-full"
          />
          
          {/* Capa de Selección (El recuadro tipo Lens) */}
          <div 
            className="absolute border-2 border-blue-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-sm"
            style={{
              top: `${box.top}%`,
              left: `${box.left}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
              transition: 'all 0.2s ease'
            }}
          >
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-blue-400"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-blue-400"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-blue-400"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-blue-400"></div>
          </div>

          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
              <Loader2 className="animate-spin text-blue-400" size={40} />
            </div>
          )}
        </div>

        {/* Controles de ajuste de área (Simple) */}
        <div className="bg-slate-800 p-3 rounded-xl flex flex-col gap-2">
           <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">Ajustar Área de Escaneo</p>
           <input 
            type="range" min="10" max="90" value={box.width} 
            onChange={(e) => setBox({...box, width: parseInt(e.target.value)})}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
           />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={capture} className="bg-blue-500 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all">
            <Camera size={20} /> Capturar
          </button>
          <button 
            onClick={() => {
              const ws = XLSX.utils.json_to_sheet(data);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Data");
              XLSX.writeFile(wb, "labels.xlsx");
            }}
            className="bg-emerald-500 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all"
          >
            <FileSpreadsheet size={20} /> Excel
          </button>
        </div>

        {/* Lista de resultados */}
        <div className="bg-slate-800 rounded-2xl p-4 max-h-60 overflow-y-auto border border-slate-700">
           {data.length === 0 ? (
             <p className="text-slate-500 text-center py-4">Alinea la etiqueta en el cuadro azul</p>
           ) : (
             data.map(item => (
               <div key={item.id} className="mb-2 p-2 bg-slate-900 rounded border-l-2 border-blue-400 text-sm">
                 <span className="text-blue-400 font-mono text-[10px]">{item.fecha}</span>
                 <p className="truncate text-slate-200">{item.detalle}</p>
               </div>
             ))
           )}
        </div>
      </main>
    </div>
  );
}
