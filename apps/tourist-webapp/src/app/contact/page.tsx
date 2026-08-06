"use client";

import React, { useState, useRef } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Input } from "@repo/ui/src/components/input";
import { Textarea } from "@repo/ui/src/components/textarea";
import { Button } from "@repo/ui/src/components/Button";
import { submitContactMessage } from "./actions";
import { Footer } from "@/components/landing/Footer";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PageHero } from "@/components/PageHero";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitContactMessage(formData);
    
    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 5000);
    } else {
      alert(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8] relative overflow-x-hidden">
      
      {/* Background Watermark Pattern (Islamic Geometric inspired) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2378006E' fill-opacity='1'%3E%3Cpath d='M30 30L15 15H0v30h15L30 30zm0 0L45 45h15V15H45L30 30zM15 45v15h30V45H15zM15 15V0h30v15H15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Contact" }]} style={{ marginBottom: 20 }} />

          <PageHero
            title="Contact"
            eyebrow="We're Here to Help"
            image="https://images.unsplash.com/photo-1764423075260-cfa7908758eb?q=80&w=2000"
            alt="Uzbek craftsmanship"
          />

          {/* Header Section */}
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#0A2320] mb-6 leading-tight">
              Let's Connect on the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#78006E] to-[#C5A880]">
                Silk Road
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#0A2320]/70 font-sans">
              Whether you need help planning your journey through ancient cities or have a specific inquiry, our dedicated team is here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100/50">
            
            {/* Contact Information (Left Col) */}
            <div className="lg:col-span-5 relative bg-[#78006E] p-10 md:p-14 text-white overflow-hidden">
              
              {/* Decorative side pattern */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H24v-2zm0 4h20v2H24v-2zm0 4h20v2H24v-2zm0 4h20v2H24v-2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                  backgroundSize: '80px 80px'
                }}
              />
              
              <div className="relative z-10 h-full flex flex-col">
                <h2 className="text-4xl font-serif font-bold mb-12 tracking-tight">Contact Info</h2>
                
                <div className="space-y-10 flex-grow">
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white/20 transition-colors">
                      <Phone className="w-6 h-6 text-[#C5A880]" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-2">Phone Number</h3>
                      <p className="text-2xl font-serif">+998 71 123 45 67</p>
                      <p className="text-white/70 text-sm mt-2">Mon-Fri from 9am to 6pm (UZT)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white/20 transition-colors">
                      <Mail className="w-6 h-6 text-[#C5A880]" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-2">Email Address</h3>
                      <p className="text-2xl font-serif">hello@silkroad.uz</p>
                      <p className="text-white/70 text-sm mt-2">We'll respond within 24 hours.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white/20 transition-colors">
                      <MapPin className="w-6 h-6 text-[#C5A880]" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-xs tracking-[0.2em] uppercase text-white/60 mb-2">Office Location</h3>
                      <p className="text-lg leading-relaxed text-white/90">
                        12 Amir Temur Avenue<br />
                        Tashkent, 100000<br />
                        Uzbekistan
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10">
                  <p className="text-sm text-white/70 leading-relaxed">
                    For urgent inquiries related to ongoing tours, please contact your verified local provider directly through the dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form (Right Col) */}
            <div className="lg:col-span-7 p-10 md:p-14 bg-white relative">
              <div className="max-w-xl mx-auto">
                <h2 className="text-3xl font-serif font-bold text-[#0A2320] mb-10">Send us a Message</h2>
                
                {success ? (
                  <div className="bg-[#78006E]/5 border border-[#78006E]/20 rounded-[20px] p-10 text-center transition-all duration-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#78006E] to-[#C5A880] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#78006E]/20">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-[#0A2320] mb-4">Message Sent!</h3>
                    <p className="text-[#0A2320]/70 text-lg mb-8">
                      Thank you for reaching out. A member of our team will get back to you shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-[#78006E] text-[#78006E] hover:bg-[#78006E]/5 px-8 h-12 rounded-xl font-semibold"
                      onClick={() => setSuccess(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                    <input type="hidden" name="type" value="contact" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-[0.1em] uppercase text-gray-500 ml-1">Full Name</label>
                        <Input 
                          name="name"
                          placeholder="Jane Doe" 
                          required 
                          className="h-14 bg-gray-50/50 border-gray-200 focus:border-[#78006E] focus:ring-[#78006E]/20 rounded-xl px-4 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-[0.1em] uppercase text-gray-500 ml-1">Email Address</label>
                        <Input 
                          name="email"
                          type="email"
                          placeholder="jane@example.com" 
                          required 
                          className="h-14 bg-gray-50/50 border-gray-200 focus:border-[#78006E] focus:ring-[#78006E]/20 rounded-xl px-4 text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-[0.1em] uppercase text-gray-500 ml-1">Subject</label>
                      <Input 
                        name="subject"
                        placeholder="How can we help you?" 
                        required 
                        className="h-14 bg-gray-50/50 border-gray-200 focus:border-[#78006E] focus:ring-[#78006E]/20 rounded-xl px-4 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-[0.1em] uppercase text-gray-500 ml-1">Message</label>
                      <Textarea 
                        name="message"
                        placeholder="Tell us about your inquiry..." 
                        rows={6}
                        required 
                        className="bg-gray-50/50 border-gray-200 focus:border-[#78006E] focus:ring-[#78006E]/20 rounded-xl resize-none p-4 text-base"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 bg-[#78006E] hover:bg-[#5E0056] text-white rounded-xl text-lg font-semibold flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-[#78006E]/30"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending Message..." : "Send Message"}
                      {!isSubmitting && <Send className="w-5 h-5" />}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Footer Component */}
      <Footer />
    </div>
  );
}
