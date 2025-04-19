"use client";

import * as React from "react";
import ReactDOM from "react-dom";

// Helper to merge class names.
function mergeClassNames(defaultClasses, customClass) {
  return customClass ? `${defaultClasses} ${customClass}` : defaultClasses;
}

/* ----------------------------------
   Simple Dialog Implementation
-----------------------------------*/
function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-md shadow-lg z-50">
        {children}
      </div>
    </div>,
    document.body
  );
}

function DialogHeader({ className, children, ...props }) {
  return (
    <div className={mergeClassNames("p-4 border-b", className)} {...props}>
      {children}
    </div>
  );
}

function DialogTitle({ className, children, ...props }) {
  return (
    <h2 className={mergeClassNames("text-lg font-bold", className)} {...props}>
      {children}
    </h2>
  );
}

function DialogDescription({ className, children, ...props }) {
  return (
    <p
      className={mergeClassNames("text-sm text-gray-600", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function DialogContent({ className, children, ...props }) {
  return (
    <div className={mergeClassNames("p-4", className)} {...props}>
      {children}
    </div>
  );
}

/* ----------------------------------
   Command Palette Components
-----------------------------------*/

// Container component for the command palette.
function Command({ className, ...props }) {
  return (
    <div
      data-slot="command"
      className={mergeClassNames(
        "bg-gray-100 text-gray-900 flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  );
}

// A dialog wrapping the command palette.
function CommandDialog({
  open,
  onClose,
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="[&_[data-slot=command-group-heading]]:text-gray-500 [&_[data-slot=command-input-wrapper]]:h-12 [&_[data-slot=command-input-wrapper]]:px-2 [&_[data-slot=command-input-wrapper]]:font-medium [&_[data-slot=command-group]]:px-2 [&_[data-slot=command-group]]:pt-0 [&_[data-slot=command-input-wrapper]_svg]:h-5 [&_[data-slot=command-input-wrapper]_svg]:w-5 [&_[data-slot=command-input]]:h-12 [&_[data-slot=command-item]]:px-2 [&_[data-slot=command-item]]:py-3 [&_[data-slot=command-item]_svg]:h-5 [&_[data-slot=command-item]_svg]:w-5"
          {...props}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Command input with an inline SVG search icon.
function CommandInput({ className, ...props }) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <svg
        className="w-4 h-4 shrink-0 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M16.65 11.35a5.3 5.3 0 11-10.6 0 5.3 5.3 0 0110.6 0z"
        />
      </svg>
      <input
        data-slot="command-input"
        className={mergeClassNames(
          "placeholder-gray-500 flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

// List container for command items.
function CommandList({ className, ...props }) {
  return (
    <div
      data-slot="command-list"
      className={mergeClassNames(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  );
}

// A component to show when there are no commands found.
function CommandEmpty({ ...props }) {
  return (
    <div
      data-slot="command-empty"
      className="py-6 text-center text-sm text-gray-500"
      {...props}
    />
  );
}

// Grouping container for related command items.
function CommandGroup({ className, ...props }) {
  return (
    <div
      data-slot="command-group"
      className={mergeClassNames("text-gray-900 overflow-hidden p-1", className)}
      {...props}
    />
  );
}

// An individual command item.
function CommandItem({ className, onClick, ...props }) {
  const [selected, setSelected] = React.useState(false);
  return (
    <div
      data-slot="command-item"
      onMouseEnter={() => setSelected(true)}
      onMouseLeave={() => setSelected(false)}
      onClick={onClick}
      className={mergeClassNames(
        `relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none ${
          selected ? "bg-blue-500 text-white" : ""
        }`,
        className
      )}
      {...props}
    />
  );
}

// A visual shortcut label attached to a command item.
function CommandShortcut({ className, ...props }) {
  return (
    <span
      data-slot="command-shortcut"
      className={mergeClassNames(
        "text-gray-500 ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
}

// A visual separator between command groups or items.
function CommandSeparator({ className, ...props }) {
  return (
    <div
      data-slot="command-separator"
      className={mergeClassNames("bg-gray-300 -mx-1 h-px", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
