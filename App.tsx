import React, { useState } from 'react';
import { ImageSelector } from './components/ImageSelector';
import { ImageWorkspace } from './components/ImageWorkspace';
import { ImageState } from './types';

function App() {
  const [currentImage, setCurrentImage] = useState<ImageState | null>(null);

  const handleImageSelected = (imageState: ImageState) => {
    setCurrentImage(imageState);
  };

  const handleReset = () => {
    setCurrentImage(null);
  };

  return (
    <div className="min-h-screen bg-black text-red-500 flex flex-col font-sans selection:bg-red-500/30">
      
      <main className="flex-1 flex flex-col">
        {!currentImage ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-4xl mx-auto px-4">
               <ImageSelector onImageSelected={handleImageSelected} />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 flex-1">
             <ImageWorkspace 
               initialImage={currentImage} 
               onReset={handleReset} 
             />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;