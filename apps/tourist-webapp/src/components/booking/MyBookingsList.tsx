"use client";

import React, { useEffect, useState } from "react";
import { getMyBookings } from "@repo/database";
import type { Booking } from "@repo/types";
import { Card, Badge } from "@repo/ui";
import { Calendar, Package, MapPin } from "lucide-react";
import { useAuth } from "@repo/auth";

export function MyBookingsList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings(user.id, 'tourist');
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
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
            <span className="font-bold text-primary">
              {booking.total_price != null 
                ? `${new Intl.NumberFormat("uz-UZ").format(booking.total_price)} ${booking.currency}` 
                : "TBD"}
            </span>
          </div>
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
