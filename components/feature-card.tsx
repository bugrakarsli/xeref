'use client';

import { Feature, FeatureDifficulty } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  feature: Feature;
  isSelected: boolean;
  onToggle: (feature: Feature) => void;
}

const difficultyColors: Record<FeatureDifficulty, string> = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  advanced: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export function FeatureCard({ feature, isSelected, onToggle }: FeatureCardProps) {
  // The feature.icon property is a string that corresponds to a Lucide icon name.
  // We dynamically access the icon component from the LucideIcons module.
  // The 'as any' cast is used here because TypeScript cannot statically verify
  // that a string property will always match a key in the LucideIcons object.
  // This is a common pattern for dynamic component loading based on string names.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative h-full flex flex-col transition-all duration-200 cursor-pointer overflow-hidden border-2",
          isSelected 
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
            : "border-border/50 hover:border-primary/50 hover:bg-accent/5"
        )}
        onClick={() => onToggle(feature)}
      >
        <div className="absolute top-3 right-3 flex gap-2">
           <Badge variant="outline" className={cn("text-xs font-mono uppercase tracking-wider", difficultyColors[feature.difficulty])}>
            {feature.difficulty}
          </Badge>
        </div>

        <CardHeader className="pb-2">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <IconComponent size={20} />
          </div>
          <CardTitle className="text-lg leading-tight">{feature.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm mt-1.5 h-10">
            {feature.description}
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="mt-auto pt-4 flex gap-2 justify-between">
           <div className="flex gap-1 flex-wrap">
             {feature.tags.slice(0, 2).map((tag) => (
               <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5 text-muted-foreground">
                 #{tag}
               </Badge>
             ))}
           </div>
           
           <div className={cn(
             "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
             isSelected 
              ? "bg-primary border-primary text-primary-foreground scale-110" 
              : "border-muted-foreground/30 text-transparent"
           )}>
             <Check size={14} strokeWidth={3} />
           </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
