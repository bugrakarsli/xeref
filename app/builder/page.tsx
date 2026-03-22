'use client';

import { useState, useMemo, useEffect } from 'react';
import { features, categories } from '@/lib/features';
import { Feature } from '@/lib/types';
import { CategoryFilter } from '@/components/category-filter';
import { FeatureGrid } from '@/components/feature-grid';
import { Basket } from '@/components/basket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XerefLogo } from '@/components/xeref-logo';
import { Search, ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';


export default function BuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);

  // Resolve auth state once on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.info('Signed out');
  };

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
         <div className="container flex h-20 items-center justify-between mx-auto px-4">
           {/* Left: Branding */}
           <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
             <XerefLogo className="h-8 w-8" />
             <span className="hidden sm:inline">xeref.ai</span>
           </Link>

           {/* Center: Search Bar */}
           <div className="flex-1 max-w-xl px-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
               <Input
                 type="search"
                 placeholder="Search capabilities (e.g., Telegram, Memory, Vision)..."
                 className="pl-10 h-11 w-full bg-muted/30 border-2 focus-visible:border-primary/50 focus-visible:bg-background transition-all text-base rounded-xl"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>

           {/* Right: Auth + Back */}
           <div className="flex items-center gap-2">
             {user ? (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleSignOut}
                 className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground"
               >
                 <LogOut className="h-4 w-4" />
                 Sign out
               </Button>
             ) : (
               <Button variant="ghost" size="sm" asChild className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground">
                 <Link href="/login">
                   <LogIn className="h-4 w-4" />
                   Sign in
                 </Link>
               </Button>
             )}
             <Button variant="ghost" size="sm" asChild className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground">
               <Link href="/">
                 <ArrowLeft className="h-4 w-4" />
                 Back to Homepage
               </Link>
             </Button>
             {/* Small screen back icon */}
             <Button variant="ghost" size="icon" asChild className="md:hidden">
               <Link href="/">
                 <ArrowLeft className="h-5 w-5" />
               </Link>
             </Button>
           </div>
         </div>

         <div className="container mx-auto px-4 pb-2">
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
         isAuthenticated={!!user}
       />
    </div>
  );
}
