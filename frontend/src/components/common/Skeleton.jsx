import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-700 ${className}`} />
);

export const SkeletonCircle = ({ className = "h-24 w-24" }) => (
  <div className={`animate-pulse rounded-full bg-gray-700 ${className}`} />
);

export const TableSkeletonRows = ({ columns = 6, rows = 8 }) =>
  Array.from({ length: rows }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      {Array.from({ length: columns }).map((_, cellIndex) => (
        <td key={`${rowIndex}-${cellIndex}`} className="px-6 py-4">
          <Skeleton
            className={`h-4 ${cellIndex === 0 ? "w-8" : "w-3/4"}`}
          />
        </td>
      ))}
    </tr>
  ));

export const FormSkeleton = ({ fields = 9, columns = 3 }) => {
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-3";

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <SkeletonCircle className="h-48 w-48 sm:h-56 sm:w-56 md:h-72 md:w-72 justify-self-center" />
    <div className="space-y-5">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="grid grid-cols-2 gap-12">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  </div>
);
