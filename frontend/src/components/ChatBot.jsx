// frontend/src/components/ChatBot.jsx

import React, { useEffect, useRef } from "react";
import Logo from "../assets/logo.png"
import User from "../assets/icons8-user-24.png"

export default function ChatBot({ messages, isAsking, uploadedFileName }) {
  const containerRef    = useRef(null);
  const messagesEndRef  = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAsking]);

  const formatMessage = (text) =>
    text
      ?.split("\n")
      .map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < text.split("\n").length - 1 && <br />}
        </React.Fragment>
      ));

  return (
    <div
      ref={containerRef}
      className="
        w-full 
        max-w-[1208px]   /* cap width to 1208px */
        mx-auto          /* center on screens ≥ 1208px */
        bg-white 
        flex-1 
        overflow-y-auto
      "
    >
      {/** 
         1) No PDF & no messages → blank white area (edge‑to‑edge on mobile, centered container on desktop).
         2) PDF uploaded but no messages → “PDF Ready!” state. 
      **/}
      {!uploadedFileName && messages.length === 0 && (
        <div className="h-full">{/* quiet white space */}</div>
      )}

      {uploadedFileName && messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-lg font-semibold mb-2">PDF Ready!</h2>
            <p className="text-gray-600">
              <strong>{uploadedFileName}</strong> has been processed.
              <br />
              You can now ask questions about its content.
            </p>
          </div>
        </div>
      )}

      {/** Chat messages only show when messages exist **/}
      {messages.length > 0 && (
        <div className="space-y-6 py-6">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <img
                src={msg.sender === "user" ? User : Logo}
                alt={`${msg.sender} icon`}
                className="w-10 h-10 rounded-full shrink-0"
              />

              {/** 
                  White‑background “bubble” that sits on the white page,
                  text in exact rgba(27,31,42,1) via text-[#1B1F2A].
              **/}
              <div className="
                rounded-xl 
                px-4 
                py-3 
                shadow-sm 
                bg-white 
                text-[#1B1F2A] 
                text-sm 
                leading-relaxed 
                max-w-full
              ">
                {formatMessage(msg.text)}
              </div>
            </div>
          ))}

          {/** Typing indicator **/}
          {isAsking && (
            <div className="flex items-start space-x-3">
              <img
                src={Logo}
                alt="AI icon"
                className="w-10 h-10 rounded-full"
              />
              <div className="
                bg-white 
                text-[#1B1F2A] 
                px-4 
                py-3 
                rounded-xl 
                text-sm 
                flex 
                items-center 
                space-x-2 
                shadow-sm
              ">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
