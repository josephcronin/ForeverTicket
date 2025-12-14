import React, { useEffect, useState } from 'react';
import { getRecentTickets } from '../services/ticketService';
import { TicketData } from '../types';
import { TicketCard } from './TicketCard';

interface GalleryProps {
  onSelect: (id: string, data: TicketData, imageUrl: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onSelect }) => {
  const [tickets, setTickets] = useState<Array<{ id: string, ticketData: TicketData, imageUrl: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getRecentTickets(12);
        setTickets(data);
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
         <i className="fa-solid fa-circle-notch fa-spin text-3xl text-[#5AA6FF] mb-4"></i>
         <p className="text-neutral-400 font-['Nunito']">Loading community designs...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-['Playfair_Display'] font-bold text-white mb-2">Community Gallery</h2>
        <p className="text-neutral-400 font-['Nunito']">Recent keepsakes created by others. Click to view.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center p-12 border border-white/5 rounded-3xl bg-white/5">
           <i className="fa-solid fa-ghost text-4xl text-neutral-600 mb-4"></i>
           <p className="text-neutral-400">No tickets found yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {tickets.map((t) => (
            <div 
              key={t.id}
              onClick={() => onSelect(t.id, t.ticketData, t.imageUrl)}
              className="group cursor-pointer perspective-1000"
            >
              <div className="relative transition-transform duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02]">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#FF4FA3] to-[#5AA6FF] rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity"></div>
                
                {/* Scaled down ticket card container */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl pointer-events-none">
                   {/* We scale the content to fit the grid column, but keep aspect ratio */}
                   <div style={{ pointerEvents: 'none' }}>
                      <TicketCard 
                        data={t.ticketData} 
                        imageUrl={t.imageUrl} 
                        printTexture="holographic" 
                        isImageLoading={false}
                        hideWatermark={true}
                      />
                   </div>
                </div>

                <div className="mt-4 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity px-1">
                   <h3 className="text-sm font-bold text-white truncate max-w-[70%] font-['Montserrat']">
                      {t.ticketData.eventDetails.artistOrEvent}
                   </h3>
                   <span className="text-xs text-[#5AA6FF] font-['Nunito'] flex items-center gap-1">
                      View <i className="fa-solid fa-arrow-right"></i>
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
