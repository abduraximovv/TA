"use client";

import React, { useState, useRef } from "react";
import { Phone, Clock, Mail, ArrowUpRight, Calendar, ChevronDown } from "lucide-react";
import Image from "next/image";
import { submitContactMessage } from "./actions";

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
    <div className="min-h-screen pt-32 pb-24 bg-[#F9F8F5] text-[#0A2320]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-block px-4 py-1.5 bg-gray-100/80 rounded-full text-xs font-semibold text-gray-600 mb-6 font-sans">
              Plan Trip
            </div>
            <h1 className="text-6xl md:text-8xl font-sans tracking-tight font-medium text-[#0A2320] leading-none">
              Contact Us
            </h1>
          </div>
          <div className="md:max-w-sm text-gray-500 font-sans text-sm md:text-base mb-2">
            Tell us when and where you'd like to go and we'll confirm availability within 24 hours.
          </div>
        </div>

        {/* Form and Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 mb-20">
          
          {/* Form */}
          <div className="bg-white/40 p-8 md:p-10 rounded-[32px]">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <ArrowUpRight className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-sans font-medium mb-4">Request Sent!</h3>
                <p className="text-gray-500 mb-8">We have received your booking request and will get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="bg-[#0A2320] text-white px-8 py-4 rounded-full font-sans font-medium hover:bg-black transition-colors"
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* contact_messages.type only allows 'contact' | 'feedback' -- "Booking Inquiry"
                    lives in subject instead, where the admin inbox can actually show it. */}
                <input type="hidden" name="type" value="contact" />
                <input type="hidden" name="subject" value="Booking Inquiry" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 ml-1">Name</label>
                    <input 
                      name="name"
                      placeholder="Your full name"
                      required
                      className="bg-gray-100/60 hover:bg-gray-100 focus:bg-white border-0 outline-none focus:ring-2 focus:ring-[#0A2320]/20 rounded-2xl h-14 px-5 text-[15px] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 ml-1">Email</label>
                    <input 
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="bg-gray-100/60 hover:bg-gray-100 focus:bg-white border-0 outline-none focus:ring-2 focus:ring-[#0A2320]/20 rounded-2xl h-14 px-5 text-[15px] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 ml-1">Phone Number</label>
                    <input 
                      name="phone"
                      type="tel"
                      placeholder="+998 71 123 4567"
                      className="bg-gray-100/60 hover:bg-gray-100 focus:bg-white border-0 outline-none focus:ring-2 focus:ring-[#0A2320]/20 rounded-2xl h-14 px-5 text-[15px] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 ml-1">Select Your Tour</label>
                    <div className="relative">
                      <select 
                        name="tour"
                        defaultValue=""
                        className="w-full bg-gray-100/60 hover:bg-gray-100 focus:bg-white border-0 outline-none focus:ring-2 focus:ring-[#0A2320]/20 rounded-2xl h-14 pl-5 pr-12 text-[15px] appearance-none transition-all text-gray-500"
                      >
                        <option value="" disabled>Choose your tour...</option>
                        <option value="silk_road">Silk Road Journey (Samarkand & Bukhara)</option>
                        <option value="khiva">Itchan Kala Ancient City (Khiva)</option>
                        <option value="chimgan">Mountain Trek & Yurt Camp (Chimgan)</option>
                        <option value="custom">Custom Itinerary</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 ml-1">Preferred Date</label>
                    <div className="relative">
                      <input 
                        name="date"
                        type="date"
                        className="w-full bg-gray-100/60 hover:bg-gray-100 focus:bg-white border-0 outline-none focus:ring-2 focus:ring-[#0A2320]/20 rounded-2xl h-14 pl-5 pr-12 text-[15px] transition-all text-gray-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 ml-1">Number of Travelers</label>
                    <input 
                      name="travelers"
                      placeholder="2 adults, 1 child"
                      className="bg-gray-100/60 hover:bg-gray-100 focus:bg-white border-0 outline-none focus:ring-2 focus:ring-[#0A2320]/20 rounded-2xl h-14 px-5 text-[15px] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600 ml-1">Message / Special Requests</label>
                  <textarea 
                    name="message"
                    placeholder="Anything else we should know?"
                    rows={4}
                    className="bg-gray-100/60 hover:bg-gray-100 focus:bg-white border-0 outline-none focus:ring-2 focus:ring-[#0A2320]/20 rounded-2xl p-5 text-[15px] resize-none transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0A2320] text-white px-8 h-14 rounded-full font-sans font-medium hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubmitting ? "Sending..." : "Reserve Your Spot"}
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-14 h-14 bg-[#0A2320] text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shrink-0"
                    aria-label="Submit form"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Image */}
          <div className="relative h-[400px] lg:h-full min-h-[400px] rounded-[32px] overflow-hidden">
            <Image
              src="/images/registan_4k.png"
              alt="Uzbekistan Landscape"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute top-6 right-6">
              <div className="backdrop-blur-md bg-white/20 border border-white/40 text-white text-sm font-medium px-5 py-2 rounded-full shadow-sm">
                Your Journey
              </div>
            </div>
          </div>

        </div>

        {/* Contact Info Footer section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-10 text-center font-sans">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-6">
              <Phone className="w-5 h-5 text-gray-700" />
            </div>
            <h4 className="text-lg font-semibold mb-3">Call & WhatsApp</h4>
            <div className="text-gray-500 text-sm space-y-1">
              <p>+998 71 123 4567</p>
              <p>+998 90 987 6543</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-5 h-5 text-gray-700" />
            </div>
            <h4 className="text-lg font-semibold mb-3">Working Hours</h4>
            <div className="text-gray-500 text-sm space-y-1">
              <p>Daily: 9am-6pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-5 h-5 text-gray-700" />
            </div>
            <h4 className="text-lg font-semibold mb-3">Write to Us</h4>
            <div className="text-gray-500 text-sm space-y-1">
              <p>hello@silkroad.uz</p>
              <p>booking@silkroad.uz</p>
            </div>
          </div>
        </div>

        {/* Bottom Escape Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-14 mb-10 flex flex-col md:flex-row items-center gap-10">
          
          <div className="flex-1 space-y-6 md:pr-10">
            <div className="inline-block px-4 py-1.5 bg-gray-100/80 rounded-full text-xs font-semibold text-gray-600 font-sans">
              Start now
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight text-[#0A2320] leading-[1.1] max-w-md">
              <span className="font-medium">Discover your </span> 
              <span className="font-light text-gray-600">next</span>
              <br />
              <span className="font-medium">perfect desert escape</span>
            </h2>
            <p className="text-gray-500 font-sans text-[15px] max-w-sm leading-relaxed">
              Plan your trip in minutes and enjoy every moment of your desert escape.
            </p>
          </div>

          <div className="flex-1 flex gap-4 w-full h-[380px]">
            <div className="relative flex-1 rounded-2xl overflow-hidden shadow-sm">
              <Image 
                src="/hero-uzbekistan.png" 
                alt="Uzbekistan Desert Landscape"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden shadow-sm">
              <Image 
                src="/images/registan_4k.png" 
                alt="Kyzylkum Desert"
                fill
                className="object-cover"
              />
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
