import React, { useState } from 'react';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceList from './pages/InvoiceList';
import ConfigPage from './pages/ConfigPage';
import { FileText, List, Settings } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header Premium */}
      <header className="glass border-b border-white/20 sticky top-0 z-50 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-2.5 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 animate-pulse-glow">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">NFe Manager</h1>
                <p className="text-xs text-gray-500 font-medium">Sistema de Emissão de Notas Fiscais</p>
              </div>
            </div>

            <nav className="flex gap-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`tab-button group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeView === 'dashboard'
                  ? 'active bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-700 hover:bg-white/90 hover:shadow-lg bg-white/60'
                  }`}
              >
                <List className={`h-5 w-5 transition-transform duration-300 ${activeView === 'dashboard' ? 'rotate-0' : 'group-hover:rotate-12'}`} />
                <span className="relative">
                  Dashboard
                  {activeView === 'dashboard' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></span>
                  )}
                </span>
                {activeView === 'dashboard' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-xl animate-shimmer"></div>
                )}
              </button>

              <button
                onClick={() => setActiveView('nova-nota')}
                className={`tab-button group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeView === 'nova-nota'
                  ? 'active bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-700 hover:bg-white/90 hover:shadow-lg bg-white/60'
                  }`}
              >
                <FileText className={`h-5 w-5 transition-transform duration-300 ${activeView === 'nova-nota' ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="relative">
                  Nova Nota
                  {activeView === 'nova-nota' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></span>
                  )}
                </span>
                {activeView === 'nova-nota' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent rounded-xl animate-shimmer"></div>
                )}
              </button>

              <button
                onClick={() => setActiveView('config')}
                className={`tab-button group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeView === 'config'
                  ? 'active bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white shadow-lg shadow-pink-500/50'
                  : 'text-gray-700 hover:bg-white/90 hover:shadow-lg bg-white/60'
                  }`}
              >
                <Settings className={`h-5 w-5 transition-transform duration-500 ${activeView === 'config' ? 'rotate-180' : 'group-hover:rotate-90'}`} />
                <span className="relative">
                  Configuração
                  {activeView === 'config' && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></span>
                  )}
                </span>
                {activeView === 'config' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-transparent rounded-xl animate-shimmer"></div>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {activeView === 'dashboard' && <InvoiceList />}
        {activeView === 'nova-nota' && <InvoiceForm />}
        {activeView === 'config' && <ConfigPage />}
      </main>

      {/* Footer Premium */}
      <footer className="mt-auto py-8 border-t border-gray-200 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">© 2025 NFe Manager. Todos os direitos reservados.</p>
              <p className="text-xs text-gray-500 mt-1">Sistema de Emissão de Notas Fiscais Eletrônicas</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-semibold text-green-700">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
