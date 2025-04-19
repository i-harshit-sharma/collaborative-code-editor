"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// Simple utility function to merge class names.
function mergeClassNames(defaultClasses, customClass) {
  return customClass ? `${defaultClasses} ${customClass}` : defaultClasses;
}

// Create a React Context to share the popover state and trigger ref.
const PopoverContext = React.createContext();

/**
 * Popover
 *
 * Provides state and positioning for its children.
 */
function Popover({ children, ...props }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {/* The container is relative so we can use absolute positioning when desired */}
      <div {...props} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

/**
 * PopoverTrigger
 *
 * Renders the element that toggles the popover open and closed.
 */
function PopoverTrigger({ children, ...props }) {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext);
  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * PopoverContent
 *
 * Renders the actual popover content. It positions itself relative to the trigger.
 * Uses a portal to render into document.body.
 */
function PopoverContent({
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  const { open, triggerRef } = React.useContext(PopoverContext);
  const contentRef = React.useRef(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  // Calculate position relative to trigger (using basic alignment logic)
  React.useEffect(() => {
    function updatePosition() {
      if (triggerRef.current && contentRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        let left;
        if (align === "center") {
          left =
            triggerRect.left +
            triggerRect.width / 2 -
            contentRect.width / 2;
        } else if (align === "start") {
          left = triggerRect.left;
        } else if (align === "end") {
          left = triggerRect.left + triggerRect.width - contentRect.width;
        }
        setPosition({
          top: triggerRect.bottom + sideOffset + window.scrollY,
          left: left + window.scrollX,
        });
      }
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, align, sideOffset, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{ position: "absolute", top: position.top, left: position.left }}
      className={mergeClassNames(
        // Default Tailwind classes – feel free to adjust for animations and color
        "bg-white text-black z-50 w-72 rounded-md border p-4 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

/**
 * PopoverAnchor
 *
 * A simple wrapper if you need to designate a separate anchor element.
 * (In this basic implementation, the trigger already serves as the anchor.)
 */
function PopoverAnchor({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
