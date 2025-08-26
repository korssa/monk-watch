"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ko" : "en");
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="h-8 px-3 text-white hover:bg-white/20 font-bold text-base flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      {language === "en" ? "KR" : "EN"}
    </Button>
  );
}
