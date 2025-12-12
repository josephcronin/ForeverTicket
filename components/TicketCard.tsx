import React from 'react';
import { TicketData } from '../types';

interface TicketCardProps {
  data: TicketData;
  imageUrl?: string;
  printTexture: 'none' | 'holographic' | 'matte' | 'glossy';
  isImageLoading: boolean;
  forPrint?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  data,
  imageUrl,
  printTexture,
  isImageLoading,
  forPrint = false
}) => {
  const { eventDetails, visualTheme, giftCopy } = data;
  const { colorPalette } = visualTheme;
  
  // Safe defaults for colors
  const primaryColor = colorPalette?.[0] || '#ffffff';
  const secondaryColor = colorPalette?.[1] || '#cccccc';
  const accentColor = colorPalette?.[2] || primaryColor;

  // Dynamic font mapping
  const getFontFamily = (fontName: string) => {
    const lower = fontName?.toLowerCase() || '';
    if (lower.includes('serif') && !lower.includes('sans')) return 'font-serif';
    if (lower.includes('mono')) return 'font-mono';
    if (lower.includes('display') || lower.includes('playfair')) return 'font-[Playfair_Display]';
    if (lower.includes('cinzel')) return 'font-[Cinzel]';
    if (lower.includes('grotesk')) return 'font-[Space_Grotesk]';
    return 'font-[Montserrat]'; 
  };

  const headlineFontClass = getFontFamily(visualTheme.typography?.headlineFont);
  const bodyFontClass = getFontFamily(visualTheme.typography?.bodyFont);

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
      className={`relative flex rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 transition-all duration-500`}
      style={{
        borderColor: secondaryColor,
        boxShadow: forPrint ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
             style={{ objectPosition: '50% 25%' }}
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

         <div className="absolute inset-0 bg-neutral-950/50" /> 
         <div className="absolute inset-0 opacity-20 mix-blend-color" style={{ backgroundColor: primaryColor }} />
      </div>

      {/* Texture Overlays */}
      {printTexture === 'holographic' && <div className="absolute inset-0 holographic z-0"></div>}
      {printTexture === 'matte' && <div className="absolute inset-0 texture-matte z-0"></div>}
      {printTexture === 'glossy' && <div className="absolute inset-0 texture-glossy z-0"></div>}

      {/* LEFT SIDE: Main Event Info */}
      <div className="relative z-10 flex-1 p-4 md:p-6 border-r-2 border-dashed border-white/20 flex flex-col justify-between overflow-hidden min-w-0">
         {/* Notches */}
         <div className="absolute -top-3 -right-3 w-6 h-6 bg-neutral-950 rounded-full z-20" />
         <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-neutral-950 rounded-full z-20" />

         {/* Venue & Message */}
         <div className="flex justify-between items-start gap-3 w-full mb-1">
            <div className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold text-white/90 drop-shadow-md truncate flex-1 min-w-0">
               {eventDetails.venue}
            </div>
            {hasValidPersonalMessage(eventDetails.personalMessage) && (
               <div className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 shrink-0 max-w-[45%] flex items-center">
                 <span className={`text-[9px] md:text-[11px] italic text-white/90 ${bodyFontClass} truncate block w-full`}>
                   "{eventDetails.personalMessage}"
                 </span>
               </div>
            )}
         </div>

         {/* Title */}
         <div className="my-auto pr-2 w-full flex flex-col justify-center min-h-0">
           <h1 
             className={`text-xl md:text-3xl lg:text-4xl font-bold leading-tight text-white ${headlineFontClass} line-clamp-2`}
             style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)', color: '#fff' }}
             title={eventDetails.artistOrEvent}
           >
             {eventDetails.artistOrEvent}
           </h1>
           {giftCopy.tagline && (
              <p className={`mt-1 md:mt-2 text-xs md:text-base text-white/90 drop-shadow-md ${bodyFontClass} opacity-90 line-clamp-1`}>
                {giftCopy.tagline}
              </p>
           )}
         </div>

         {/* Date */}
         <div className="flex items-center gap-3 mt-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur border border-white/20 shrink-0">
               <i className="fa-regular fa-calendar text-white text-xs md:text-base"></i>
            </div>
            <div className="flex flex-col drop-shadow-md min-w-0 justify-center">
               <span className="text-[9px] md:text-[10px] uppercase text-white/70 tracking-wider truncate">Date & Time</span>
               <span className={`text-xs md:text-base font-semibold text-white ${bodyFontClass} truncate`}>
                 {eventDetails.date}
               </span>
            </div>
         </div>
      </div>

      {/* RIGHT SIDE: Seat Info */}
      <div className="relative z-10 shrink-0 w-[120px] md:w-[200px] p-3 bg-black/40 backdrop-blur-md flex flex-col justify-between items-center text-center">
         {seatData.raw ? (
           <div className="flex-1 flex flex-col justify-center w-full overflow-hidden">
              <span className="text-[9px] uppercase text-white/50 tracking-wider mb-1">Admission</span>
              <span className={`text-sm md:text-xl font-bold text-white leading-tight ${headlineFontClass}`} style={{ color: accentColor }}>
                {seatData.raw}
              </span>
           </div>
         ) : (
           <div className="flex flex-col justify-evenly w-full flex-1">
              <div className="flex flex-col items-center">
                <span className="block text-[8px] md:text-[10px] uppercase text-white/50 tracking-widest mb-0.5">Section</span>
                <span className={`text-base md:text-2xl font-bold text-white leading-none ${headlineFontClass} break-words w-full`} style={{ color: accentColor }}>
                  {seatData.sec || '-'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="block text-[8px] md:text-[10px] uppercase text-white/50 tracking-widest mb-0.5">Row</span>
                <span className={`text-base md:text-2xl font-bold text-white leading-none ${headlineFontClass} break-words w-full`}>
                  {seatData.row || '-'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="block text-[8px] md:text-[10px] uppercase text-white/50 tracking-widest mb-0.5">Seat</span>
                <span className={`text-base md:text-2xl font-bold text-white leading-none ${headlineFontClass} break-words w-full`}>
                  {seatData.seat || '-'}
                </span>
              </div>
           </div>
         )}

         {/* Barcode */}
         <div className="w-full pt-2">
            <div className="h-5 md:h-8 w-full bg-white rounded-sm px-1 py-1 flex items-center justify-between overflow-hidden">
               {[...Array(24)].map((_, i) => (
                 <div 
                   key={i} 
                   className="bg-black h-full" 
                   style={{ 
                     width: Math.random() > 0.6 ? '4px' : '1px',
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