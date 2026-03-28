'use client';

import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 py-4 sticky top-[60px] z-30 bg-background/80 backdrop-blur-md border-b mb-6 w-full overflow-x-auto no-scrollbar">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(null)}
        className={cn("rounded-full", selectedCategory === null ? "bg-cyan-400 text-black hover:bg-cyan-400/90 border-cyan-400" : "")}
      >
        All
      </Button>
      {categories.map((category) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = (LucideIcons as any)[category.icon] || LucideIcons.Circle;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "rounded-full gap-1.5 transition-all",
              isSelected ? "bg-cyan-400 text-black hover:bg-cyan-400/90 border-cyan-400" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={14} className={cn(isSelected ? "text-black" : category.color)} />
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}
