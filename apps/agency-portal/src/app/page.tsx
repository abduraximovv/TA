import { Button, Card } from "@repo/ui";
import Link from "next/link";
import Image from "next/image";

export default function AgencyLandingPage() {
  return (
    <main className="relative min-h-screen bg-[#F9FAFB] overflow-hidden selection:bg-[#1E6F8A]/20">
      
      {/* Dynamic Header */}
      <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 py-5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              UzTour <span className="font-light">Agency Portal</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button className="rounded-full px-6 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-6 bg-[#1E6F8A] hover:bg-[#155368] text-white transition-all shadow-lg shadow-[#1E6F8A]/30">
                Register Agency
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1548050570-36e3fc9204ac?q=80&w=2000"
            alt="Majestic Uzbekistan Architecture"
            fill
            priority
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-2xl">
            Partner with <span className="text-[#D4A843]">UzTour</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Join the premier digital tourism ecosystem of Uzbekistan. Showcase your services to thousands of verified global travelers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="rounded-full bg-[#1E6F8A] hover:bg-[#155368] text-white text-lg h-14 px-10 shadow-xl shadow-[#1E6F8A]/40 transition-transform hover:-translate-y-1">
                Register Your Agency
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm text-lg h-14 px-10 transition-transform hover:-translate-y-1">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="relative z-10 bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-gray-50 hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Global Reach</h3>
            <p className="text-gray-600 leading-relaxed">Connect instantly with international tourists looking for authentic Silk Road experiences and reliable services.</p>
          </Card>
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-gray-50 hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Seamless Management</h3>
            <p className="text-gray-600 leading-relaxed">Our powerful dashboard allows you to manage bookings, adjust pricing, and track revenue effortlessly.</p>
          </Card>
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-gray-50 hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Trust</h3>
            <p className="text-gray-600 leading-relaxed">Operate in a secure environment. All agencies are verified, ensuring high quality and trust for every traveler.</p>
          </Card>
        </div>
      </section>

    </main>
  );
}
