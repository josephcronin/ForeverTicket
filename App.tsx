import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TicketForm from './components/TicketForm';
import TicketDisplay from './components/TicketDisplay';
import Gallery from './components/Gallery';
import { generateTicketMetadata, generateTicketImage } from './services/geminiService';
import { saveTicketToDb, getTicketFromDb } from './services/ticketService';
import { TicketData } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [ticketImage, setTicketImage] = useState<string | undefined>(undefined);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [currentView, setCurrentView] = useState<'editor' | 'gallery'>('editor');

  // Helper to safely update URL without crashing in sandboxed/blob environments
  const updateUrl = (id?: string | null) => {
    try {
      const newUrl = id 
        ? `${window.location.pathname}?id=${id}`
        : window.location.pathname;
      
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (e) {
      console.warn("Navigation update failed (likely due to environment restrictions):", e);
    }
  };

  // 1. Check URL for Ticket ID on Load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        loadTicket(id);
    }
  }, []);

  const loadTicket = async (id: string) => {
    setLoading(true);
    setCurrentView('editor');
    try {
        const result = await getTicketFromDb(id);
        if (result) {
            setTicketData(result.ticketData);
            setTicketImage(result.imageUrl);
            setTicketId(id);
        } else {
            setError("Ticket not found. It may have been deleted.");
        }
    } catch (err) {
        setError("Could not load the ticket.");
    } finally {
        setLoading(false);
    }
  };

  const handleGenerate = async (input: string, ocrImage?: string, bgImage?: string) => {
    setLoading(true);
    setError(null);
    setTicketData(null);
    setTicketImage(undefined);
    setTicketId(null);
    setIsEditing(false);

    try {
      // Step 1: Generate Metadata
      const data = await generateTicketMetadata(input, ocrImage);
      setTicketData(data);

      let finalImage = "";

      // Step 2: Handle Background Image
      if (bgImage) {
        finalImage = bgImage;
        setTicketImage(bgImage);
        setIsCustomImage(true);
      } else if (data.aiPrompts?.backgroundPrompt) {
        finalImage = await generateTicketImage(data.aiPrompts.backgroundPrompt);
        setTicketImage(finalImage);
        setIsCustomImage(false);
      }

      // Step 3: Save to Supabase automatically
      if (data && finalImage) {
         const newId = await saveTicketToDb(data, finalImage);
         if (newId) {
             setTicketId(newId);
             updateUrl(newId);
         }
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong generating your ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = async (file: File): Promise<TicketData['eventDetails'] | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const data = await generateTicketMetadata("", base64);
          resolve(data.eventDetails);
        } catch (err) {
          console.error("Autofill error:", err);
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMoodSelect = async (mood: string) => {
    if (!ticketData?.aiPrompts?.backgroundPrompt) return;
    
    setImageLoading(true);
    try {
      const modifiedPrompt = `${ticketData.aiPrompts.backgroundPrompt}. The visual style should be heavily inspired by the mood: ${mood}. Make it distinct and artistic.`;
      
      const newImage = await generateTicketImage(modifiedPrompt);
      setTicketImage(newImage);
      setIsCustomImage(false);
      
      // Update DB with new image if we have an ID
      if (ticketId && ticketData) {
         const newId = await saveTicketToDb(ticketData, newImage);
         if (newId) {
             setTicketId(newId);
             updateUrl(newId);
         }
      }

    } catch (err) {
      console.error("Failed to regenerate image for mood", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleReset = () => {
    setTicketData(null);
    setTicketImage(undefined);
    setTicketId(null);
    setError(null);
    setIsEditing(false);
    setIsCustomImage(false);
    updateUrl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleGallerySelect = (id: string, data: TicketData, img: string) => {
     setTicketData(data);
     setTicketImage(img);
     setTicketId(id);
     setCurrentView('editor');
     updateUrl(id);
     window.scrollTo(0, 0);
  };

  const handleNavigate = (view: 'editor' | 'gallery') => {
     setCurrentView(view);
     if (view === 'editor' && !ticketData) {
        updateUrl(null);
     }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        
        {currentView === 'gallery' ? (
           <Gallery onSelect={handleGallerySelect} />
        ) : (
          <>
            {error && (
              <div className="w-full max-w-lg mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-center animate-fade-in-up">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                {error}
                <button onClick={handleReset} className="block mx-auto mt-2 text-sm underline hover:text-white">Try Again</button>
              </div>
            )}

            {/* Show Form if no data OR if we are editing */}
            {(!ticketData || isEditing) && (
              <TicketForm 
                onSubmit={handleGenerate} 
                onAutoFill={handleAutoFill}
                isLoading={loading} 
                initialValues={isEditing ? ticketData?.eventDetails : undefined}
                initialBgImage={isEditing && isCustomImage ? ticketImage : undefined}
              />
            )}

            {loading && !ticketData && (
              <div className="mt-8 text-neutral-500 animate-pulse flex flex-col items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-[#FF4FA3] text-2xl"></i>
                  <span className="font-['Playfair_Display'] italic">Weaving your digital keepsake...</span>
              </div>
            )}

            {/* Show Display ONLY if we have data AND we are NOT editing */}
            {ticketData && !isEditing && (
              <TicketDisplay 
                data={ticketData} 
                imageUrl={ticketImage} 
                ticketId={ticketId}
                onReset={handleReset}
                onEdit={handleEdit}
                onMoodSelect={handleMoodSelect}
                isImageLoading={imageLoading}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default App;
