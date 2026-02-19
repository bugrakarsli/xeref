'use client';

import { Feature } from '@/lib/types';
import { FeatureCard } from './feature-card';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureGridProps {
  features: Feature[];
  selectedFeatureIds: Set<string>;
  onToggleFeature: (feature: Feature) => void;
}

export function FeatureGrid({ features, selectedFeatureIds, onToggleFeature }: FeatureGridProps) {
  if (features.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <p className="text-lg">No features found matching criteria.</p>
        <p className="text-sm">Try clearing search or filters.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24"
      layout
    >
      <AnimatePresence mode='popLayout'>
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            isSelected={selectedFeatureIds.has(feature.id)}
            onToggle={onToggleFeature}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
