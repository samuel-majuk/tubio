import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const VideoSkeleton = () => {
  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 w-full max-w-sm">
      <div className="relative">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="absolute bottom-2 right-2 h-5 w-12" />
        <Skeleton className="absolute top-2 left-2 h-5 w-20" />
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default VideoSkeleton;
