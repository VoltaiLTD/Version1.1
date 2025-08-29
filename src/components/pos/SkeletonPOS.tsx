import React from 'react';
import { Card } from '../ui/Card';

export default function SkeletonPOS() {
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-4">
            <div className="h-6 bg-neutral-200 rounded animate-pulse"></div>
          </Card>
          
          <Card className="p-6">
            <div className="space-y-3">
              <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div className="h-12 bg-neutral-200 rounded animate-pulse"></div>
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2"></div>
            </div>
          </Card>
          
          <div className="space-y-3">
            <div className="h-12 bg-neutral-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-neutral-200 rounded-lg animate-pulse"></div>
              <div className="h-10 bg-neutral-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="h-6 bg-neutral-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="h-6 bg-neutral-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}