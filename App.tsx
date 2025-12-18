
import React, { useState, useEffect } from 'react';
import { Message, Persona } from './types';
import { DEFAULT_PERSONAS, MODELS, STORAGE_KEYS } from './constants';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(DEFAULT_PERSONAS[0].id);
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);

  // Load from local storage
  useEffect(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const storedPersonas = localStorage.getItem(STORAGE_KEYS.PERSONAS);
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (storedMessages) setMessages(JSON.parse(storedMessages));
    if (storedPersonas) setPersonas(JSON.parse(storedPersonas));
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      if (settings.model) setSelectedModel(settings.model);
      if (settings.personaId) setSelectedPersonaId(settings.personaId);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      model: selectedModel,
      personaId: selectedPersonaId
    }));
  }, [selectedModel, selectedPersonaId]);

  const handleAddPersona = (p: Persona) => {
    setPersonas(prev => [...prev, p]);
    setSelectedPersonaId(p.id);
  };

  const handleDeletePersona = (id: string) => {
    if (personas.length <= 1) return;
    setPersonas(prev => prev.filter(p => p.id !== id));
    if (selectedPersonaId === id) {
      setSelectedPersonaId(personas.find(p => p.id !== id)?.id || '');
    }
  };

  const exportSession = () => {
    const sessionData = {
      messages,
      settings: {
        model: selectedModel,
        personaId: selectedPersonaId,
        persona: personas.find(p => p.id === selectedPersonaId)
      },
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-session-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSession = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.messages) setMessages(data.messages);
        if (data.settings?.model) setSelectedModel(data.settings.model);
        if (data.settings?.personaId) setSelectedPersonaId(data.settings.personaId);
        // Alert user of success (optional)
      } catch (err) {
        alert('Failed to import session: Invalid JSON format');
      }
    };
    reader.readAsText(file);
  };

  const activePersona = personas.find(p => p.id === selectedPersonaId);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar 
        personas={personas}
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={setSelectedPersonaId}
        onAddPersona={handleAddPersona}
        onDeletePersona={handleDeletePersona}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onExport={exportSession}
        onImport={importSession}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatInterface 
          messages={messages}
          setMessages={setMessages}
          selectedModel={selectedModel}
          systemInstruction={activePersona?.instruction}
        />
      </main>
    </div>
  );
};

export default App;
