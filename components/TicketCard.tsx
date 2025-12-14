import React from 'react';
import { TicketData } from '../types';

interface TicketCardProps {
  data: TicketData;
  imageUrl?: string;
  printTexture: 'none' | 'holographic' | 'matte' | 'glossy';
  isImageLoading: boolean;
  forPrint?: boolean;
  hideWatermark?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  data,
  imageUrl,
  printTexture,
  isImageLoading,
  forPrint = false,
  hideWatermark = false
}) => {
  const { eventDetails, visualTheme, giftCopy } = data;
  const { colorPalette } = visualTheme;
  
  // Safe defaults for colors
  const primaryColor = colorPalette?.[0] || '#FF4FA3';
  const secondaryColor = colorPalette?.[1] || '#C9A2FF';
  const accentColor = colorPalette?.[2] || '#5AA6FF';

  // Dynamic font mapping with updated brand defaults
  const getFontFamily = (fontName: string, type: 'headline' | 'body') => {
    const lower = fontName?.toLowerCase() || '';
    
    // Explicit matches from AI
    if (lower.includes('playfair')) return 'font-[Playfair_Display]';
    if (lower.includes('cormorant')) return 'font-[Cormorant_Garamond]';
    if (lower.includes('marcellus')) return 'font-[Cormorant_Garamond]'; // Fallback to Cormorant if Marcellus unavailable
    if (lower.includes('cinzel')) return 'font-[Cinzel]';
    if (lower.includes('montserrat')) return 'font-[Montserrat]';
    if (lower.includes('nunito')) return 'font-[Nunito]';
    if (lower.includes('space')) return 'font-[Space_Grotesk]';

    // Brand Defaults
    if (type === 'headline') return 'font-[Playfair_Display]'; // Serif default for headlines
    return 'font-[Montserrat]'; // Sans default for body
  };

  const headlineFontClass = getFontFamily(visualTheme.typography?.headlineFont, 'headline');
  const bodyFontClass = getFontFamily(visualTheme.typography?.bodyFont, 'body');

  // Parse seat info safely
  const parseSeatInfo = (info: string = '') => {
    const sec = info.match(/(?:Section|Sec\.?|Sec)\s*[:\-]?\s*([\w\d]+)/i)?.[1];
    const row = info.match(/(?:Row)\s*[:\-]?\s*([\w\d]+)/i)?.[1];
    const seat = info.match(/(?:Seat)\s*[:\-]?\s*([\w\d]+)/i)?.[1];
    if (!sec && !row && !seat) return { raw: info };
    return { sec, row, seat };
  };

  const seatData = parseSeatInfo(eventDetails.seatInfo);

  // Validate personal message
  const hasValidPersonalMessage = (msg: string | undefined | null) => {
    if (!msg) return false;
    const lower = msg.trim().toLowerCase();
    return lower !== '' && lower !== 'null' && lower !== 'undefined' && lower !== 'n/a' && lower !== 'none';
  };

  return (
    <div 
      className={`relative flex rounded-xl overflow-hidden bg-[#0F0F25] border border-white/10 transition-all duration-500`}
      style={{
        borderColor: secondaryColor,
        boxShadow: forPrint ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        width: forPrint ? '270mm' : '100%', 
        transform: forPrint ? 'scale(1)' : 'none',
        aspectRatio: '2.75/1',
        margin: forPrint ? 'auto' : undefined
      }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
         {imageUrl ? (
           <img 
             src={imageUrl} 
             alt="Background Art"
             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isImageLoading && !forPrint ? 'opacity-50 blur-sm' : 'opacity-100'}`}
             style={{ objectPosition: '50% 35%' }}
           />
         ) : (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
              }}
            />
         )}
         
         {isImageLoading && !forPrint && (
            <div className="absolute inset-0 flex items-center justify-center z-10 no-print">
               <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
         )}

         {/* Cinematic Darkening */}
         <div className="absolute inset-0 bg-[#0F0F25]/40 mix-blend-multiply" /> 
         <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F25]/90 via-[#0F0F25]/40 to-[#0F0F25]/80" />
      </div>

      {/* Texture Overlays */}
      {printTexture === 'holographic' && <div className="absolute inset-0 holographic z-0"></div>}
      {printTexture === 'matte' && <div className="absolute inset-0 texture-matte z-0"></div>}
      {printTexture === 'glossy' && <div className="absolute inset-0 texture-glossy z-0"></div>}

      {/* Watermark Overlay (Hidden during print or if explicitly hidden) */}
      {!forPrint && !hideWatermark && (
        <div className="absolute inset-0 z-50 pointer-events-none select-none overflow-hidden">
           {/* Repeating Pattern - Increased Opacity and Size */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] flex flex-wrap items-center justify-center opacity-25 rotate-[-25deg] mix-blend-overlay">
              {Array.from({ length: 30 }).map((_, i) => (
                 <div key={i} className="m-10">
                    <span className="text-4xl font-bold text-white font-['Dancing_Script'] whitespace-nowrap">
                       PrettyTickets
                    </span>
                 </div>
              ))}
           </div>
           {/* Center Badge - Explicit & Prominent */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
              <div className="bg-black/60 backdrop-blur-md border border-white/30 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-2">
                  <span className="text-white text-sm uppercase tracking-[0.3em] font-['Montserrat'] font-bold drop-shadow-md whitespace-nowrap">
                     Preview Mode
                  </span>
                  <div className="h-px w-full bg-white/20"></div>
                  <span className="text-white/80 text-[10px] uppercase tracking-widest font-['Nunito'] font-semibold whitespace-nowrap">
                     Print to remove watermark
                  </span>
              </div>
           </div>
        </div>
      )}

      {/* LEFT SIDE: Main Event Info */}
      <div className="relative z-10 flex-1 p-5 md:p-8 border-r-2 border-dashed border-white/30 flex flex-col justify-between overflow-hidden min-w-0">
         {/* Notches */}
         <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#0F0F25] rounded-full z-20" />
         <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#0F0F25] rounded-full z-20" />

         {/* Venue (Top Left) */}
         <div className="flex justify-between items-start gap-4 w-full mb-2">
            <div className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold text-white/90 drop-shadow-md truncate flex-1 min-w-0 font-['Nunito']">
               {eventDetails.venue}
            </div>
         </div>

         {/* Title (Center) */}
         <div className="my-auto pr-2 w-full flex flex-col justify-center min-h-0">
           <h1 
             className={`text-2xl md:text-4xl lg:text-5xl font-bold leading-none text-white ${headlineFontClass} line-clamp-2`}
             style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}
             title={eventDetails.artistOrEvent}
           >
             {eventDetails.artistOrEvent}
           </h1>
           {giftCopy.tagline && (
              <p className={`mt-2 text-xs md:text-sm text-[#E0E0E0] drop-shadow-md ${bodyFontClass} font-medium tracking-wide uppercase opacity-90 line-clamp-1`}>
                {giftCopy.tagline}
              </p>
           )}
         </div>

         {/* Bottom Row: Date & Personal Message */}
         <div className="flex items-end justify-between w-full mt-2 gap-4">
            {/* Date */}
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur border border-white/20 shrink-0 shadow-lg">
                  <i className="fa-regular fa-calendar text-white text-xs md:text-base"></i>
               </div>
               <div className="flex flex-col drop-shadow-md min-w-0 justify-center">
                  <span className="text-[9px] md:text-[10px] uppercase text-[#FF4FA3] font-bold tracking-widest truncate font-['Nunito']">Date & Time</span>
                  <span className={`text-sm md:text-lg font-bold text-white ${bodyFontClass} truncate`}>
                    {eventDetails.date}
                  </span>
               </div>
            </div>

            {/* Personal Message (Moved to Bottom Right) */}
            {hasValidPersonalMessage(eventDetails.personalMessage) && (
               <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shrink-0 max-w-[50%] flex items-center shadow-lg mb-1 animate-fade-in-up">
                 <span className={`text-[9px] md:text-[11px] italic text-white font-medium ${bodyFontClass} truncate block w-full`}>
                   "{eventDetails.personalMessage}"
                 </span>
               </div>
            )}
         </div>
      </div>

      {/* RIGHT SIDE: Seat Info */}
      <div className="relative z-10 shrink-0 w-[130px] md:w-[220px] p-4 bg-black/30 backdrop-blur-md flex flex-col justify-between items-center text-center">
         {seatData.raw ? (
           <div className="flex-1 flex flex-col justify-center w-full overflow-hidden">
              <span className="text-[10px] uppercase text-white/60 tracking-widest mb-1 font-['Nunito']">Admission</span>
              <span className={`text-sm md:text-xl font-bold text-white leading-tight ${headlineFontClass}`} style={{ color: accentColor }}>
                {seatData.raw}
              </span>
           </div>
         ) : (
           <div className="flex flex-col justify-evenly w-full flex-1 gap-2">
              <div className="flex flex-col items-center">
                <span className="block text-[8px] md:text-[9px] uppercase text-white/50 tracking-[0.2em] mb-0.5 font-['Nunito']">Section</span>
                <span className={`text-lg md:text-3xl font-bold text-white leading-none ${headlineFontClass} break-words w-full`} style={{ color: accentColor }}>
                  {seatData.sec || '-'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="block text-[8px] md:text-[9px] uppercase text-white/50 tracking-[0.2em] mb-0.5 font-['Nunito']">Row</span>
                <span className={`text-base md:text-2xl font-bold text-white leading-none ${headlineFontClass} break-words w-full`}>
                  {seatData.row || '-'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="block text-[8px] md:text-[9px] uppercase text-white/50 tracking-[0.2em] mb-0.5 font-['Nunito']">Seat</span>
                <span className={`text-base md:text-2xl font-bold text-white leading-none ${headlineFontClass} break-words w-full`}>
                  {seatData.seat || '-'}
                </span>
              </div>
           </div>
         )}

         {/* Barcode */}
         <div className="w-full pt-3 opacity-80">
            <div className="h-6 md:h-10 w-full bg-white rounded-sm px-1 py-1 flex items-center justify-between overflow-hidden">
               {[...Array(28)].map((_, i) => (
                 <div 
                   key={i} 
                   className="bg-neutral-900 h-full" 
                   style={{ 
                     width: Math.random() > 0.5 ? '4px' : '1px',
                     opacity: 0.9 
                   }} 
                 />
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
