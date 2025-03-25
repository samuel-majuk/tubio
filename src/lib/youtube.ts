export interface YouTubeVideo {
  id: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  publishedAt: string;
  niche: "Entertainment" | "Sports" | "Business" | "AI" | "Science";
}

// Function to search videos based on query and niche
export async function searchVideos(
  query: string = "",
  niche: string = "Entertainment",
  maxResults: number = 20,
  pageToken?: string,
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  try {
    // Combine query with niche if both are provided
    const searchQuery = query
      ? `${query} ${niche !== "All" ? niche : ""}`
      : niche !== "All"
        ? niche
        : "";

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    // Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}${pageToken ? `&pageToken=${pageToken}` : ""}${getCategoryIdForNiche(niche) ? `&videoCategoryId=${getCategoryIdForNiche(niche)}` : ""}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return { videos: [] };
    }

    // Get video IDs
    const videoIds = searchData.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean) as string[];

    // Get detailed video information
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosData.items) {
      return { videos: [] };
    }

    // Map response to our video format
    const videos = videosData.items.map((item: any) => {
      const snippet = item.snippet || {};
      const statistics = item.statistics || {};
      const contentDetails = item.contentDetails || {};

      return {
        id: item.id || "",
        title: snippet.title || "",
        channelName: snippet.channelTitle || "",
        channelAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${snippet.channelTitle || "channel"}`,
        thumbnailUrl:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.default?.url ||
          "",
        viewCount: parseInt(statistics.viewCount || "0", 10),
        likeCount: parseInt(statistics.likeCount || "0", 10),
        commentCount: parseInt(statistics.commentCount || "0", 10),
        duration: formatDuration(contentDetails.duration || ""),
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        niche: mapCategoryToNiche(snippet.categoryId),
      };
    });

    return {
      videos,
      nextPageToken: searchData.nextPageToken,
    };
  } catch (error) {
    console.error("Error searching videos:", error);
    return { videos: [] };
  }
}

// Function to get search suggestions
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    // YouTube doesn't have an official API for search suggestions
    // This is a workaround using a public API that Google uses for their search box
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`,
      { mode: "cors" },
    );

    if (!response.ok) return [];

    const data = await response.json();
    // The response format is typically [query, [suggestions]]
    return data[1] || [];
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return [];
  }
}

// Helper function to format ISO 8601 duration to readable format
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0:00";

  const hours = match[1] ? parseInt(match[1].replace("H", ""), 10) : 0;
  const minutes = match[2] ? parseInt(match[2].replace("M", ""), 10) : 0;
  const seconds = match[3] ? parseInt(match[3].replace("S", ""), 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Helper function to map YouTube category ID to our niche categories
function mapCategoryToNiche(
  categoryId?: string,
): "Entertainment" | "Sports" | "Business" | "AI" | "Science" {
  if (!categoryId) return "Entertainment";

  const id = parseInt(categoryId, 10);

  // YouTube category IDs: https://developers.google.com/youtube/v3/docs/videoCategories
  switch (id) {
    case 17: // Sports
      return "Sports";
    case 20: // Gaming
    case 24: // Entertainment
      return "Entertainment";
    case 28: // Science & Technology
      return "Science";
    case 22: // People & Blogs
    case 27: // Education
      return "AI"; // Closest match for AI content
    case 19: // Travel & Events
    case 25: // News & Politics
      return "Business"; // Closest match for business content
    default:
      return "Entertainment";
  }
}

// Helper function to get YouTube category ID for a niche
function getCategoryIdForNiche(niche: string): string | undefined {
  switch (niche) {
    case "Sports":
      return "17";
    case "Entertainment":
      return "24";
    case "Science":
      return "28";
    case "AI":
      return "27"; // Education - closest match
    case "Business":
      return "25"; // News & Politics - closest match
    default:
      return undefined;
  }
}
