"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/usestore";
import { useVoiceSettings, clearVoiceStorage } from "@/contexts/listing-context";

/** Clears all property and agent state, then navigates to property entry for a fresh start. */
export function useResetAndNavigate() {
  const router = useRouter();
  const clearAll = usePropertyStore((s) => s.clearAll);
  const { setVoice } = useVoiceSettings();

  return useCallback(() => {
    clearAll();
    clearVoiceStorage();
    setVoice({ styleId: null, styleIntensity: 50 });
    router.replace("/property-entry");
  }, [clearAll, setVoice, router]);
}

/** Button that clears state and navigates to property entry. Use on landing page and gallery empty state. */
export function NewListingButton({
  variant = "outline",
  size = "lg",
  className,
  showArrow = false,
  children,
}: {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showArrow?: boolean;
  children?: React.ReactNode;
}) {
  const resetAndNavigate = useResetAndNavigate();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={resetAndNavigate}
    >
      {children ?? "New Listing"}
      {showArrow && <ArrowRight className="ml-2 size-5" aria-hidden />}
    </Button>
  );
}
