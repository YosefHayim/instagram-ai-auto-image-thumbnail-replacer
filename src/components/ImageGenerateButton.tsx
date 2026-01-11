import React from "react";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGenerateButtonProps {
  postId: string;
  imageUrl: string;
  onClick: (postId: string, imageUrl: string) => void;
  isProcessing?: boolean;
}

export function ImageGenerateButton({
  postId,
  imageUrl,
  onClick,
  isProcessing = false,
}: ImageGenerateButtonProps) {
  console.log("🔘 [GenerateButton] Rendering button for post:", postId);

  // Use native DOM event listener to ensure we capture the click
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Aggressive event handler that prevents all propagation
  const stopAllEvents = React.useCallback((e: Event | React.SyntheticEvent) => {
    console.log("🔘 [GenerateButton] Stopping event:", e.type);
    e.preventDefault();
    e.stopPropagation();
    if ('stopImmediatePropagation' in e) {
      e.stopImmediatePropagation();
    }
    if ('nativeEvent' in e && e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    return false;
  }, []);

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    console.log("🔘 [GenerateButton] React CLICKED! postId:", postId);
    console.log("🔘 [GenerateButton] onClick function exists:", !!onClick);
    console.log("🔘 [GenerateButton] onClick type:", typeof onClick);
    stopAllEvents(e);
    try {
      onClick(postId, imageUrl);
      console.log("🔘 [GenerateButton] onClick callback executed successfully");
    } catch (err) {
      console.error("🔘 [GenerateButton] onClick callback ERROR:", err);
    }
  }, [postId, imageUrl, onClick, stopAllEvents]);

  React.useEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      console.log("🔘 [GenerateButton] Button ref is null!");
      return;
    }

    console.log("🔘 [GenerateButton] Setting up native event listeners for post:", postId);

    const handleNativeClick = (e: MouseEvent) => {
      console.log("🔘 [GenerateButton] Native click captured!");
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      onClick(postId, imageUrl);
      return false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      console.log("🔘 [GenerateButton] Pointer down captured!");
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      console.log("🔘 [GenerateButton] Mouse down captured!");
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Add listeners in capture phase to intercept before Instagram's handlers
    button.addEventListener('click', handleNativeClick, true);
    button.addEventListener('pointerdown', handlePointerDown, true);
    button.addEventListener('mousedown', handleMouseDown, true);

    // Also add in bubble phase as backup
    button.addEventListener('click', handleNativeClick, false);

    return () => {
      button.removeEventListener('click', handleNativeClick, true);
      button.removeEventListener('pointerdown', handlePointerDown, true);
      button.removeEventListener('mousedown', handleMouseDown, true);
      button.removeEventListener('click', handleNativeClick, false);
    };
  }, [postId, imageUrl, onClick]);

  // Position button as a tag on the top-left, partially outside the image
  return (
    <button
      ref={buttonRef}
      data-ai-generate-btn={postId}
      style={{
        position: 'absolute',
        top: '8px',
        left: '-12px', // Half outside the image
        zIndex: 999999,
        pointerEvents: 'auto',
        isolation: 'isolate',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px 6px 8px',
        background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
        borderRadius: '0 20px 20px 0', // Rounded on right side only (tag style)
        color: 'white',
        fontSize: '12px',
        fontWeight: '700',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        border: 'none',
        boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4), 0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: isProcessing ? 0.6 : 1,
      }}
      onClick={handleClick}
      onMouseDown={(e) => stopAllEvents(e)}
      onPointerDown={(e) => stopAllEvents(e)}
      onTouchStart={(e) => stopAllEvents(e)}
      disabled={isProcessing}
      onMouseEnter={(e) => {
        if (!isProcessing) {
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(147, 51, 234, 0.5), 0 3px 6px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4), 0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      {isProcessing ? (
        <div
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : (
        <Wand2 style={{ width: '14px', height: '14px' }} />
      )}
      <span>{isProcessing ? "..." : "AI"}</span>
    </button>
  );
}
