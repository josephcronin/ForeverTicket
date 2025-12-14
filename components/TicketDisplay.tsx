import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TicketData } from '../types';
import { TicketCard } from './TicketCard';
import { markTicketAsPaid, getTicketFromDb } from '../services/ticketService';

interface TicketDisplayProps {
  data: TicketData;
  imageUrl?: string;
  ticketId: string | null;
  onReset: () => void;
  onEdit: () => void;
  onMoodSelect: (mood: string) => void;
  isImageLoading: boolean;
}

type PrintTexture = 'none' | 'holographic' | 'matte' | 'glossy';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/14A4gz6B4gE31n8dG07bW01';

const textureDescriptions: Record<string, string> = {
  none: "Standard matte finish. Best for home printers. No glare, clean clean lines, high readability.",
  glossy: "High-shine finish. Boosts color contrast and vibrancy. Simulates traditional photo paper.",
  matte: "Textured grain finish. Simulates premium heavy cardstock with a tactile, expensive feel.",
  holographic: "Iridescent foil overlay. Shifts colors in light. Best for digital sharing or foil printing."
};

const TicketDisplay: React.FC<TicketDisplayProps> = ({ 
  data, 
  imageUrl, 
  ticketId,
  onReset,
  onEdit,
  onMoodSelect,
  isImageLoading 
}) => {
  const [isPrintStudioOpen, setIsPrintStudioOpen] = useState(false);
  const [printTexture, setPrintTexture] = useState<PrintTexture>('holographic');
  
  // Payment / Unlock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Share State
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { giftCopy, visualTheme } = data;

  // Check for Payment Return (Session ID) or Previous Unlock
  useEffect(() => {
    const checkUnlockStatus = async () => {
      // 1. Check if we just returned from Stripe
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      
      // We look for a pending ticket ID in local storage in case we were redirected to root
      const pendingId = localStorage.getItem('pending_payment_ticket_id');
      const targetId = ticketId || pendingId;

      if (sessionId && targetId) {
         // We are in a payment return flow
         setIsVerifying(true);
         setIsPrintStudioOpen(true); // Auto-open studio so they see the result
         
         // Verify against DB
         const result = await markTicketAsPaid(targetId, sessionId);
         
         if (result.success) {
            setIsUnlocked(true);
            localStorage.removeItem('pending_payment_ticket_id');
            // Clean URL
            const newUrl = window.location.pathname + (ticketId ? `?id=${ticketId}` : '');
            window.history.replaceState({}, '', newUrl);
         } else {
            setVerificationError(result.message || "Payment verification failed.");
         }
         setIsVerifying(false);
         return;
      }

      // 2. If no session ID, just check if the ticket is ALREADY paid in DB
      if (ticketId) {
         const result = await getTicketFromDb(ticketId);
         if (result?.isPaid) {
            setIsUnlocked(true);
         }
      }
    };

    checkUnlockStatus();
  }, [ticketId]);

  const handleShare = () => {
    if (!ticketId) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleInitiateUnlock = () => {
    if (ticketId) {
        localStorage.setItem('pending_payment_ticket_id', ticketId);
    }
    // We add the client_reference_id for good measure, though we primarily use session_id return
    const finalLink = `${STRIPE_PAYMENT_LINK}?client_reference_id=${ticketId || 'new_ticket'}`;
    window.location.href = finalLink;
  };

  const handlePrint = () => {
    if (!isUnlocked) return;
    const content = document.getElementById('printable-ticket-source');
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=1122,height=793');
    if (!printWindow) {
      alert("Please allow popups to print your ticket!");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.eventDetails.artistOrEvent} - PrettyTickets.com</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@300;500;700&family=Cormorant+Garamond:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
             @keyframes shine {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
             }
             .holographic {
                background: linear-gradient(
                  115deg,
                  transparent 0%,
                  rgba(90, 166, 255, 0.3) 25%,
                  rgba(255, 79, 163, 0.3) 50%,
                  rgba(201, 162, 255, 0.3) 75%,
                  transparent 100%
                );
                background-size: 200% 200%;
                mix-blend-mode: screen;
                opacity: 0.6;
                pointer-events: none;
                animation: shine 5s linear infinite;
             }
             .texture-matte {
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
                mix-blend-mode: screen;
                opacity: 0.15;
                pointer-events: none;
             }
             .texture-glossy {
                background: linear-gradient(to bottom right, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.4) 100%);
                mix-blend-mode: screen;
                z-index: 50;
                pointer-events: none;
             }
             @page {
                size: landscape;
                margin: 0;
             }
             body {
                background-color: white;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
             }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            window.onload = function() {
               setTimeout(function() {
                  window.print();
               }, 800);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full">
      {/* 
         Standard Display Mode
      */}
      {!isPrintStudioOpen && (
        <div className="flex flex-col items-center gap-10 pb-20 animate-fade-in-up">
          <div className="text-center space-y-3 max-w-xl">
            <h2 className="text-4xl font-bold text-white font-['Playfair_Display'] leading-tight">{giftCopy.ticketTitle}</h2>
            <p className="text-[#C9A2FF] italic font-['Nunito'] text-lg">"{giftCopy.emotionalDescription}"</p>
          </div>

          <div className="w-full max-w-[850px] relative group">
             <div className="absolute -inset-4 bg-gradient-to-r from-[#FF4FA3] via-[#C9A2FF] to-[#5AA6FF] rounded-[30px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
             <TicketCard 
                data={data} 
                imageUrl={imageUrl} 
                printTexture={printTexture} 
                isImageLoading={isImageLoading} 
             />
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <div className="flex gap-2">
                <button 
                  onClick={onReset}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors text-neutral-300 font-semibold font-['Nunito'] flex items-center gap-2 text-sm"
                  title="Delete and start over"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
                
                <button 
                  onClick={onEdit}
                  className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#FF4FA3]/40 hover:text-white transition-colors text-neutral-200 font-semibold font-['Nunito'] flex items-center gap-2 text-sm"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  Edit
                </button>
            </div>

            {ticketId && (
               <button 
                 onClick={handleShare}
                 className="px-6 py-3 rounded-xl border border-[#5AA6FF]/30 bg-[#5AA6FF]/10 hover:bg-[#5AA6FF]/20 hover:border-[#5AA6FF] text-[#5AA6FF] hover:text-white transition-all font-semibold font-['Nunito'] flex items-center gap-2 text-sm relative overflow-hidden group"
               >
                 <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-link'}`}></i>
                 {copySuccess ? 'Copied!' : 'Share Link'}
               </button>
            )}

            <button 
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF4FA3] via-[#C9A2FF] to-[#5AA6FF] hover:brightness-110 text-white transition-all font-bold shadow-[0_0_20px_rgba(255,79,163,0.3)] hover:shadow-[0_0_35px_rgba(201,162,255,0.4)] border border-white/20 flex items-center gap-3 text-sm"
              onClick={() => setIsPrintStudioOpen(true)}
            >
              <i className="fa-solid fa-print"></i>
              Open Print Studio
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
             <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Sparkle & Vibe Remix</p>
             <div className="flex gap-3 flex-wrap justify-center max-w-lg">
                {visualTheme.moodKeywords.map((mood, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => onMoodSelect(mood)}
                    disabled={isImageLoading}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-300 font-['Nunito']
                      ${isImageLoading 
                        ? 'border-neutral-800 text-neutral-600 cursor-not-allowed' 
                        : 'border-white/10 bg-[#1A1A35] text-neutral-300 hover:border-[#FF4FA3] hover:text-[#FF4FA3] hover:shadow-[0_0_15px_rgba(255,79,163,0.15)]'
                      }`}
                  >
                    ✨ {mood}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* 
         Print Studio UI (Editor) 
         Rendered via Portal
      */}
      {isPrintStudioOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-[#0F0F25] flex flex-col md:flex-row font-['Nunito'] animate-fade-in-up">
           <div className="w-full md:w-80 bg-[#13132B] border-b md:border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-20 shadow-2xl">
              <div>
                <button 
                   onClick={() => setIsPrintStudioOpen(false)}
                   className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm mb-6 font-semibold"
                >
                   <i className="fa-solid fa-arrow-left"></i> Back to Editor
                </button>
                <h2 className="text-2xl font-bold text-white mb-2 font-['Playfair_Display']">Print Studio</h2>
                <p className="text-sm text-neutral-400">Configure your ticket for the perfect physical keepsake.</p>
              </div>

              <div>
                 <h3 className="text-xs uppercase tracking-wider text-[#FF4FA3] font-bold mb-4">Paper Finish Simulation</h3>
                 <div className="space-y-3">
                    {[
                      { id: 'none', label: 'Standard Matte', icon: 'fa-note-sticky' },
                      { id: 'glossy', label: 'Photo Glossy', icon: 'fa-wand-sparkles' },
                      { id: 'matte', label: 'Premium Cardstock', icon: 'fa-layer-group' },
                      { id: 'holographic', label: 'Holographic Foil', icon: 'fa-bolt' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setPrintTexture(opt.id as PrintTexture)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-semibold group relative overflow-visible ${
                           printTexture === opt.id 
                           ? 'bg-[#C9A2FF]/10 border-[#C9A2FF] text-white shadow-[0_0_15px_rgba(201,162,255,0.15)]' 
                           : 'bg-[#1A1A35] border-transparent text-neutral-400 hover:bg-[#1F1F3F] hover:text-neutral-200'
                        }`}
                      >
                         <span className="flex items-center gap-3">
                            <i className={`fa-solid ${opt.icon} w-4 text-center ${printTexture === opt.id ? 'text-[#C9A2FF]' : 'text-neutral-600'}`}></i>
                            {opt.label}
                            {/* Info Icon & Tooltip */}
                            <div 
                                className="ml-2 relative group/info"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <i className="fa-regular fa-circle-question text-neutral-600 hover:text-[#5AA6FF] transition-colors cursor-help"></i>
                                
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-[#0F0F25] border border-white/20 rounded-lg shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 pointer-events-none z-50 text-left">
                                    <p className="text-[10px] leading-relaxed text-neutral-300 font-normal normal-case tracking-normal">
                                        {textureDescriptions[opt.id]}
                                    </p>
                                    {/* Arrow */}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F0F25] border-r border-b border-white/20 transform rotate-45"></div>
                                </div>
                            </div>
                         </span>
                         {printTexture === opt.id && <i className="fa-solid fa-check text-[#C9A2FF]"></i>}
                      </button>
                    ))}
                 </div>
              </div>
              
              {/* Print Quality Info */}
              <div>
                   <h3 className="text-xs uppercase tracking-wider text-[#FF4FA3] font-bold mb-4 flex items-center gap-2">
                      Print Specs
                      <div className="group relative cursor-help">
                          <i className="fa-regular fa-circle-question text-neutral-600 text-[10px] hover:text-[#5AA6FF] transition-colors"></i>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0F0F25] border border-white/10 rounded-lg text-[10px] text-neutral-400 hidden group-hover:block z-50 shadow-xl pointer-events-none">
                             This design is generated at a high-resolution 300 DPI, ensuring crisp text and vibrant colors when printed on professional equipment.
                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F0F25] border-r border-b border-white/10 transform rotate-45"></div>
                          </div>
                      </div>
                   </h3>
                   <div className="p-3 bg-[#1A1A35] rounded-xl border border-white/5 flex items-center justify-between">
                       <span className="text-sm text-neutral-300 font-semibold flex items-center gap-2">
                          <i className="fa-solid fa-maximize text-neutral-500 text-xs"></i>
                          Resolution
                       </span>
                       <span className="text-xs text-[#5AA6FF] font-mono bg-[#5AA6FF]/10 px-2 py-1 rounded border border-[#5AA6FF]/20">300 DPI</span>
                   </div>
              </div>

              {/* PAYMENT GATE / PRINT BUTTON */}
              <div className="mt-auto pt-6 border-t border-white/10">
                 {!isUnlocked ? (
                    <div className="space-y-4">
                       <div className="bg-gradient-to-br from-[#1A1A35] to-[#13132B] rounded-xl border border-[#FF4FA3]/20 p-4 shadow-lg relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF4FA3]/10 rounded-full blur-xl group-hover:bg-[#FF4FA3]/20 transition-all"></div>
                           <div className="flex justify-between items-end mb-2 relative z-10">
                              <div className="text-neutral-300 text-xs font-semibold uppercase tracking-wide">Design Fee</div>
                              <div className="text-white font-bold text-2xl">$1.49</div>
                           </div>
                           <p className="text-[10px] text-neutral-400 leading-relaxed relative z-10">
                              One-time fee to remove watermarks and unlock high-resolution printing for this design.
                           </p>
                       </div>

                       {/* Unlock Logic Switch */}
                       {isVerifying ? (
                          <div className="w-full py-4 bg-[#1A1A35] border border-white/10 text-neutral-300 font-bold rounded-xl flex items-center justify-center gap-3">
                             <i className="fa-solid fa-circle-notch fa-spin text-[#FF4FA3]"></i>
                             Verifying Payment...
                          </div>
                       ) : verificationError ? (
                          <div className="animate-fade-in-up">
                              <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3 rounded-lg mb-3">
                                 {verificationError}
                              </div>
                              <button 
                                onClick={handleInitiateUnlock}
                                className="w-full py-4 bg-[#FF4FA3] hover:bg-[#ff3392] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                              >
                                 Try Again
                              </button>
                          </div>
                       ) : (
                         <button 
                            onClick={handleInitiateUnlock}
                            className="w-full py-4 bg-[#FF4FA3] hover:bg-[#ff3392] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(255,79,163,0.4)] transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
                         >
                             <i className="fa-solid fa-lock-open"></i> Unlock & Print
                         </button>
                       )}
                       
                       <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 opacity-60">
                          <i className="fa-brands fa-stripe text-lg"></i>
                          <span>Secured by Stripe</span>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-4 animate-fade-in-up">
                       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 text-emerald-400 text-xs font-bold">
                          <i className="fa-solid fa-circle-check"></i>
                          Unlocked! Ready to print.
                       </div>
                       <button 
                         type="button"
                         onClick={handlePrint}
                         className="w-full py-4 bg-gradient-to-r from-[#FF4FA3] via-[#C9A2FF] to-[#5AA6FF] text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
                       >
                          <i className="fa-solid fa-print"></i> Print Now
                       </button>
                    </div>
                 )}
              </div>
           </div>

           <div className="flex-1 bg-[#0F0F25] flex flex-col p-4 md:p-8 overflow-y-auto overflow-x-hidden relative">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #5AA6FF 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              
              <div className="flex-1 flex items-center justify-center min-h-[500px] relative z-10">
                <div className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-6 md:p-12 w-full max-w-[1100px] flex items-center justify-center relative overflow-hidden shrink-0 mx-auto aspect-[1.414/1] md:aspect-auto md:h-auto rounded-sm border-[16px] border-[#1A1A35]">
                   <div className="absolute top-3 left-3 md:top-4 md:left-4 text-[8px] md:text-[10px] text-neutral-400 font-mono tracking-widest uppercase">Paper Preview • A4 Landscape</div>
                   <div className="w-full">
                      <TicketCard 
                        data={data} 
                        imageUrl={imageUrl} 
                        printTexture={printTexture} 
                        isImageLoading={isImageLoading} 
                        forPrint={isUnlocked} 
                      />
                   </div>
                </div>
              </div>
           </div>
        </div>,
        document.body
      )}

      <div id="printable-ticket-source" className="hidden">
         <div className="w-full h-full flex items-center justify-center">
             <TicketCard 
                data={data} 
                imageUrl={imageUrl} 
                printTexture={printTexture} 
                isImageLoading={isImageLoading}
                forPrint={isUnlocked} 
             />
         </div>
      </div>
    </div>
  );
};

export default TicketDisplay;