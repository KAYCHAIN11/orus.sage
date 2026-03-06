'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

interface StreamingResponseProps {
  content: string;
  isStreaming?: boolean;
  onComplete?: () => void;
}

export const StreamingResponse: React.FC<StreamingResponseProps> = ({
  content,
  isStreaming = false,
  onComplete,
}) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, 20);

    return () => clearInterval(timer);
  }, [content, isStreaming, onComplete]);

  return (
    <div
      className="px-4 py-3 rounded-lg rounded-bl-none"
      style={{
        backgroundColor: orusGreenWhiteTheme.secondary[500],
        color: orusGreenWhiteTheme.secondary[900],
      }}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {displayedContent}
        {isStreaming && <span className="animate-pulse">|</span>}
      </p>
    </div>
  );
};
