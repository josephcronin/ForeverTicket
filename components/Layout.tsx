import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: 'editor' | 'gallery';
  onNavigate?: (view: 'editor' | 'gallery') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView = 'editor', onNavigate }) => {
  
  const handleNav = (view: 'editor' | 'gallery', e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate(view);
  };

  return (
    <div className="min-h-screen bg-[#0F0F25] text-neutral-100 flex flex-col font-sans selection:bg-[#FF4FA3] selection:text-white relative overflow-x-hidden">
      
      {/* Ambient Background Glows - Brand Colors */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Left Side - Pink Rose */}
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vh] bg-[#FF4FA3]/15 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[6000ms]" />
        
        {/* Right Side - Sky Glow Blue */}
        <div className="absolute top-[-10%] right-[-10%] w-[45vw] h-[45vh] bg-[#5AA6FF]/15 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[7000ms] delay-1000" />
        
        {/* Bottom Center - Lavender Mist */}
        <div className="absolute bottom-[-20%] left-[30%] w-[50vw] h-[50vh] bg-[#C9A2FF]/10 rounded-full blur-[140px] mix-blend-screen" />
      </div>

      <header className="p-6 border-b border-white/5 sticky top-0 z-50 bg-[#0F0F25]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={(e) => handleNav('editor', e)}>
            {/* Logo Icon Recreation */}
            <div className="relative w-10 h-10 -rotate-12 transition-transform duration-500 group-hover:rotate-0">
               {/* Pink/Lavender box */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#FF4FA3] to-[#C9A2FF] rounded-lg transform translate-x-1 translate-y-1 opacity-80 group-hover:opacity-100 transition-opacity"></div>
               {/* Blue box */}
               <div className="absolute inset-0 bg-gradient-to-tr from-[#5AA6FF] to-cyan-300 rounded-lg flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm">
                  <i className="fa-solid fa-star text-white text-sm drop-shadow-md"></i>
               </div>
               {/* Decorative dots - Midnight Ink */}
               <div className="absolute top-0 right-0 w-2 h-2 bg-[#0F0F25] rounded-full -mt-1 -mr-1"></div>
               <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#0F0F25] rounded-full -mb-1 -ml-1"></div>
            </div>
            
            {/* Logo Text */}
            <h1 className="text-3xl font-bold tracking-tight leading-none flex items-baseline select-none ml-1">
              {/* "Pretty" in Soft Script */}
              <span className="font-['Dancing_Script'] bg-clip-text text-transparent bg-gradient-to-r from-[#FF4FA3] to-[#C9A2FF] drop-shadow-[0_0_15px_rgba(255,79,163,0.3)] pr-1.5 text-4xl">Pretty</span>
              {/* "Tickets" in Clean Modern Sans */}
              <span className="font-['Montserrat'] bg-clip-text text-transparent bg-gradient-to-r from-[#5AA6FF] to-cyan-300 drop-shadow-[0_0_15px_rgba(90,166,255,0.3)] font-extrabold tracking-tight">Tickets</span>
              <span className="text-[#FF4FA3] text-[10px] font-sans font-bold ml-1 tracking-widest uppercase opacity-80">.com</span>
            </h1>
          </div>

          <nav className="hidden sm:flex gap-8 text-sm font-medium text-neutral-300 items-center font-['Nunito']">
            <button 
              onClick={(e) => handleNav('gallery', e)}
              className={`hover:text-[#FF4FA3] transition-colors relative group ${currentView === 'gallery' ? 'text-white' : ''}`}
            >
              Gallery
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#FF4FA3] transition-all ${currentView === 'gallery' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
            <a href="#" className="hover:text-[#5AA6FF] transition-colors relative group">
              How it works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5AA6FF] transition-all group-hover:w-full"></span>
            </a>
            <button 
              onClick={(e) => handleNav('editor', e)}
              className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#FF4FA3]/50 hover:text-white transition-all text-xs uppercase tracking-wider font-bold shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,79,163,0.3)]"
            >
              Start Design
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        {children}
      </main>

      <footer className="border-t border-white/5 py-12 bg-[#0F0F25]/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center items-baseline gap-1 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <span className="font-['Dancing_Script'] text-2xl text-[#FF4FA3]">Pretty</span>
             <span className="font-['Montserrat'] text-2xl font-bold text-[#5AA6FF]">Tickets</span>
          </div>
          <p className="text-neutral-500 text-sm font-['Nunito']">&copy; {new Date().getFullYear()} PrettyTickets.com. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
