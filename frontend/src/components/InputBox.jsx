// frontend/src/components/InputBox.jsx

import React, { useState, useRef, useEffect } from "react";
import Send from "../assets/icons8-send-40.png";

export default function InputBox({ onSend, disabled, isAsking }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Focus the textarea when it becomes enabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = () => {
    const trimmedText = text.trim();
    if (trimmedText !== "" && !disabled) {
      onSend(trimmedText);
      setText("");
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = "48px"; // 56px total minus 4px top & 4px bottom padding
      }
    }
  };

  /** Allow "Enter" to submit, but "Shift+Enter" for new line */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /** Auto-resize textarea (up to 120px) */
  const handleTextChange = (e) => {
    setText(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  // Dynamic placeholder based on state
  const getPlaceholder = () => {
    if (disabled) {
      if (isAsking) {
        return "Getting answer...";
      } else {
        return "Send a message...";
      }
    }
    return "Send a message...";
  };

  return (
    <div
      className="
        fixed
        left-[27px] right-[27px] bottom-[30px]       /* Mobile: left 27px, right 27px, bottom 30px */
        sm:left-[112px] sm:right-[112px] sm:bottom-[50px] /* Desktop: left 112px, right 112px, bottom 50px */
        h-[48px]        /* Mobile height 48px */
        sm:h-[56px]     /* Desktop height 56px */
        border border-[rgba(228,232,238,1)]
        bg-[rgba(246,247,249,1)] rounded-lg
        flex items-center
        px-4            /* horizontal padding 16px */
        z-50
      "
    >
      {/* Textarea (transparent background over the container’s grayish backdrop) */}
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        disabled={disabled}
        className={`
          flex-1
          h-full
          resize-none
          bg-transparent
          border-none
          py-[4px]            /* 4px top & bottom padding to total 56px in desktop */
          px-[8px]            /* 8px left & right padding */
          font-inter
          rounded-md
          font-medium
          text-[14px]
          leading-[21px]
          text-[#6E7583]      /* rgb(110,117,131) */
          placeholder:opacity-35
          placeholder:text-[#6E7583]
          focus:outline-none
          ${disabled ? "cursor-not-allowed text-gray-400" : "text-[#202128]"}
        `}
        style={{
          minHeight: "100%",   // forces 48px on mobile, 56px on desktop
          maxHeight: "120px",
        }}
      />

      {/* Send button (22×22 icon with 35% opacity by default) */}
      <button
        onClick={handleSubmit}
        disabled={disabled || text.trim() === ""}
        className={`
          ml-3
          w-[22px] h-[22px]
          flex items-center justify-center cursor-pointer
          ${disabled || text.trim() === ""
            ? "opacity-20 cursor-not-allowed"
            : "opacity-35 hover:opacity-80 transition-opacity"}
        `}
      >
        {isAsking ? (
          // loading spinner (white spinner on semi‐transparent background)
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <img
            src={Send}
            alt="Send icon"
            className="w-full h-full"
          />
        )}
      </button>
    </div>
  );
}
