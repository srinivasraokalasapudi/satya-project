import React from "react";

// A single pulsing placeholder block. Compose these to match the shape
// of whatever real content is loading, so the layout doesn't jump once
// data arrives (and the screen doesn't sit blank/frozen in the meantime).
const Skeleton = ({ className = "" }) => (
  <div className={`bg-[#2a2a2a] rounded-md animate-pulse ${className}`} />
);

// Mimics an OrderCard's shape: header row, a couple of item lines, a
// footer row of status buttons.
export const OrderCardSkeleton = () => (
  <div className="bg-[#262626] rounded-xl p-4 sm:p-6">
    <div className="flex justify-between gap-3 mb-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-16" />
    </div>
    <Skeleton className="h-4 w-1/2 mb-2" />
    <Skeleton className="h-4 w-2/3 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 flex-1" />
    </div>
  </div>
);

// Mimics a TableCard: a number, a status pill, a couple of detail lines.
export const TableCardSkeleton = () => (
  <div className="bg-[#262626] rounded-xl p-4 sm:p-6 flex flex-col gap-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-12" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-9 w-full" />
  </div>
);

export default Skeleton;
