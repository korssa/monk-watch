"use client";

import { useEffect, useState } from 'react';

export function GoogleTranslateWidget() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 서버 사이드에서는 렌더링하지 않음
  if (!isClient) {
    return <div className="translate-widget-horizontal flex-shrink-0 w-32 h-8 bg-white/20 rounded animate-pulse"></div>;
  }

  return (
    <div 
      id="google_translate_element" 
      className="translate-widget-horizontal flex-shrink-0"
      suppressHydrationWarning={true}
    />
  );
}
