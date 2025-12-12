import React, { useState } from 'react';
import Layout from './components/Layout';
import TicketForm from './components/TicketForm';
import TicketDisplay from './components/TicketDisplay';
import { generateTicketMetadata, generateTicketImage } from './services/geminiService';
import { TicketData } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [ticketImage, setTicketImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (input: string, ocrImage?: string, bgImage?: string) => {
    setLoading(true);
    setError(null);
    setTicketData(null);
    setTicketImage(undefined);

    try {
      // Step 1: Generate Metadata (sending text and OCR image for data extraction)
      // We pass the 'ocrImage' to Gemini so it can read the text, but this image is NOT used for the background.
      const data = await generateTicketMetadata(input, ocrImage);
      setTicketData(data);

      // Step 2: Handle Background Image
      if (bgImage) {
        // Use user-provided custom background art if they uploaded one
        setTicketImage(bgImage);
      } else if (data.aiPrompts?.backgroundPrompt) {
        // Otherwise, Generate AI background art based on the theme
        const image = await generateTicketImage(data.aiPrompts.backgroundPrompt);
        setTicketImage(image);
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong generating your ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (mood: string) => {
    if (!ticketData?.aiPrompts?.backgroundPrompt) return;
    
    setImageLoading(true);
    try {
      // Create a modified prompt emphasizing the selected mood
      const modifiedPrompt = `${ticketData.aiPrompts.backgroundPrompt}. The visual style should be heavily inspired by the mood: ${mood}. Make it distinct and artistic.`;
      
      const newImage = await generateTicketImage(modifiedPrompt);
      setTicketImage(newImage);
    } catch (err) {
      console.error("Failed to regenerate image for mood", err);
      // Optional: show a toast error
    } finally {
      setImageLoading(false);
    }
  };

  const handleReset = () => {
    setTicketData(null);
    setTicketImage(undefined);
    setError(null);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {error && (
          <div className="w-full max-w-lg mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-center">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        {!ticketData && (
          <TicketForm onSubmit={handleGenerate} isLoading={loading} />
        )}

        {loading && !ticketData && (
           <div className="mt-8 text-neutral-500 animate-pulse">
              Generating your premium design...
           </div>
        )}

        {ticketData && (
          <TicketDisplay 
            data={ticketData} 
            imageUrl={ticketImage} 
            onReset={handleReset}
            onMoodSelect={handleMoodSelect}
            isImageLoading={imageLoading}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;