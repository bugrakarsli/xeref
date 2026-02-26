'use client';

import { useState, useMemo } from 'react';
import { features, categories } from '@/lib/features';
import { Feature } from '@/lib/types';
import { CategoryFilter } from '@/components/category-filter';
import { FeatureGrid } from '@/components/feature-grid';
import { Basket } from '@/components/basket';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set());

  // Derived state for basket
  const selectedFeatures = Array.from(selectedFeatureIds)
    .map(id => features.find(f => f.id === id))
    .filter((f): f is Feature => !!f);

  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const matchesCategory = selectedCategory ? feature.category === selectedCategory : true;
      const matchesSearch = 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFeature = (feature: Feature) => {
    const newSelected = new Set(selectedFeatureIds);
    if (newSelected.has(feature.id)) {
      newSelected.delete(feature.id);
      toast.info(`Removed ${feature.name}`, { duration: 1500 });
    } else {
      newSelected.add(feature.id);
      toast.success(`added ${feature.name}`, { duration: 1500 });
    }
    setSelectedFeatureIds(newSelected);
  };

  const removeFeature = (feature: Feature) => {
    const newSelected = new Set(selectedFeatureIds);
    newSelected.delete(feature.id);
    setSelectedFeatureIds(newSelected);
  };

  const clearAll = () => {
    setSelectedFeatureIds(new Set());
    toast.message('Basket cleared');
  };

  return (
    <div className="min-h-screen bg-background relative pb-32">
       {/* Search Bar Header */}
       <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mx-auto px-4">
           <div className="flex gap-6 md:gap-10">
             <span className="font-bold inline-block">Xeref-Claw</span>
           </div>
           
           <div className="flex-1 sm:grow-0 w-full max-w-sm">
             <div className="relative">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 type="search"
                 placeholder="Search capabilities..."
                 className="pl-9 h-9 w-full bg-muted/50 focus-visible:bg-background transition-colors"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>
         </div>
         
         <div className="container mx-auto px-4">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
         </div>
       </header>

       <main className="container mx-auto px-4 py-6">
         <FeatureGrid
           features={filteredFeatures}
           selectedFeatureIds={selectedFeatureIds}
           onToggleFeature={toggleFeature}
         />
       </main>

       <Basket
         selectedFeatures={selectedFeatures}
         onRemoveFeature={removeFeature}
         onClearAll={clearAll}
       />
    </div>
  );
}
