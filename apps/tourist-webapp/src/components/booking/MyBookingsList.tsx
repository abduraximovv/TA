"use client";

import React, { useEffect, useState } from "react";
import { getMyBookings } from "@repo/database";
import type { Booking } from "@repo/types";
import { Card, Badge } from "@repo/ui";
import { Calendar, Package, MapPin } from "lucide-react";
import { useAuth } from "@repo/auth";
import { ReviewModal } from "./ReviewModal";

export function MyBookingsList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        const [bookingsData, reviewsData] = await Promise.all([
          getMyBookings(user.id, 'tourist'),
          // Use fetch for reviews since we added the API route, 
          // but we can also use getMyReviews from @repo/database which we just added
          import("@repo/database").then(m => m.getMyReviews(user.id))
        ]);
        setBookings(bookingsData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl text-center">
        <p className="text-gray-500 font-medium">You don't have any bookings yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-dark-graphite text-lg mb-2">My Bookings</h3>
      {bookings.map((booking) => (
        <Card key={booking.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {booking.itinerary_id ? "Package Booking" : "Service Booking"}
              </span>
            </div>
            <Badge 
              variant={
                booking.status === "accepted" ? "success" : 
                booking.status === "declined" ? "danger" : 
                booking.status === "pending" ? "warning" : 
                "default"
              }
            >
              {booking.status}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(booking.booking_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-400" />
              {booking.guest_count} Guest{booking.guest_count > 1 ? "s" : ""}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Price</span>
            <span className="font-bold text-emerald-950">
              {booking.total_price != null 
                ? `${(Number(booking.total_price) || 0).toLocaleString("en-US").replace(/,/g, " ")} ${booking.currency}` 
                : "TBD"}
            </span>
          </div>
          
          {booking.status === "completed" && !reviews.some(r => r.booking_id === booking.id) && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-right">
              <ReviewModal 
                bookingId={booking.id} 
                serviceId={booking.service_id} 
                itineraryId={booking.itinerary_id}
                onSuccess={() => {
                  // Re-fetch reviews to hide the button
                  import("@repo/database").then(m => m.getMyReviews(user!.id).then(setReviews));
                }}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
