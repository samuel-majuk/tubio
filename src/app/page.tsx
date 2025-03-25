"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import NicheSelector from "@/components/discover/NicheSelector";
import FilterOptions from "@/components/discover/FilterOptions";
import VideoGrid from "@/components/discover/VideoGrid";
import VoiceSearchModal from "@/components/discover/VoiceSearchModal";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { searchVideos, YouTubeVideo } from "@/lib/youtube";

// Define the niches we want to display
const NICHES = ["Entertainment", "Sports", "Business", "AI", "Science"];

export default function DiscoverPage() {
  // State for managing UI and filters
  const [selectedNiche, setSelectedNiche] = useState("Entertainment");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("relevance");
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch videos when component mounts or when search/niche changes
  useEffect(() => {
    fetchVideos();
  }, [selectedNiche, searchQuery]);

  // Function to fetch random videos from all niches
  const fetchRandomVideosFromAllNiches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allVideos: YouTubeVideo[] = [];

      // Fetch videos from each niche
      for (const niche of NICHES) {
        try {
          const result = await searchVideos(
            "", // Empty search query to get random videos
            niche,
            5, // Get 5 videos from each niche
            undefined,
          );

          // Add niche property to each video
          const videosWithNiche = result.videos.map((video) => ({
            ...video,
            niche: niche as any,
          }));

          allVideos.push(...videosWithNiche);
        } catch (error) {
          console.error(`Error fetching ${niche} videos:`, error);
        }
      }

      // Shuffle the videos to randomize them
      const shuffledVideos = allVideos.sort(() => Math.random() - 0.5);

      setVideos(shuffledVideos);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch videos from YouTube API
  const fetchVideos = async (loadMore = false) => {
    // If there's a search query, use the regular search
    if (searchQuery) {
      try {
        setIsLoading(true);
        setError(null);

        const result = await searchVideos(
          searchQuery,
          selectedNiche,
          20,
          loadMore ? nextPageToken : undefined,
        );

        if (loadMore) {
          setVideos((prev) => [...prev, ...result.videos]);
        } else {
          setVideos(result.videos);
        }

        setNextPageToken(result.nextPageToken);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no search query, fetch random videos from all niches
      if (!loadMore) {
        await fetchRandomVideosFromAllNiches();
      } else {
        // If loading more, fetch more from the selected niche
        try {
          setIsLoading(true);
          setError(null);

          const result = await searchVideos(
            "",
            selectedNiche,
            20,
            nextPageToken,
          );

          setVideos((prev) => [...prev, ...result.videos]);
          setNextPageToken(result.nextPageToken);
        } catch (err) {
          console.error("Error fetching more videos:", err);
          setError("Failed to load more videos. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // Handle loading more videos
  const handleLoadMore = () => {
    if (!isLoading && nextPageToken) {
      fetchVideos(true);
    }
  };

  // Handle niche selection
  const handleNicheChange = (niche: string) => {
    setSelectedNiche(niche);
    // Reset videos when changing niche
    setVideos([]);
    setNextPageToken(undefined);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset videos when searching
    setVideos([]);
    setNextPageToken(undefined);
  };

  // Handle voice search
  const handleVoiceSearch = (query: string) => {
    handleSearch(query);
    setIsVoiceSearchOpen(false);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);

    // Sort the current videos based on the selected sort option
    const sortedVideos = [...videos].sort((a, b) => {
      switch (newSortBy) {
        case "date":
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
        case "views":
          return b.viewCount - a.viewCount;
        case "rating":
          return b.likeCount - a.likeCount;
        case "title":
          return a.title.localeCompare(b.title);
        default: // relevance - keep the order from the API
          return 0;
      }
    });

    setVideos(sortedVideos);
  };

  // Handle filter change
  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);

    // Apply filters to the current videos
    const filteredVideos = videos.filter((video) => {
      // Duration filter (in minutes)
      const durationParts = video.duration.split(":");
      let durationInMinutes = 0;

      if (durationParts.length === 3) {
        // hours:minutes:seconds
        durationInMinutes =
          parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
      } else if (durationParts.length === 2) {
        // minutes:seconds
        durationInMinutes = parseInt(durationParts[0]);
      }

      if (
        durationInMinutes < filters.duration[0] ||
        durationInMinutes > filters.duration[1]
      ) {
        return false;
      }

      // View count filter
      if (video.viewCount < filters.minViews) {
        return false;
      }

      // Like count filter
      if (video.likeCount < filters.minLikes) {
        return false;
      }

      // Comment count filter
      if (video.commentCount < filters.minComments) {
        return false;
      }

      // Upload date filter
      if (filters.uploadDate !== "any") {
        const videoDate = new Date(video.publishedAt);
        const now = new Date();

        switch (filters.uploadDate) {
          case "today":
            if (
              videoDate.getDate() !== now.getDate() ||
              videoDate.getMonth() !== now.getMonth() ||
              videoDate.getFullYear() !== now.getFullYear()
            ) {
              return false;
            }
            break;
          case "week":
            const oneWeekAgo = new Date(
              now.getTime() - 7 * 24 * 60 * 60 * 1000,
            );
            if (videoDate < oneWeekAgo) {
              return false;
            }
            break;
          case "month":
            if (
              videoDate.getMonth() !== now.getMonth() ||
              videoDate.getFullYear() !== now.getFullYear()
            ) {
              return false;
            }
            break;
          case "year":
            if (videoDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
            break;
        }
      }

      return true;
    });

    setVideos(filteredVideos);
  };

  // Handle video click
  const handleVideoClick = (videoId: string) => {
    console.log(`Video clicked: ${videoId}`);
    // Open video in a new tab
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  // Handle video save
  const handleVideoSave = (videoId: string) => {
    console.log(`Video saved: ${videoId}`);
    // In a real app, this would save to user's profile or local storage
    // For now, just toggle the saved state in the UI
    setVideos(
      videos.map((video) =>
        video.id === videoId ? { ...video, isSaved: !video.isSaved } : video,
      ),
    );
  };

  // Toggle voice search modal
  const toggleVoiceSearch = () => {
    setIsVoiceSearchOpen(!isVoiceSearchOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header with search */}
      <Header onSearch={handleSearch} />

      {/* Main content */}
      <main className="flex-1 pb-20">
        {" "}
        {/* Increased bottom padding for the sticky nav */}
        {/* Niche selector */}
        <NicheSelector
          selectedNiche={selectedNiche}
          onNicheChange={handleNicheChange}
        />
        {/* Filter options with voice search button */}
        <div className="flex flex-col">
          <FilterOptions
            onSortChange={handleSortChange}
            onViewChange={setCurrentView}
            onFilterChange={handleFilterChange}
            currentView={currentView}
          />
          <div className="flex justify-center -mt-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceSearch}
              className="rounded-full flex items-center gap-2 bg-primary/5 hover:bg-primary/10"
            >
              <span className="text-sm">Search with voice</span>
            </Button>
          </div>
        </div>
        {/* Video grid */}
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => fetchVideos()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <VideoGrid
            videos={videos}
            layout={currentView}
            selectedNiche={selectedNiche as any}
            isLoading={isLoading}
            hasMore={!!nextPageToken}
            onLoadMore={handleLoadMore}
            onVideoClick={handleVideoClick}
            onVideoSave={handleVideoSave}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNavigation activeItem="discover" />

      {/* Voice search modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearch={handleVoiceSearch}
      />
    </div>
  );
}
