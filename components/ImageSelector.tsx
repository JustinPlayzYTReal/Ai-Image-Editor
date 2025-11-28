import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { processFile } from '../utils/fileUtils';
import { ImageState } from '../types';

interface ImageSelectorProps {
  onImageSelected: (imageState: ImageState) => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    try {
      const { base64Data, mimeType, previewUrl } = await processFile(file);
      onImageSelected({
        file,
        base64Data,
        mimeType,
        previewUrl
      });
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process image');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 px-4">
      <div 
        className="relative group cursor-pointer"
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-300 blur"></div>
        <div className="relative flex flex-col items-center justify-center w-full h-80 bg-black border-2 border-dashed border-red-500 rounded-2xl group-hover:border-red-400 transition-colors duration-300">
          
          <div className="w-20 h-20 mb-4 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-red-500/20">
            <Upload className="w-10 h-10 text-red-500" />
          </div>
          
          <h3 className="text-xl font-semibold text-red-500 mb-2">Upload a photo to start</h3>
          <p className="text-red-500 text-center max-w-sm px-4">
            Drag and drop your image here, or click to browse.
            <br />
            <span className="text-xs text-red-700 mt-2 block">Supports PNG, JPG, WEBP</span>
          </p>

          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>