'use client';

import { useState } from 'react';
import { Feature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateMasterPrompt } from '@/lib/prompt-generator';
import { Trash2, Copy, Check, Terminal, ShoppingBasket } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea'; // Missing component, unused.

interface BasketProps {
  selectedFeatures: Feature[];
  onRemoveFeature: (feature: Feature) => void;
  onClearAll: () => void;
}

export function Basket({ selectedFeatures, onRemoveFeature, onClearAll }: BasketProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

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

  if (selectedFeatures.length === 0) {
    return null;
  }

  return (
    <>
      {/* Sticky Bottom Bar / Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md">
        <div className="bg-popover/80 backdrop-blur-xl border shadow-2xl rounded-full p-2 flex items-center justify-between pl-6 pr-2 gap-4">
             <div className="flex items-center gap-2" onClick={() => setIsOpen(true)}>
               <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-6 min-w-6 flex items-center justify-center p-0">
                 {selectedFeatures.length}
               </Badge>
               <span className="text-sm font-medium">Selected</span>
             </div>
             
             <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-destructive" onClick={onClearAll}>
                  <Trash2 size={16} />
                </Button>
                <Button size="sm" className="rounded-full px-4" onClick={handleGenerate}>
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
              <ShoppingBasket className="text-primary" />
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
                       {/* Icon placeholder or dynamic */}
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

          <SheetFooter className="pt-4 border-t mt-auto">
             <Button variant="outline" className="w-full sm:w-auto" onClick={onClearAll}>Clear All</Button>
             <Button className="w-full sm:w-auto" onClick={handleGenerate}>Generate Prompt</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
