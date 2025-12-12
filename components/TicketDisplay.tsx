import React, { useState } from 'react';
import { TicketData } from '../types';
import { TicketCard } from './TicketCard';

interface TicketDisplayProps {
  data: TicketData;
  imageUrl?: string;
  onReset: () => void;
  onMoodSelect: (mood: string) => void;
  isImageLoading: boolean;
}

type PrintTexture = 'none' | 'holographic' | 'matte' | 'glossy';

const TicketDisplay: React.FC<TicketDisplayProps> = ({ 
  data, 
  imageUrl, 
  onReset,
  onMoodSelect,
  isImageLoading 
}) => {
  const [isPrintStudioOpen, setIsPrintStudioOpen] = useState(false);
  // Default to holographic to immediately apply the effect
  const [printTexture, setPrintTexture] = useState<PrintTexture>('holographic');
  
  const { giftCopy, visualTheme } = data;

  const handlePrint = () => {
    // 1. Get the content we want to print
    const content = document.getElementById('printable-ticket-source');
    if (!content) return;

    // 2. Open a new window (bypassing iframe restrictions)
    const printWindow = window.open('', '_blank', 'width=1122,height=793'); // A4 aspect ratio approx
    if (!printWindow) {
      alert("Please allow popups to print your ticket!");
      return;
    }

    // 3. Construct the new document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.eventDetails.artistOrEvent} - ForeverTicket</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">
          <style>
             @keyframes shine {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
             }
             .holographic {
                background: linear-gradient(
                  115deg,
                  transparent 0%,
                  rgba(0, 255, 255, 0.3) 25%,
                  rgba(255, 0, 128, 0.3) 50%,
                  rgba(255, 255, 0, 0.3) 75%,
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
        <div className="flex flex-col items-center gap-8 pb-20 animate-fade-in-up">
          <div className="text-center space-y-2 max-w-xl">
            <h2 className="text-3xl font-bold text-white">{giftCopy.ticketTitle}</h2>
            <p className="text-neutral-400 italic">"{giftCopy.emotionalDescription}"</p>
          </div>

          <div className="w-full max-w-[850px]">
             <TicketCard 
                data={data} 
                imageUrl={imageUrl} 
                printTexture={printTexture} 
                isImageLoading={isImageLoading} 
             />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={onReset}
              className="px-6 py-3 rounded-xl border border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 transition-colors text-neutral-300 font-medium"
            >
              <i className="fa-solid fa-rotate-left mr-2"></i>
              Start Over
            </button>
            <button 
              className="px-8 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              onClick={() => setIsPrintStudioOpen(true)}
            >
              <i className="fa-solid fa-print mr-2"></i>
              Print Studio
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
             <p className="text-[10px] uppercase tracking-widest text-neutral-600">Remix the vibe</p>
             <div className="flex gap-2 flex-wrap justify-center max-w-lg">
                {visualTheme.moodKeywords.map((mood, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => onMoodSelect(mood)}
                    disabled={isImageLoading}
                    className={`text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all duration-300 
                      ${isImageLoading 
                        ? 'border-neutral-800 text-neutral-700 cursor-not-allowed' 
                        : 'border-neutral-800 text-neutral-400 hover:border-white hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {mood}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* 
         Print Studio UI (Editor) 
      */}
      {isPrintStudioOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col md:flex-row">
           <div className="w-full md:w-80 bg-neutral-900 border-b md:border-r border-neutral-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-20">
              <div>
                <button 
                   onClick={() => setIsPrintStudioOpen(false)}
                   className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm mb-6"
                >
                   <i className="fa-solid fa-arrow-left"></i> Back to Editor
                </button>
                <h2 className="text-2xl font-bold text-white mb-2">Print Studio</h2>
                <p className="text-sm text-neutral-400">Configure your ticket for the perfect physical keepsake.</p>
              </div>

              <div>
                 <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Paper Finish Simulation</h3>
                 <div className="space-y-2">
                    {[
                      { id: 'none', label: 'Standard', icon: 'fa-ban' },
                      { id: 'glossy', label: 'High Gloss', icon: 'fa-wand-sparkles' },
                      { id: 'matte', label: 'Vintage Matte', icon: 'fa-note-sticky' },
                      { id: 'holographic', label: 'Holographic Foil', icon: 'fa-bolt' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setPrintTexture(opt.id as PrintTexture)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                           printTexture === opt.id 
                           ? 'bg-purple-900/20 border-purple-500 text-white' 
                           : 'bg-neutral-800/50 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                         <span className="flex items-center gap-3">
                            <i className={`fa-solid ${opt.icon} w-4`}></i>
                            {opt.label}
                         </span>
                         {printTexture === opt.id && <i className="fa-solid fa-check text-purple-400"></i>}
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                type="button"
                onClick={handlePrint}
                className="mt-auto w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                 <i className="fa-solid fa-print"></i> Print Now
              </button>
           </div>

           <div className="flex-1 bg-neutral-800/50 flex flex-col p-4 md:p-8 overflow-y-auto overflow-x-hidden relative">
              <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="bg-white shadow-2xl p-6 md:p-12 w-full max-w-[1100px] flex items-center justify-center relative overflow-hidden shrink-0 mx-auto aspect-[1.414/1] md:aspect-auto md:h-auto rounded-sm">
                   <div className="absolute top-3 left-3 md:top-4 md:left-4 text-[8px] md:text-[10px] text-neutral-300 font-mono tracking-widest uppercase">Paper Preview • A4 Landscape</div>
                   <div className="w-full">
                      <TicketCard 
                        data={data} 
                        imageUrl={imageUrl} 
                        printTexture={printTexture} 
                        isImageLoading={isImageLoading} 
                      />
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* 
         HIDDEN SOURCE FOR PRINTING
      */}
      <div id="printable-ticket-source" className="hidden">
         <div className="w-full h-full flex items-center justify-center">
             <TicketCard 
                data={data} 
                imageUrl={imageUrl} 
                printTexture={printTexture} 
                isImageLoading={isImageLoading}
                forPrint={true} 
             />
         </div>
      </div>
    </div>
  );
};

export default TicketDisplay;