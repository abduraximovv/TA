"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@repo/auth";
import { getSupabase } from "@repo/database";
import type { ServiceInventory } from "@repo/database";
import { Button, Toast, LoadingPulse } from "@repo/ui";
import { ArrowLeft, Plus, Trash2, Ban, RotateCcw } from "lucide-react";
import { AddSlotModal, type SlotFormValues } from "@/components/AddSlotModal";

interface ServiceInfo {
  id: string;
  title: string;
}

interface AvailabilityPageProps {
  params: { id: string };
}

function formatTimeRange(slot: ServiceInventory): string {
  if (!slot.start_time || !slot.end_time) return "All day";
  return `${slot.start_time.slice(0, 5)} – ${slot.end_time.slice(0, 5)}`;
}

export default function ServiceAvailabilityPage({ params }: AvailabilityPageProps) {
  const { session } = useAuth();
  const [service, setService] = useState<ServiceInfo | null>(null);
  const [slots, setSlots] = useState<ServiceInventory[]>([]);
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

    // RLS already scopes `services` reads/writes to the caller's own provider_id, so this
    // second .eq() is belt-and-suspenders -- but it's what turns "RLS silently returned zero
    // rows" into an honest, visible "not found" state instead of a page that looks broken.
    const { data: serviceRow, error: serviceError } = await supabase
      .from("services")
      .select("id, title")
      .eq("id", params.id)
      .eq("provider_id", session.user.id)
      .maybeSingle();

    if (serviceError || !serviceRow) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    setService(serviceRow as ServiceInfo);

    const { data, error: invError } = await supabase
      .from("service_inventory")
      .select("*")
      .eq("service_id", params.id)
      .order("available_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: true });

    if (invError) {
      setLoadError(invError.message);
    } else {
      setSlots((data ?? []) as ServiceInventory[]);
      setLoadError(null);
    }
    setIsLoading(false);
  }, [session, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSlot = async (values: SlotFormValues) => {
    if (!service) return;
    const supabase = getSupabase();
    const payload = {
      service_id: service.id,
      available_date: values.available_date,
      start_time: values.hasTimeRange ? values.start_time : null,
      end_time: values.hasTimeRange ? values.end_time : null,
      total_capacity: Number(values.total_capacity) || 0,
    };

    const { error } = await supabase.from("service_inventory").insert(payload as never);
    if (error) {
      // 23P01 = the no-overlapping-time-ranges EXCLUDE constraint; 23505 = the
      // UNIQUE(service_id, available_date, start_time) constraint -- both are real Postgres
      // constraints on this table, translated here into messages a provider can act on.
      if (error.code === "23P01") {
        throw new Error("That time range overlaps with an existing slot on this date.");
      }
      if (error.code === "23505") {
        throw new Error("A slot with this exact date and start time already exists.");
      }
      throw new Error(error.message);
    }

    notify("Availability added.", "success");
    await fetchData();
  };

  const handleToggleBlocked = async (slot: ServiceInventory) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("service_inventory")
      .update({ is_blocked: !slot.is_blocked } as never)
      .eq("id", slot.id);
    if (error) {
      notify(error.message, "danger");
      return;
    }
    setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, is_blocked: !s.is_blocked } : s)));
    notify(slot.is_blocked ? "Reopened for booking." : "Blocked -- won't be bookable.", "success");
  };

  const handleDelete = async (slot: ServiceInventory) => {
    if (slot.booked_capacity > 0) {
      notify("Can't remove a slot that already has bookings -- block it instead.", "danger");
      return;
    }
    if (!confirm(`Remove availability for ${slot.available_date}?`)) return;
    const supabase = getSupabase();
    const { error } = await supabase.from("service_inventory").delete().eq("id", slot.id);
    if (error) {
      notify(error.message, "danger");
      return;
    }
    setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    notify("Availability removed.", "success");
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
        <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Service not found, or it doesn't belong to your account.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Availability</h1>
          <p className="text-sm text-gray-500 mt-1">{service?.title}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Availability
        </Button>
      </div>

      {loadError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">Failed to load availability: {loadError}</div>
      ) : slots.length === 0 ? (
        <div className="p-12 text-center rounded-xl border-dashed border-2 border-gray-200 bg-gray-50/50">
          <p className="text-gray-500 font-medium">No availability set yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Without any entries here, this service stays bookable on any date (unmanaged).
          </p>
          <Button onClick={() => setModalOpen(true)} className="mt-4 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add your first date
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Time</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Capacity</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slots.map((slot) => {
                const isFull = slot.booked_capacity >= slot.total_capacity;
                return (
                  <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{slot.available_date}</td>
                    <td className="px-6 py-4 text-gray-500">{formatTimeRange(slot)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {slot.booked_capacity} / {slot.total_capacity}
                    </td>
                    <td className="px-6 py-4">
                      {slot.is_blocked ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize bg-gray-100 text-gray-600 border-gray-200">
                          Blocked
                        </span>
                      ) : isFull ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize bg-orange-50 text-orange-700 border-orange-200">
                          Full
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize bg-emerald-50 text-emerald-700 border-emerald-200">
                          Open
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleToggleBlocked(slot)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                          aria-label={slot.is_blocked ? "Reopen this date" : "Block this date"}
                          title={slot.is_blocked ? "Reopen" : "Block"}
                        >
                          {slot.is_blocked ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(slot)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                          aria-label="Remove this availability entry"
                          disabled={slot.booked_capacity > 0}
                          title={slot.booked_capacity > 0 ? "Has bookings -- block instead" : "Remove"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddSlotModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={handleAddSlot} />

      <Toast
        message={toastMessage ?? ""}
        isVisible={toastMessage !== null}
        onClose={() => setToastMessage(null)}
        variant={toastVariant}
      />
    </div>
  );
}
