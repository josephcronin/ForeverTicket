import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <header className="p-6 border-b border-neutral-800 sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
              <i className="fa-solid fa-ticket text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
              ForeverTicket
            </h1>
          </div>
          <nav className="hidden sm:flex gap-4 text-sm font-medium text-neutral-400">
            <a href="#" className="hover:text-white transition-colors">Gallery</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="border-t border-neutral-900 py-8 text-center text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()} ForeverTicket. AI Powered Collectibles.</p>
      </footer>
    </div>
  );
};

export default Layout;