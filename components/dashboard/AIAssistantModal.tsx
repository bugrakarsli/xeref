"use client";

import React, { useState } from 'react';
import { X, Sparkles, Loader2, Plus } from 'lucide-react';
import { PolishTask, TaskStatus } from '@/types/agent-types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: PolishTask[]) => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onAddTasks }) => {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PolishTask[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setLoading(true);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OpenRouter API key missing");

      const prompt = `Generate 3 UI/UX polish tasks for a web app described as: "${context}". 
      Return ONLY a valid JSON array with objects containing: title, description, category (must be one of: UX, UI, Bug, Feature, Performance), impact (1=Low, 2=Medium, 3=High, 4=Critical), timeEstimate (minutes). Do not include markdown formatting or json code blocks, just raw JSON text.`;
      
      const body = {
          model: "google/gemini-2.5-flash",
          messages: [{ role: 'user', content: prompt }],
      };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Xeref Claw",
          },
          body: JSON.stringify(body),
      });
      
      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const data = await response.json();
      
      let text = data.choices[0].message.content || '[]';
      // Sometimes models return formatting despite being told not to
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const rawTasks = JSON.parse(text);
      
      const newTasks: PolishTask[] = rawTasks.map((t: any) => ({
        id: crypto.randomUUID(),
        title: t.title,
        description: t.description,
        category: t.category,
        impact: t.impact,
        timeEstimate: t.timeEstimate,
        status: TaskStatus.Todo,
        communityVotes: 0,
        createdAt: Date.now()
      }));

      setSuggestions(newTasks);
    } catch (error) {
      console.error(error);
      alert('Failed to generate tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (task: PolishTask) => {
    onAddTasks([task]);
    setSuggestions(prev => prev.filter(t => t.id !== task.id));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-down">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center gap-2 text-purple-800 dark:text-purple-400">
            <Sparkles size={18} />
            <h3 className="font-bold">AI Task Suggestions</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded text-purple-600 dark:text-purple-400"><X size={18}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Describe your project context</label>
          <div className="flex gap-2 mb-6">
            <input 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., A minimalist e-commerce dashboard"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate} 
              disabled={loading || !context.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
              Generate
            </button>
          </div>

          <div className="space-y-3">
            {suggestions.map(task => (
              <div key={task.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-500 transition-colors flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{task.category}</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{task.timeEstimate}m</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleAdd(task)}
                  className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                  title="Add Task"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
            {suggestions.length === 0 && !loading && (
              <div className="text-center text-gray-400 text-sm py-4">
                Enter context above to generate task ideas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;
