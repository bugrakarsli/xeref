'use client';

import { useState } from 'react';
import { Feature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateMasterPrompt } from '@/lib/prompt-generator';
import { Trash2, Copy, Check, Terminal, ShoppingBasket, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { saveProject } from '@/app/actions/projects';
import Link from 'next/link';

interface BasketProps {
  selectedFeatures: Feature[];
  onRemoveFeature: (feature: Feature) => void;
  onClearAll: () => void;
  isAuthenticated: boolean;
}

export function Basket({ selectedFeatures, onRemoveFeature, onClearAll, isAuthenticated }: BasketProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGenerate = () => {
    const prompt = generateMasterPrompt(selectedFeatures);
    setGeneratedPrompt(prompt);
    setShowPromptModal(true);
    setIsOpen(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setSaving(true);
    try {
      await saveProject(
        projectName.trim(),
        selectedFeatures.map(f => f.id)
      );
      toast.success(`Project "${projectName.trim()}" saved!`);
      setShowSaveModal(false);
      setProjectName('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  if (selectedFeatures.length === 0) {
    return null;
  }

  return (
    <>
      {/* Sticky Bottom Bar / Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md">
        <div className="bg-popover/80 backdrop-blur-xl border shadow-2xl rounded-full p-2 flex items-center justify-between pl-6 pr-2 gap-4">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(true)}>
               <Badge variant="secondary" className="bg-cyan-400 text-black hover:bg-cyan-400/90 rounded-full h-6 min-w-6 flex items-center justify-center p-0">
                 {selectedFeatures.length}
               </Badge>
               <span className="text-sm font-medium">Selected</span>
             </div>

             <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-destructive" onClick={onClearAll}>
                  <Trash2 size={16} />
                </Button>
                {isAuthenticated && (
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => setShowSaveModal(true)} title="Save project">
                    <Save size={16} />
                  </Button>
                )}
                <Button size="sm" className="rounded-full px-4 bg-cyan-400 text-black hover:bg-cyan-400/90" onClick={handleGenerate}>
                  Generate Prompt
                </Button>
             </div>
        </div>
      </div>

      {/* Basket Sheet (Sidebar View) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col h-full">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBasket className="text-cyan-400" />
              Your Agent Stack
            </SheetTitle>
            <SheetDescription>
              Review your {selectedFeatures.length} selected components.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6 my-4">
            <div className="space-y-3">
              {selectedFeatures.map(feature => (
                 <div key={feature.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="bg-background p-2 rounded-md border text-muted-foreground">
                       <Terminal size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-medium truncate">{feature.name}</h4>
                       <span className="text-xs text-muted-foreground capitalize">{feature.category}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onRemoveFeature(feature)}>
                      <Trash2 size={14} />
                    </Button>
                 </div>
              ))}
            </div>
          </ScrollArea>

          <SheetFooter className="pt-4 border-t mt-auto flex-wrap gap-2">
             <Button variant="outline" className="flex-1" onClick={onClearAll}>Clear All</Button>
             {isAuthenticated && (
               <Button variant="secondary" className="flex-1 gap-2" onClick={() => { setIsOpen(false); setShowSaveModal(true); }}>
                 <Save size={14} />
                 Save
               </Button>
             )}
             {!isAuthenticated && (
               <Button variant="ghost" size="sm" asChild className="w-full text-xs text-muted-foreground">
                 <Link href="/login">Sign in to save projects</Link>
               </Button>
             )}
             <Button className="flex-1 bg-cyan-400 text-black hover:bg-cyan-400/90" onClick={handleGenerate}>Generate Prompt</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Save Project Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Save your current selection of {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} as a named project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                placeholder="My Agent"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSaveModal(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !projectName.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Prompt Modal */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Ready to Build</DialogTitle>
            <DialogDescription>
              Copy this prompt and paste it into Antigravity or your AI IDE.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 bg-muted/50 rounded-md border p-4 overflow-hidden relative group">
             <pre className="h-full w-full overflow-auto text-xs sm:text-sm font-mono whitespace-pre-wrap text-muted-foreground/80 p-2">
               {generatedPrompt}
             </pre>
             <Button
               size="icon"
               className="absolute top-4 right-4 h-8 w-8 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
               onClick={handleCopy}
             >
               {copied ? <Check size={14} /> : <Copy size={14} />}
             </Button>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setShowPromptModal(false)}>Close</Button>
            <Button onClick={handleCopy} className="gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy Prompt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
