'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function ClipCardSkeleton() {
  return (
    <Card className="group relative cursor-pointer hover:shadow-md transition-shadow animate-pulse gpu-accelerated">
      <CardContent className="p-4">
        <div className="h-5 bg-muted rounded mb-2 w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted/50 rounded"></div>
          <div className="h-4 bg-muted/50 rounded w-5/6"></div>
          <div className="h-4 bg-muted/50 rounded w-4/6"></div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-muted rounded w-16"></div>
          <div className="h-4 bg-muted/50 rounded w-20"></div>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ClipGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ClipCardSkeleton key={i} />
      ))}
    </div>
  );
}
