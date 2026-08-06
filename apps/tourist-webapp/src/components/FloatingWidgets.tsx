"use client";

import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Modal } from "@repo/ui/src/components/Modal";
import { Input } from "@repo/ui/src/components/input";
import { Textarea } from "@repo/ui/src/components/textarea";
import { Button } from "@repo/ui/src/components/Button";
import { submitContactMessage } from "../app/contact/actions";
import { AIAssistantWidget } from "./ai-assistant/AIAssistantWidget";

// Persistent floating elements, present on every page — mirrors the assistant-bubble +
// vertical feedback-tab pattern used sitewide on visitsaudi.com, restyled in brand teal/gold.
export function FloatingWidgets() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitContactMessage(formData);
    
    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
      formRef.current?.reset();
      setTimeout(() => {
        setSuccess(false);
        setFeedbackOpen(false);
      }, 3000);
    } else {
      alert(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="hidden md:block">
      {/* Feedback tab — pinned to the right edge */}
      <button
        onClick={() => setFeedbackOpen(true)}
        aria-label="Send feedback"
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          writingMode: "vertical-rl",
          background: "#006B70",
          color: "#FFFFFF",
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.04em",
          padding: "16px 8px",
          borderRadius: "8px 0 0 8px",
          border: "none",
          cursor: "pointer",
          zIndex: 45,
          boxShadow: "-4px 0 12px rgba(10,35,32,0.15)",
        }}
      >
        Feedback
      </button>

      {/* Feedback Modal */}
      <Modal 
        open={feedbackOpen} 
        onOpenChange={(open) => {
          setFeedbackOpen(open);
          if (!open) {
            setTimeout(() => setSuccess(false), 300);
          }
        }} 
        title="Send Feedback"
        description="Let us know how we can improve your experience on Silk Road Uzbekistan."
      >
        {success ? (
          <div className="bg-[#006B70]/10 border border-[#006B70]/20 rounded-xl p-6 text-center my-4">
            <div className="w-12 h-12 bg-[#006B70] rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#0A2320] mb-2">Thank you!</h3>
            <p className="text-[#0A2320]/70">Your feedback helps us improve.</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleFeedbackSubmit} className="space-y-4 mt-4">
            <input type="hidden" name="type" value="feedback" />
            
            <Input 
              name="name"
              label="Name (Optional)" 
              placeholder="Jane Doe" 
            />
            <Input 
              name="email"
              type="email"
              label="Email (Optional)" 
              placeholder="jane@example.com" 
            />
            <Textarea 
              name="message"
              label="Your Feedback" 
              placeholder="What do you think about our platform?" 
              rows={4}
              required 
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setFeedbackOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="teal" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? "Sending..." : "Submit Feedback"}
                {!isSubmitting && <Send className="w-4 h-4" />}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <AIAssistantWidget />
    </div>
  );
}
