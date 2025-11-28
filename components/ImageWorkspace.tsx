import React, { useState, useEffect } from 'react';
import { ImageState, EditorStatus, EditHistoryItem } from '../types';
import { generateEditedImage } from '../services/geminiService';
import { parseDataUrl } from '../utils/fileUtils';
import { Button } from './Button';
import { Download, RefreshCcw, X, Send, AlertCircle, Undo2, History } from 'lucide-react';

interface ImageWorkspaceProps {
  initialImage: ImageState;
  onReset: () => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({ initialImage, onReset }) => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<EditorStatus>(EditorStatus.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EditHistoryItem[]>([]);

  // Auto-focus input on mount
  useEffect(() => {
    const input = document.getElementById('prompt-input');
    if (input) input.focus();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Determine source image: use current result if available (for chaining edits), otherwise original
    let sourceBase64 = initialImage.base64Data;
    let sourceMime = initialImage.mimeType;

    if (resultImage) {
      const parsed = parseDataUrl(resultImage);
      if (parsed) {
        sourceBase64 = parsed.base64Data;
        sourceMime = parsed.mimeType;
      }
    }

    if (!sourceBase64 || !sourceMime) {
      setError("Unable to process source image.");
      return;
    }

    setStatus(EditorStatus.PROCESSING);
    setError(null);

    try {
      const generatedImageBase64 = await generateEditedImage(
        sourceBase64,
        sourceMime,
        prompt
      );
      
      // Add to history
      const newItem: EditHistoryItem = {
        id: Date.now().toString(),
        originalUrl: resultImage || initialImage.previewUrl || '',
        generatedUrl: generatedImageBase64,
        prompt: prompt,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newItem, ...prev]);
      setResultImage(generatedImageBase64);
      setStatus(EditorStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(EditorStatus.ERROR);
      setError(err.message || "Failed to generate image. Please try again.");
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `nanoedit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const restoreOriginal = () => {
    setResultImage(null);
    setPrompt('');
  };

  const restoreHistoryItem = (item: EditHistoryItem) => {
    setResultImage(item.generatedUrl);
    setPrompt(item.prompt);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      
      {/* Top Bar: Controls */}
      <div className="flex-none flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={onReset} leftIcon={<X className="w-4 h-4"/>} className="hidden sm:inline-flex">
          Close Editor
        </Button>
        <div className="sm:hidden">
          <Button variant="ghost" onClick={onReset} className="p-2">
            <X className="w-5 h-5"/>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {resultImage && (
             <Button variant="secondary" onClick={restoreOriginal} leftIcon={<Undo2 className="w-4 h-4"/>}>
               Reset to Original
             </Button>
          )}
          {status === EditorStatus.SUCCESS && (
             <Button variant="primary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4"/>}>
               Download
             </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 gap-4">
        
        {/* Middle: Image Display */}
        <div className="flex-1 relative w-full bg-black rounded-3xl overflow-hidden flex items-center justify-center min-h-0">
          
           {/* Checkerboard pattern for transparency */}
           <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
           }}></div>

          <div className="relative w-full h-full p-4 flex items-center justify-center">
            <img 
              src={resultImage || initialImage.previewUrl || ''} 
              alt="Workspace" 
              className="max-w-full max-h-full object-contain relative z-0 transition-all duration-500 border-2 border-red-500 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.5)]"
            />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-red-500 font-bold text-xs px-3 py-1 rounded-full border border-red-500/30">
            {resultImage ? 'Edited' : 'Original'}
          </div>

          {status === EditorStatus.PROCESSING && (
            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                </div>
              </div>
              <p className="mt-4 text-red-500 font-medium animate-pulse">Processing...</p>
            </div>
          )}

          {/* Hold to Compare Button */}
          {resultImage && status !== EditorStatus.PROCESSING && (
            <div className="absolute bottom-4 right-4 z-20">
               <button 
                  className="bg-black/60 hover:bg-black/80 text-red-500 px-4 py-2 rounded-full backdrop-blur text-sm font-medium border border-red-500/30 transition shadow-xl"
                  onMouseDown={() => {
                      const img = document.querySelector('img[alt="Workspace"]') as HTMLImageElement;
                      if (img) img.src = initialImage.previewUrl || '';
                  }}
                  onMouseUp={() => {
                      const img = document.querySelector('img[alt="Workspace"]') as HTMLImageElement;
                      if (img) img.src = resultImage || '';
                  }}
                  onMouseLeave={() => {
                     const img = document.querySelector('img[alt="Workspace"]') as HTMLImageElement;
                     if (img) img.src = resultImage || '';
                  }}
                  onTouchStart={() => {
                    const img = document.querySelector('img[alt="Workspace"]') as HTMLImageElement;
                    if (img) img.src = initialImage.previewUrl || '';
                  }}
                  onTouchEnd={() => {
                    const img = document.querySelector('img[alt="Workspace"]') as HTMLImageElement;
                    if (img) img.src = resultImage || '';
                  }}
               >
                 Hold to Compare Original
               </button>
            </div>
          )}
        </div>

        {/* History Strip */}
        {history.length > 0 && (
          <div className="flex-none h-24 bg-black border border-red-500 rounded-xl p-2 flex space-x-3 overflow-x-auto items-center">
              <div className="flex-shrink-0 flex items-center justify-center px-2 text-red-600">
                <History className="w-5 h-5" />
              </div>
              {/* Original Thumbnail */}
              <button
                onClick={restoreOriginal}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all group ${!resultImage ? 'border-red-500 ring-2 ring-red-500/20' : 'border-red-800 hover:border-red-500'}`}
              >
                 <img src={initialImage.previewUrl || ''} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Original" />
                 <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] text-red-500 text-center py-0.5 font-medium">Original</div>
              </button>

              {history.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => restoreHistoryItem(item)}
                   className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all group ${resultImage === item.generatedUrl ? 'border-red-500 ring-2 ring-red-500/20' : 'border-red-800 hover:border-red-500'}`}
                   title={item.prompt}
                 >
                   <img src={item.generatedUrl} className="w-full h-full object-cover" alt="Edit" />
                   <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] text-red-500 text-center py-0.5 truncate px-1 font-medium">{item.prompt}</div>
                 </button>
              ))}
          </div>
        )}

        {/* Bottom: Prompt Input Box */}
        <div className="flex-none bg-black border border-red-500 p-4 rounded-2xl shadow-lg relative">
           <label htmlFor="prompt-input" className="block text-sm font-medium text-red-500 mb-2">
             What would you like to change?
           </label>
           <div className="relative">
             <textarea
               id="prompt-input"
               className="w-full h-24 bg-black border border-red-500 rounded-xl p-4 pr-14 text-red-500 placeholder-red-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:ring-offset-0 resize-none transition-all"
               placeholder=""
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               disabled={status === EditorStatus.PROCESSING}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleGenerate();
                 }
               }}
             />
             <div className="absolute bottom-3 right-3">
               <Button 
                 disabled={!prompt.trim() || status === EditorStatus.PROCESSING}
                 onClick={handleGenerate}
                 className="!p-2 rounded-full shadow-lg shadow-red-500/20"
               >
                 {status === EditorStatus.PROCESSING ? <RefreshCcw className="w-4 h-4 animate-spin text-white"/> : <Send className="w-4 h-4 text-white" />}
               </Button>
             </div>
           </div>

           {error && (
             <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2 text-xs text-red-500 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};