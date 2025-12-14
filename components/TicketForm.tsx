import React, { useState, useRef, useEffect } from 'react';
import { TicketData } from '../types';

interface TicketFormProps {
  onSubmit: (text: string, ocrImage?: string, bgImage?: string) => void;
  onAutoFill: (file: File) => Promise<TicketData['eventDetails'] | null>;
  isLoading: boolean;
  initialValues?: TicketData['eventDetails'];
  initialBgImage?: string;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, onAutoFill, isLoading, initialValues, initialBgImage }) => {
  // Structured Inputs
  const [eventName, setEventName] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [seatInfo, setSeatInfo] = useState('');
  const [message, setMessage] = useState('');
  
  // State for OCR Image (Data Extraction only)
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for Custom Background (Visual only)
  const [bgImage, setBgImage] = useState<string | null>(initialBgImage || null);

  const ocrInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Effect to populate form when editing
  useEffect(() => {
    if (initialValues) {
      setEventName(initialValues.artistOrEvent || '');
      setVenue(initialValues.venue || '');
      setDate(initialValues.date || '');
      setSeatInfo(initialValues.seatInfo || '');
      setMessage(initialValues.personalMessage || '');
    }
    if (initialBgImage) {
      setBgImage(initialBgImage);
    }
  }, [initialValues, initialBgImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventName.trim() || ocrImage) {
      // Construct a structured prompt from the individual fields
      const fullPrompt = `
        Event/Artist: ${eventName}
        Venue: ${venue}
        Date: ${date}
        Seat/Section: ${seatInfo}
        ${message ? `Personal Message to display on ticket: "${message}"` : ''}
      `.trim();

      onSubmit(fullPrompt, ocrImage || undefined, bgImage || undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  // Handle OCR Image Selection & Autofill
  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setOcrImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 2. Trigger AI Analysis
      setIsAnalyzing(true);
      try {
         const details = await onAutoFill(file);
         if (details) {
            // Fill fields if they were found
            if (details.artistOrEvent) setEventName(details.artistOrEvent);
            if (details.venue) setVenue(details.venue);
            if (details.date) setDate(details.date);
            if (details.seatInfo) setSeatInfo(details.seatInfo);
         }
      } catch (err) {
         console.error("Failed to autofill", err);
      } finally {
         setIsAnalyzing(false);
      }
    }
  };

  // Handle Background Image Selection
  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isSubmitDisabled = isLoading || isAnalyzing || (!eventName.trim() && !ocrImage);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up font-['Nunito']">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold mb-4 bg-gradient-to-r from-[#FF4FA3] via-[#C9A2FF] to-[#5AA6FF] bg-clip-text text-transparent leading-tight pb-2 drop-shadow-sm">
          {initialValues ? 'Refine your details.' : 'Turn digital tickets into something beautiful.'}
        </h2>
        <p className="text-lg md:text-xl text-neutral-300 max-w-xl mx-auto font-light leading-relaxed">
          {initialValues ? 'Update the info below to regenerate your keepsake.' : (
            <>
              PrettyTickets transforms boring QR codes into stunning, giftable keepsakes. <span className="text-[#C9A2FF] italic">Your ticket deserves to be pretty.</span>
            </>
          )}
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4FA3] via-[#C9A2FF] to-[#5AA6FF] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-500"></div>
        <form 
          onSubmit={handleSubmit} 
          className="relative bg-[#0F0F25]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
        >
          <div className="space-y-8">
            
            {/* --- SECTION 1: GUIDED DETAILS (PINK THEME) --- */}
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#FF4FA3]/10 flex items-center justify-center text-[#FF4FA3] shadow-[0_0_10px_rgba(255,79,163,0.2)]">
                     <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                   </div>
                   The Magic Details
                </h3>
                
                {/* OCR Toggle / Upload */}
                <div className="flex items-center gap-2">
                   <input 
                      type="file" 
                      ref={ocrInputRef} 
                      accept="image/*" 
                      onChange={handleOcrFileChange} 
                      className="hidden" 
                   />
                   <button
                      type="button"
                      onClick={() => ocrInputRef.current?.click()}
                      disabled={isLoading || isAnalyzing}
                      className={`text-xs flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-semibold ${
                         isAnalyzing 
                         ? 'border-[#FF4FA3] bg-[#FF4FA3]/10 text-[#FF4FA3]' 
                         : 'border-neutral-700 bg-white/5 text-neutral-300 hover:text-white hover:border-[#FF4FA3]/50 hover:bg-[#FF4FA3]/10'
                      }`}
                   >
                      {isAnalyzing ? (
                        <>
                           <i className="fa-solid fa-circle-notch fa-spin"></i>
                           Scanning...
                        </>
                      ) : (
                        <>
                           <i className="fa-solid fa-camera"></i>
                           {ocrImage ? 'Retake Scan' : 'Scan Screenshot?'}
                        </>
                      )}
                   </button>
                   {ocrImage && !isAnalyzing && (
                     <span className="text-xs text-[#5AA6FF] animate-pulse" title="Image loaded"><i className="fa-solid fa-circle-check"></i></span>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Event Name */}
                <div className="md:col-span-2">
                  <label htmlFor="eventName" className="block text-xs font-bold text-[#FF4FA3] mb-2 uppercase tracking-wide">Artist / Event</label>
                  <input
                    id="eventName"
                    type="text"
                    className="w-full bg-[#1A1A35] border border-white/5 rounded-2xl p-4 text-neutral-100 focus:ring-2 focus:ring-[#FF4FA3] focus:border-transparent outline-none transition-all placeholder-white/20 hover:bg-[#1F1F3F] disabled:opacity-50"
                    placeholder="e.g. Taylor Swift | The Eras Tour"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || isAnalyzing}
                  />
                  {isAnalyzing && <div className="h-1 w-full bg-[#FF4FA3]/20 mt-1 rounded-full overflow-hidden"><div className="h-full bg-[#FF4FA3] w-1/3 animate-[shimmer_1s_infinite_linear] rounded-full"></div></div>}
                </div>

                {/* Venue */}
                <div>
                  <label htmlFor="venue" className="block text-xs font-bold text-[#FF4FA3] mb-2 uppercase tracking-wide">Venue</label>
                  <input
                    id="venue"
                    type="text"
                    className="w-full bg-[#1A1A35] border border-white/5 rounded-2xl p-4 text-neutral-100 focus:ring-2 focus:ring-[#FF4FA3] focus:border-transparent outline-none transition-all placeholder-white/20 hover:bg-[#1F1F3F] disabled:opacity-50"
                    placeholder="e.g. Wembley Stadium"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || isAnalyzing}
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-xs font-bold text-[#FF4FA3] mb-2 uppercase tracking-wide">Date</label>
                  <input
                    id="date"
                    type="text"
                    className="w-full bg-[#1A1A35] border border-white/5 rounded-2xl p-4 text-neutral-100 focus:ring-2 focus:ring-[#FF4FA3] focus:border-transparent outline-none transition-all placeholder-white/20 hover:bg-[#1F1F3F] disabled:opacity-50"
                    placeholder="e.g. July 4th 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || isAnalyzing}
                  />
                </div>

                {/* Seat Info */}
                <div className="md:col-span-2">
                  <label htmlFor="seat" className="block text-xs font-bold text-[#FF4FA3] mb-2 uppercase tracking-wide">Seat Info <span className="text-neutral-500 font-normal lowercase">(optional)</span></label>
                  <input
                    id="seat"
                    type="text"
                    className="w-full bg-[#1A1A35] border border-white/5 rounded-2xl p-4 text-neutral-100 focus:ring-2 focus:ring-[#FF4FA3] focus:border-transparent outline-none transition-all placeholder-white/20 hover:bg-[#1F1F3F] disabled:opacity-50"
                    placeholder="e.g. Section 110, Row B, Seat 14"
                    value={seatInfo}
                    onChange={(e) => setSeatInfo(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || isAnalyzing}
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: PERSONAL MESSAGE (LAVENDER THEME) --- */}
            <div>
              <label htmlFor="personal-message" className="block text-xs font-bold text-[#C9A2FF] mb-2 uppercase tracking-wide flex items-center gap-2">
                 <i className="fa-solid fa-heart text-xs"></i>
                Add a Heartfelt Note
              </label>
              <input
                id="personal-message"
                type="text"
                maxLength={60}
                className="w-full bg-[#1A1A35] border border-white/5 rounded-2xl p-4 text-neutral-100 focus:ring-2 focus:ring-[#C9A2FF] focus:border-transparent outline-none transition-all placeholder-white/20 hover:bg-[#1F1F3F] disabled:opacity-50"
                placeholder="e.g. Happy 21st Birthday, bestie!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
            </div>

            {/* --- SECTION 3: VISUAL STYLE (BLUE THEME) --- */}
            <div className="pt-10 border-t border-white/5">
               <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5AA6FF]/10 text-[#5AA6FF] text-[10px] font-bold uppercase tracking-widest mb-3 border border-[#5AA6FF]/20">
                     <i className="fa-solid fa-paintbrush"></i>
                     Visual Vibe
                  </div>
                  <h3 className="text-xl md:text-2xl text-white font-['Playfair_Display'] font-bold">
                     Choose AI Background or Custom Background
                  </h3>
               </div>
               
               <input 
                  type="file" 
                  ref={bgInputRef} 
                  accept="image/*" 
                  onChange={handleBgFileChange} 
                  className="hidden" 
               />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: AI Magic (Default) */}
                  <button
                    type="button"
                    onClick={() => {
                        setBgImage(null);
                        if (bgInputRef.current) bgInputRef.current.value = '';
                    }}
                    className={`relative p-5 rounded-2xl border transition-all text-left flex flex-col gap-3 h-full ${
                        !bgImage 
                        ? 'bg-[#5AA6FF]/10 border-[#5AA6FF] shadow-[0_0_15px_rgba(90,166,255,0.15)]' 
                        : 'bg-[#1A1A35]/50 border-white/5 hover:bg-[#1A1A35] text-neutral-400'
                    }`}
                  >
                     <div className="flex justify-between items-start w-full">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${!bgImage ? 'bg-[#5AA6FF] text-white shadow-lg' : 'bg-white/5 text-neutral-500'}`}>
                           <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        {!bgImage && <i className="fa-solid fa-circle-check text-[#5AA6FF] text-xl"></i>}
                     </div>
                     <div>
                        <h4 className={`font-bold text-base mb-1 ${!bgImage ? 'text-white' : 'text-neutral-300'}`}>Create AI Background</h4>
                        <p className="text-sm text-neutral-500 leading-relaxed">Let our AI generate unique art based on the event vibe.</p>
                     </div>
                  </button>

                  {/* Option 2: Upload Custom Art */}
                  <button
                    type="button"
                    onClick={() => bgInputRef.current?.click()}
                    className={`relative p-5 rounded-2xl border transition-all text-left flex flex-col gap-3 h-full overflow-hidden group ${
                        bgImage 
                        ? 'bg-[#1A1A35] border-[#C9A2FF] shadow-[0_0_15px_rgba(201,162,255,0.15)]' 
                        : 'bg-[#1A1A35]/50 border-white/5 hover:bg-[#1A1A35] text-neutral-400'
                    }`}
                  >
                     {bgImage ? (
                        <>
                           <img src={bgImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-30 transition-opacity" />
                           <div className="relative z-10 flex justify-between items-start w-full">
                              <div className="w-10 h-10 rounded-full bg-[#C9A2FF] text-white flex items-center justify-center text-lg shadow-lg">
                                 <i className="fa-solid fa-image"></i>
                              </div>
                              <i className="fa-solid fa-circle-check text-[#C9A2FF] text-xl"></i>
                           </div>
                           <div className="relative z-10 mt-auto">
                              <h4 className="font-bold text-base text-white mb-1">Custom Art Uploaded</h4>
                              <p className="text-sm text-neutral-300">Click to change image</p>
                           </div>
                        </>
                     ) : (
                        <>
                           <div className="flex justify-between items-start w-full">
                              <div className="w-10 h-10 rounded-full bg-white/5 text-neutral-500 flex items-center justify-center text-lg">
                                 <i className="fa-solid fa-cloud-arrow-up"></i>
                              </div>
                           </div>
                           <div>
                              <h4 className="font-bold text-base text-neutral-300 mb-1">Upload Custom Art</h4>
                              <p className="text-sm text-neutral-500 leading-relaxed">Use your own photo or artwork for the background.</p>
                           </div>
                        </>
                     )}
                  </button>
               </div>
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-5 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group shadow-lg ${
                  isSubmitDisabled
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FF4FA3] via-[#C9A2FF] to-[#5AA6FF] hover:brightness-110 text-white shadow-[0_0_25px_rgba(255,79,163,0.4)] hover:shadow-[0_0_40px_rgba(90,166,255,0.5)] border border-white/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span className="font-['Playfair_Display'] italic">Weaving some magic...</span>
                  </>
                ) : isAnalyzing ? (
                   <>
                     <i className="fa-solid fa-wand-sparkles fa-bounce"></i>
                     <span className="tracking-wide">Analyzing your ticket...</span>
                   </>
                ) : (
                  <>
                    <i className="fa-solid fa-star group-hover:rotate-180 transition-transform duration-500"></i>
                    <span className="tracking-wide">
                      {initialValues ? 'Regenerate Keepsake' : 'Create My Keepsake'}
                    </span>
                    <i className="fa-solid fa-star group-hover:rotate-180 transition-transform duration-500"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Value Props - Hide in Edit Mode to reduce clutter */}
      {!initialValues && (
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-neutral-500 font-['Nunito']">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#FF4FA3]/30 hover:bg-[#FF4FA3]/5 transition-all group cursor-default">
            <i className="fa-solid fa-gift mb-3 text-[#FF4FA3] text-2xl drop-shadow-sm group-hover:scale-110 transition-transform"></i>
            <h4 className="text-white font-bold text-base mb-1">Gift-Worthy</h4>
            <p className="text-neutral-400">Make tickets feel like a real present.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#C9A2FF]/30 hover:bg-[#C9A2FF]/5 transition-all group cursor-default">
            <i className="fa-solid fa-wand-sparkles mb-3 text-[#C9A2FF] text-2xl drop-shadow-sm group-hover:scale-110 transition-transform"></i>
            <h4 className="text-white font-bold text-base mb-1">AI Magic</h4>
            <p className="text-neutral-400">Unique art for every single event.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#5AA6FF]/30 hover:bg-[#5AA6FF]/5 transition-all group cursor-default">
            <i className="fa-solid fa-print mb-3 text-[#5AA6FF] text-2xl drop-shadow-sm group-hover:scale-110 transition-transform"></i>
            <h4 className="text-white font-bold text-base mb-1">Print & Frame</h4>
            <p className="text-neutral-400">High-res designs ready for keepsakes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketForm;