import React, { useState, useRef } from 'react';

interface TicketFormProps {
  onSubmit: (text: string, ocrImage?: string, bgImage?: string) => void;
  isLoading: boolean;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, isLoading }) => {
  // Structured Inputs
  const [eventName, setEventName] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [seatInfo, setSeatInfo] = useState('');
  const [message, setMessage] = useState('');
  
  // State for OCR Image (Data Extraction only)
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  
  // State for Custom Background (Visual only)
  const [bgImage, setBgImage] = useState<string | null>(null);

  const ocrInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

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

  // Handle OCR Image Selection
  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOcrImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const isSubmitDisabled = isLoading || (!eventName.trim() && !ocrImage);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Immortalize the Moment
        </h2>
        <p className="text-lg text-neutral-400">
          Turn your digital ticket details into a physical masterpiece.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <form 
          onSubmit={handleSubmit} 
          className="relative bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-xl p-6 md:p-8 shadow-2xl"
        >
          <div className="space-y-6">
            
            {/* --- SECTION 1: GUIDED DETAILS --- */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Ticket Details</h3>
                
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
                      disabled={isLoading}
                      className="text-xs flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                   >
                      <i className="fa-solid fa-camera"></i>
                      {ocrImage ? 'Replace Scan' : 'Auto-fill from Screenshot?'}
                   </button>
                   {ocrImage && (
                     <span className="text-xs text-green-400"><i className="fa-solid fa-check"></i> Attached</span>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Name */}
                <div className="md:col-span-2">
                  <label htmlFor="eventName" className="block text-xs font-medium text-neutral-500 mb-1">Artist / Event Name</label>
                  <input
                    id="eventName"
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-neutral-700"
                    placeholder="e.g. Taylor Swift | The Eras Tour"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                </div>

                {/* Venue */}
                <div>
                  <label htmlFor="venue" className="block text-xs font-medium text-neutral-500 mb-1">Venue / Location</label>
                  <input
                    id="venue"
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-neutral-700"
                    placeholder="e.g. Wembley Stadium"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-xs font-medium text-neutral-500 mb-1">Date & Time</label>
                  <input
                    id="date"
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-neutral-700"
                    placeholder="e.g. July 4th 2026, 7:00 PM"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                </div>

                {/* Seat Info */}
                <div className="md:col-span-2">
                  <label htmlFor="seat" className="block text-xs font-medium text-neutral-500 mb-1">Seat Details <span className="text-neutral-700">(Section, Row, Seat)</span></label>
                  <input
                    id="seat"
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-neutral-700"
                    placeholder="e.g. Section 110, Row B, Seat 14"
                    value={seatInfo}
                    onChange={(e) => setSeatInfo(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: PERSONAL MESSAGE --- */}
            <div>
              <label htmlFor="personal-message" className="block text-xs font-medium text-neutral-500 mb-1">
                Personal Message <span className="text-neutral-700">(Optional)</span>
              </label>
              <input
                id="personal-message"
                type="text"
                maxLength={60}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-neutral-700"
                placeholder="e.g. Happy 12th Birthday Hazel!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
            </div>

            {/* --- SECTION 3: CUSTOM BACKGROUND (OPTIONAL) --- */}
            <div className="pt-2 border-t border-neutral-800/50">
               <label className="block text-xs font-medium text-neutral-500 mb-2 mt-4">
                  Visual Style
               </label>
               
               <div className="flex items-start gap-4">
                  <input 
                      type="file" 
                      ref={bgInputRef} 
                      accept="image/*" 
                      onChange={handleBgFileChange} 
                      className="hidden" 
                   />
                   
                   {!bgImage ? (
                      <button
                        type="button"
                        onClick={() => bgInputRef.current?.click()}
                        disabled={isLoading}
                        className="w-full border border-dashed border-neutral-700 rounded-lg p-3 hover:border-neutral-500 hover:bg-neutral-800/50 transition-colors text-neutral-400 text-sm flex items-center justify-center gap-3"
                      >
                         <i className="fa-solid fa-wand-magic-sparkles text-purple-400"></i>
                         <span>AI Generated Art</span>
                         <span className="text-neutral-600 text-xs">or click to upload your own</span>
                      </button>
                   ) : (
                      <div className="relative group w-full h-16 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 flex items-center">
                         <img src={bgImage} alt="Custom Background" className="w-16 h-16 object-cover" />
                         <div className="flex-1 px-4 text-sm text-white">Custom Background Uploaded</div>
                         <button
                            type="button"
                            onClick={() => {
                               setBgImage(null);
                               if (bgInputRef.current) bgInputRef.current.value = '';
                            }}
                            className="mr-4 text-neutral-400 hover:text-white"
                         >
                            <i className="fa-solid fa-times"></i>
                         </button>
                      </div>
                   )}
               </div>
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  isSubmitDisabled
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Designing Ticket...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-ticket"></i>
                    <span>Generate Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Footer Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-neutral-500">
        <div className="p-4 rounded-lg bg-neutral-900/30 border border-neutral-800/50">
           <i className="fa-solid fa-keyboard mb-2 text-purple-400 text-lg"></i>
           <p>Guided Input</p>
        </div>
        <div className="p-4 rounded-lg bg-neutral-900/30 border border-neutral-800/50">
           <i className="fa-solid fa-face-smile-beam mb-2 text-pink-400 text-lg"></i>
           <p>Face-Optimized AI Art</p>
        </div>
        <div className="p-4 rounded-lg bg-neutral-900/30 border border-neutral-800/50">
           <i className="fa-solid fa-print mb-2 text-blue-400 text-lg"></i>
           <p>Printable Keepsakes</p>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;