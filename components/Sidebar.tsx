
import React, { useState } from 'react';
import { User, Plus, Trash2, Settings, Download, Upload, Cpu } from 'lucide-react';
import { Persona } from '../types';
import { MODELS } from '../constants';

interface SidebarProps {
  personas: Persona[];
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
  onAddPersona: (p: Persona) => void;
  onDeletePersona: (id: string) => void;
  selectedModel: string;
  onSelectModel: (m: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  personas,
  selectedPersonaId,
  onSelectPersona,
  onAddPersona,
  onDeletePersona,
  selectedModel,
  onSelectModel,
  onExport,
  onImport
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPersona, setNewPersona] = useState({ name: '', instruction: '', description: '' });

  const handleAdd = () => {
    if (newPersona.name && newPersona.instruction) {
      onAddPersona({
        id: Date.now().toString(),
        ...newPersona
      });
      setNewPersona({ name: '', instruction: '', description: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="w-80 h-full border-r border-zinc-800 bg-zinc-900 flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Gemini Client</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Model Selection */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">Model Configuration</label>
          <select 
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-sm rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Persona Library */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Persona Library</label>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {personas.map((p) => (
              <div 
                key={p.id}
                onClick={() => onSelectPersona(p.id)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  selectedPersonaId === p.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{p.name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeletePersona(p.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persistence Controls */}
      <div className="pt-6 border-t border-zinc-800 space-y-2">
        <button 
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Session
        </button>
        <label className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-sm font-medium cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          Import Session
          <input type="file" className="hidden" accept=".json" onChange={onImport} />
        </label>
      </div>

      {/* Add Persona Modal Placeholder/Simple form */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Create New Persona</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Name</label>
                <input 
                  type="text" 
                  value={newPersona.name}
                  onChange={e => setNewPersona({...newPersona, name: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Code Reviewer"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <input 
                  type="text" 
                  value={newPersona.description}
                  onChange={e => setNewPersona({...newPersona, description: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Briefly describe the role"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">System Instruction</label>
                <textarea 
                  value={newPersona.instruction}
                  onChange={e => setNewPersona({...newPersona, instruction: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Detailed behavioral instructions..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 p-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Save Persona
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
