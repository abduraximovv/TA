"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { MessageCircleQuestion, X, Send } from "lucide-react";
import { Modal } from "@repo/ui/src/components/Modal";
import { Input } from "@repo/ui/src/components/input";
import { Textarea } from "@repo/ui/src/components/textarea";
import { Button } from "@repo/ui/src/components/Button";
import { submitContactMessage } from "../app/contact/actions";

// Persistent floating elements, present on every page — mirrors the assistant-bubble +
// vertical feedback-tab pattern used sitewide on visitsaudi.com, restyled in brand teal/gold.
export function FloatingWidgets() {
  const [expanded, setExpanded] = useState(false);
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
          transform: "translateY(-50%) rotate(180deg)",
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

      {/* AI assistant bubble — bottom-right, expands into a greeting card */}
      <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 46 }}>
        {expanded && (
          <div
            style={{
              position: "absolute",
              bottom: 64,
              right: 0,
              width: 240,
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 16px 40px rgba(10,35,32,0.25)",
              border: "1px solid #EFEDE7",
            }}
          >
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14.5, fontWeight: 600, color: "#0A2320", marginBottom: 6 }}>
              Assalomu alaykum! 👋
            </div>
            <p style={{ fontSize: 12.5, color: "rgba(10,35,32,0.6)", lineHeight: 1.5, marginBottom: 12 }}>
              I&rsquo;m Zarina, your Silk Road guide. Need a phrase translated or a route planned?
            </p>
            <Link
              href="/translator"
              className="btn-pill-primary"
              style={{ textDecoration: "none", fontSize: 12, padding: "8px 16px", display: "inline-flex" }}
            >
              Open Translator
            </Link>
          </div>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Close assistant" : "Open assistant"}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #006B70 0%, #0A2320 100%)",
            border: "none",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 10px 28px rgba(10,35,32,0.35)",
          }}
        >
          {expanded ? <X size={22} /> : <MessageCircleQuestion size={22} />}
        </button>
      </div>
    </div>
  );
}
