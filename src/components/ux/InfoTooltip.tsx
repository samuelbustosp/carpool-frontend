"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";

export default function InfoTooltip({ text }: { text: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const icon = (
    <Info size={18} className="text-gray-11 cursor-pointer" />
  );

  // Mobile → Popover
  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="rounded-full">{icon}</button>
        </PopoverTrigger>
        <PopoverContent className="bg-gray-8 text-white text-sm font-light rounded-md px-3 py-2 shadow-lg">
          {text}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
      <button type="button" className=" rounded-full">
        {icon}
      </button>
      </TooltipTrigger>
      <TooltipContent className="bg-gray-8 text-white rounded-md px-3 py-2 shadow-lg" side="top">{text}</TooltipContent>
    </Tooltip>
  );
}
