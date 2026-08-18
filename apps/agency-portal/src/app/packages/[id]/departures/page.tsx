"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@repo/auth";
import { getSupabase } from "@repo/database";
import type { PackageDeparture } from "@repo/database";
import { Button, Toast, LoadingPulse } from "@repo/ui";
import { ArrowLeft, Plus, Trash2, Ban, RotateCcw } from "lucide-react";
import { AddDepartureModal, type DepartureFormValues } from "@/components/AddDepartureModal";

interface PackageInfo {
  id: string;
  title: string;
}

interface DeparturesPageProps {
  params: { id: string };
}

const statusStyles: Record<string, string> = {
  scheduled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sold_out: "bg-orange-50 text-orange-700 border-orange-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusDot: Record<string, string> = {
  scheduled: "bg-emerald-500",
  sold_out: "bg-orange-500",
  cancelled: "bg-gray-400",
};

const statusLabel: Record<string, string> = {
  scheduled: "Scheduled",
  sold_out: "Sold Out",
  cancelled: "Cancelled",
};

export default function PackageDeparturesPage({ params }: DeparturesPageProps) {
  const { session } = useAuth();
  const [pkg, setPkg] = useState<PackageInfo | null>(null);
  const [departures, setDepartures] = useState<PackageDeparture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("default");
  const [modalOpen, setModalOpen] = useState(false);

  const notify = (message: string, variant: "default" | "success" | "danger" = "default") => {
    setToastMessage(message);
    setToastVariant(variant);
  };

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const supabase = getSupabase();

    // RLS already scopes `itineraries` reads/writes to the caller's own agency_id, so this
    // second .eq() is belt-and-suspenders -- it's what turns "RLS silently returned zero rows"
    // into an honest, visible "not found" state instead of a page that looks broken.
    const { data: pkgRow, error: pkgError } = await supabase
      .from("itineraries")
      .select("id, title")
      .eq("id", params.id)
      .eq("agency_id", session.user.id)
      .maybeSingle();

    if (pkgError || !pkgRow) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    setPkg(pkgRow as PackageInfo);

    const { data, error: depError } = await supabase
      .from("package_departures")
      .select("*")
      .eq("itinerary_id", params.id)
      .order("start_date", { ascending: true });

    if (depError) {
      setLoadError(depError.message);
    } else {
      setDepartures((data ?? []) as PackageDeparture[]);
      setLoadError(null);
    }
    setIsLoading(false);
  }, [session, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddDeparture = async (values: DepartureFormValues) => {
    if (!pkg) return;
    const supabase = getSupabase();
    const payload = {
      itinerary_id: pkg.id,
      start_date: values.start_date,
      end_date: values.end_date,
      max_guests: Number(values.max_guests) || 0,
    };

    const { error } = await supabase.from("package_departures").insert(payload as never);
    if (error) throw new Error(error.message);

    notify("Departure added.", "success");
    await fetchData();
  };

  const handleCancel = async (departure: PackageDeparture) => {
    if (!confirm(`Cancel the departure starting ${departure.start_date}? Travelers with existing bookings should be notified separately.`)) return;
    const supabase = getSupabase();
    const { error } = await supabase
      .from("package_departures")
      .update({ status: "cancelled" } as never)
      .eq("id", departure.id);
    if (error) {
      notify(error.message, "danger");
      return;
    }
    setDepartures((prev) => prev.map((d) => (d.id === departure.id ? { ...d, status: "cancelled" } : d)));
    notify("Departure cancelled.", "success");
  };

  const handleReopen = async (departure: PackageDeparture) => {
    const supabase = getSupabase();
    const nextStatus = departure.booked_guests >= departure.max_guests ? "sold_out" : "scheduled";
    const { error } = await supabase
      .from("package_departures")
      .update({ status: nextStatus } as never)
      .eq("id", departure.id);
    if (error) {
      notify(error.message, "danger");
      return;
    }
    setDepartures((prev) => prev.map((d) => (d.id === departure.id ? { ...d, status: nextStatus } : d)));
    notify("Departure reopened.", "success");
  };

  const handleDelete = async (departure: PackageDeparture) => {
    if (departure.booked_guests > 0) {
      notify("Can't remove a departure that already has bookings -- cancel it instead.", "danger");
      return;
    }
    if (!confirm(`Remove the departure starting ${departure.start_date}?`)) return;
    const supabase = getSupabase();
    const { error } = await supabase.from("package_departures").delete().eq("id", departure.id);
    if (error) {
      notify(error.message, "danger");
      return;
    }
    setDepartures((prev) => prev.filter((d) => d.id !== departure.id));
    notify("Departure removed.", "success");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingPulse className="scale-150 text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8">
        <Link href="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Packages
        </Link>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Package not found, or it doesn't belong to your account.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link href="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Packages
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Departures</h1>
          <p className="text-sm text-gray-500 mt-1">{pkg?.title}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Departure
        </Button>
      </div>

      {loadError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">Failed to load departures: {loadError}</div>
      ) : departures.length === 0 ? (
        <div className="p-12 text-center rounded-xl border-dashed border-2 border-gray-200 bg-gray-50/50">
          <p className="text-gray-500 font-medium">No fixed departures set yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Without any departures here, this package stays bookable on any date a traveler picks.
          </p>
          <Button onClick={() => setModalOpen(true)} className="mt-4 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add your first departure
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Start</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">End</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Guests</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departures.map((departure) => (
                <tr key={departure.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{departure.start_date}</td>
                  <td className="px-6 py-4 text-gray-500">{departure.end_date}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {departure.booked_guests} / {departure.max_guests}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        statusStyles[departure.status] ?? statusStyles.scheduled
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDot[departure.status] ?? statusDot.scheduled}`} />
                      {statusLabel[departure.status] ?? departure.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => (departure.status === "cancelled" ? handleReopen(departure) : handleCancel(departure))}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                        aria-label={departure.status === "cancelled" ? "Reopen this departure" : "Cancel this departure"}
                        title={departure.status === "cancelled" ? "Reopen" : "Cancel"}
                      >
                        {departure.status === "cancelled" ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(departure)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        aria-label="Remove this departure"
                        disabled={departure.booked_guests > 0}
                        title={departure.booked_guests > 0 ? "Has bookings -- cancel instead" : "Remove"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddDepartureModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={handleAddDeparture} />

      <Toast
        message={toastMessage ?? ""}
        isVisible={toastMessage !== null}
        onClose={() => setToastMessage(null)}
        variant={toastVariant}
      />
    </div>
  );
}
