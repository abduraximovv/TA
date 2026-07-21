"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button, Card, Toast } from "@repo/ui";
import { AuthModal } from "@/components/auth/AuthModal";
import { Compass, Map as MapIcon, MessageSquare, Star, ArrowRight, User } from "lucide-react";
import { Noto_Sans } from "next/font/google";
import { useAuth } from "@repo/auth";

const notoSans = Noto_Sans({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "700"] });

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

interface Service {
  id: string;
  title: string;
  price: number;
  image_url: string;
  avg_rating: number;
}

export function LandingClient({ initialServices }: { initialServices: Service[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const handleVisualFeatureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast("This feature is part of our Interactive Layer, coming in Stage 2.");
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] overflow-x-hidden selection:bg-[#1E6F8A]/20 pb-20">
      
      {/* Dynamic Header */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200 py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#1E6F8A] flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? "text-gray-900" : "text-white"}`}>
              UzTour
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/discover" className={`text-sm font-medium transition-colors hover:text-[#D4A843] ${isScrolled ? "text-gray-600" : "text-white/90"}`}>Discover</Link>
            <Link href="/map" className={`text-sm font-medium transition-colors hover:text-[#D4A843] ${isScrolled ? "text-gray-600" : "text-white/90"}`}>Map</Link>
            <Link href="/translator" className={`text-sm font-medium transition-colors hover:text-[#D4A843] ${isScrolled ? "text-gray-600" : "text-white/90"}`}>Translator</Link>
          </nav>

          <div className="flex items-center space-x-4">
            {!isLoading && user ? (
              <Link href="/profile">
                <Button 
                  className={`rounded-full px-6 text-sm font-medium transition-all flex items-center ${
                    isScrolled 
                      ? "bg-[#1E6F8A] hover:bg-[#155368] text-white" 
                      : "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => setIsAuthOpen(true)}
                className={`rounded-full px-6 text-sm font-medium transition-all ${
                  isScrolled 
                    ? "bg-[#1E6F8A] hover:bg-[#155368] text-white" 
                    : "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                }`}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="fixed inset-0 z-0 h-[120vh]">
            <Image
              src="https://images.unsplash.com/photo-1528154291023-a6525fabe5b4"
              alt="Uzbekistan Landscape"
              fill
              priority
              className="object-cover"
              quality={90}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-4xl mx-auto text-center mt-16"
        >
          <motion.h1 
            variants={fadeUp} 
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-xl"
          >
            Unveil the <span className="text-[#D4A843]">Silk Road</span>
          </motion.h1>

          <motion.p 
            variants={fadeUp} 
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
          >
            Experience authentic <span className={notoSans.className}>O&apos;zbekiston</span>. Discover verified local guides, secure routes, and cultural treasures.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link href="/discover">
              <Button size="lg" className="rounded-full bg-[#1E6F8A] hover:bg-[#155368] text-white text-lg h-14 px-10 shadow-xl shadow-[#1E6F8A]/30 transition-transform hover:-translate-y-1">
                Start Exploring
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content Areas */}
      <div className="relative z-10 bg-[#F9FAFB] space-y-16 py-20 px-6">
        
        {/* Functional Integration Links */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8"
        >
          <motion.div variants={fadeUp}>
            <Link href="/map" className="block outline-none group">
              <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <MapIcon className="w-6 h-6 text-[#1E6F8A]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Survival Map</h3>
                <p className="text-gray-600 mb-6">Offline-capable interactive mapping. Locate verified SOS hubs and cultural landmarks instantly.</p>
                <span className="flex items-center text-[#1E6F8A] font-semibold group-hover:translate-x-2 transition-transform">
                  Open Map <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link href="/translator" className="block outline-none group">
              <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#D4A843]/10 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-[#D4A843]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Contextual Translator</h3>
                <p className="text-gray-600 mb-6">Real-time voice and text translation powered by advanced AI, including cultural etiquette guidance.</p>
                <span className="flex items-center text-[#D4A843] font-semibold group-hover:translate-x-2 transition-transform">
                  Try Translator <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.section>

        {/* Dynamic Experience Discovery (Fetched from DB) */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeUp} className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Experience Discovery</h2>
              <p className="text-gray-500 mt-2">Curated adventures across the country.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialServices && initialServices.length > 0 ? (
              initialServices.map((exp) => (
                <Link href={`/service/${exp.id}`} key={exp.id} className="text-left outline-none group block">
                  <Card className="rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <Image 
                        src={exp.image_url || "https://images.unsplash.com/photo-1601614917406-896db0638dd1?q=80&w=800"} 
                        alt={exp.title} 
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center">
                        <Star className="w-3 h-3 text-[#D4A843] fill-[#D4A843] mr-1" /> {exp.avg_rating || "4.9"}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{exp.title}</h4>
                      <p className="text-sm font-semibold text-gray-600">
                        {new Intl.NumberFormat('uz-UZ').format(exp.price)} <span className="text-xs text-gray-400 font-normal">UZS</span>
                      </p>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500">Experiences are currently being loaded. Check back soon!</p>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Visual Taste & Trust */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeUp} className="bg-[#1E6F8A] rounded-lg overflow-hidden flex flex-col md:flex-row relative">
            <div className="p-10 md:p-16 md:w-1/2 flex flex-col justify-center relative z-10">
              <span className="text-[#D4A843] font-bold text-sm tracking-wider uppercase mb-2">Taste & Trust</span>
              <h3 className="text-3xl font-extrabold text-white mb-4">Dine with Confidence</h3>
              <p className="text-white/80 mb-8 leading-relaxed">
                Scan local menus instantly. Our AI detects allergens, translates ingredients into your language, and provides a hygiene confidence score.
              </p>
              <Button onClick={handleVisualFeatureClick} className="self-start rounded-full bg-white text-[#1E6F8A] hover:bg-gray-100">
                Learn More
              </Button>
            </div>
            <div className="md:w-1/2 relative min-h-[300px]">
              <Image 
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000" 
                alt="Uzbek Cuisine"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E6F8A] to-transparent" />
            </div>
          </motion.div>
        </motion.section>
      </div>

      <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </main>
  );
}
