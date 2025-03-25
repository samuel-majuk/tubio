"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface NicheSelectorProps {
  selectedNiche?: string;
  onNicheChange?: (niche: string) => void;
}

const NicheSelector = ({
  selectedNiche = "Entertainment",
  onNicheChange = () => {},
}: NicheSelectorProps) => {
  const niches = [
    "Entertainment",
    "Sports",
    "Business",
    "Artificial Intelligence",
    "Science",
  ];

  const [activeNiche, setActiveNiche] = useState(selectedNiche);

  const handleNicheSelect = (niche: string) => {
    setActiveNiche(niche);
    onNicheChange(niche);
  };

  return (
    <div className="w-full bg-background border-b">
      <ScrollArea className="w-full py-4">
        <div className="flex items-center px-4 md:px-6 space-x-4">
          {niches.map((niche) => (
            <Button
              key={niche}
              variant={activeNiche === niche ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap",
                activeNiche === niche
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary",
              )}
              onClick={() => handleNicheSelect(niche)}
            >
              {niche}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default NicheSelector;
