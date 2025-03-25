"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ThumbsUp, MessageCircle, Eye, Clock, Bookmark } from "lucide-react";

interface VideoCardProps {
  id?: string;
  title?: string;
  channelName?: string;
  channelAvatar?: string;
  thumbnailUrl?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: string;
  publishedAt?: string;
  niche?: "Entertainment" | "Sports" | "Business" | "AI" | "Science";
  onClick?: () => void;
  isSaved?: boolean;
  onSave?: () => void;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

const VideoCard = ({
  id = "video123",
  title = "How to Build a Next.js Application with Tailwind CSS",
  channelName = "Web Dev Tutorials",
  channelAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=webdev",
  thumbnailUrl = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  viewCount = 254000,
  likeCount = 15300,
  commentCount = 1240,
  duration = "12:34",
  publishedAt = "2023-06-15T14:30:00Z",
  niche = "AI",
  onClick = () => {},
  isSaved = false,
  onSave = () => {},
}: VideoCardProps) => {
  return (
    <Card
      className="overflow-hidden transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800 w-full max-w-sm"
      onClick={onClick}
    >
      <div className="relative">
        <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
        </div>
        <Badge
          className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/70"
          variant="secondary"
        >
          {duration}
        </Badge>
        <Badge
          className="absolute top-2 left-2"
          variant="outline"
          style={{
            backgroundColor:
              niche === "Entertainment"
                ? "rgba(239, 68, 68, 0.9)"
                : niche === "Sports"
                  ? "rgba(16, 185, 129, 0.9)"
                  : niche === "Business"
                    ? "rgba(59, 130, 246, 0.9)"
                    : niche === "AI"
                      ? "rgba(139, 92, 246, 0.9)"
                      : "rgba(245, 158, 11, 0.9)",
            color: "white",
          }}
        >
          {niche}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={channelAvatar} alt={channelName} />
            <AvatarFallback>{channelName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-base line-clamp-2 mb-1 text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {channelName}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{formatCount(viewCount)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{viewCount.toLocaleString()} views</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{formatCount(likeCount)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{likeCount.toLocaleString()} likes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{formatCount(commentCount)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{commentCount.toLocaleString()} comments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(publishedAt)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Published on {new Date(publishedAt).toLocaleDateString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  className="ml-2"
                >
                  <Bookmark
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isSaved
                        ? "fill-current text-blue-500"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSaved ? "Saved" : "Save for later"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
