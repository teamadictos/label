import React, { useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';
import { Camera, FileSpreadsheet, Trash2, Loader2 } from 'lucide-react';

export default function Home() {
  const webcamRef = useRef(null);
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const capture = useCallback(async () => {
    setIsProcessing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (imageSrc) {
      try {
        const result = await Tesseract.recognize(imageSrc, 'spa+eng');
        const text = result.data.text.trim();
        
        if (text) {
          const newEntry = {
            id: Date.now(),
            fecha: new Date().toLocaleString(),
            detalle: text.replace(/\n/g, ' ').substring(0, 100),
            texto_completo: text
          };
          setData(prev => [newEntry, ...prev]);
        }
      } catch (error) {
        console.error("Error en OCR:", error);
        alert("No se pudo leer la etiqueta");
      }
    }
    setIsProcessing(false);
  }, [webcamRef]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Escaneos");
    XLSX.writeFile(wb, `Reporte_Etiquetas_${Date.now()}.xlsx`);
  };

  const clearData = () => {
    if(confirm("¿Borrar todos los registros?")) setData([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <Head>
        <title>Scanner Pro | Etiquetas</title>
      </Head>

      <header className="w-full max-w-md text-center my-6">
        <h1 className="text-3xl font-bold text-gray-800">Scanner Pro</h1>
        <p className="text-gray-500">Detecta texto y exporta a Excel</p>
      </header>

      <main className="w-full max-w-md space-y-6">
        {/* Contenedor Cámara */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-black aspect-square">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="w-full h-full object-cover"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
              <Loader2 className="animate-spin mr-2" /> Procesando...
            </div>
          )}
        </div>

        {/* Acciones principales */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={capture}
            disabled={isProcessing}
            className="flex items-center justify-center bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
          >
            <Camera className="mr-2" size={20} /> Escanear
          </button>
          
          <button
            onClick={exportExcel}
            disabled={data.length === 0}
            className="flex items-center justify-center bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 active:scale-95 transition-all shadow-lg"
          >
            <FileSpreadsheet className="mr-2" size={20} /> Excel
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-700">Registros ({data.length})</h2>
            {data.length > 0 && (
              <button onClick={clearData} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {data.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No hay datos escaneados aún</p>
            ) : (
              data.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-[10px] text-gray-400 font-mono uppercase">{item.fecha}</p>
                  <p className="text-sm text-gray-700 line-clamp-2 mt-1">{item.detalle}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
