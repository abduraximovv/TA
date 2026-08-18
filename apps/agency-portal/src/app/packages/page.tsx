"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@repo/auth";
import { getSupabase } from "@repo/database";
import { Button, Card, Badge, LoadingPulse, Toast } from "@repo/ui";
import { Plus, Pencil, Trash2, Package as PackageIcon, Calendar, CalendarClock } from "lucide-react";
import {
  PackageFormModal,
  type PackageFormValues,
  type PackageableService,
} from "@/components/PackageFormModal";

interface ItineraryRow {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "draft" | "active" | "completed";
  total_price: number;
  currency: string;
}

interface ItineraryItemRow {
  id: string;
  itinerary_id: string;
  service_id: string | null;
  title: string | null;
  price: number | null;
}

export default function PackagesPage() {
  const { session } = useAuth();
  const [packages, setPackages] = useState<ItineraryRow[]>([]);
  const [itemsByPackage, setItemsByPackage] = useState<Record<string, ItineraryItemRow[]>>({});
  const [availableServices, setAvailableServices] = useState<PackageableService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ItineraryRow | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const supabase = getSupabase();

    const { data: itineraries, error: itinError } = await supabase
      .from("itineraries")
      .select("*")
      .eq("agency_id", session.user.id)
      .order("created_at", { ascending: false })
      .returns<ItineraryRow[]>();

    const { data: services, error: svcError } = await supabase
      .from("services")
      .select("id, title, price, currency")
      .eq("provider_id", session.user.id)
      .returns<PackageableService[]>();

    if (itinError || svcError) {
      setError(itinError?.message || svcError?.message || "Failed to load packages.");
      setIsLoading(false);
      return;
    }

    setAvailableServices((services ?? []) as PackageableService[]);
    setPackages((itineraries ?? []) as ItineraryRow[]);

    const ids = (itineraries ?? []).map((i) => i.id);
    if (ids.length > 0) {
      const { data: items } = await supabase
        .from("itinerary_items")
        .select("*")
        .in("itinerary_id", ids)
        .returns<ItineraryItemRow[]>();
      const grouped: Record<string, ItineraryItemRow[]> = {};
      (items ?? []).forEach((item) => {
        const key = item.itinerary_id as string;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item as ItineraryItemRow);
      });
      setItemsByPackage(grouped);
    } else {
      setItemsByPackage({});
    }

    setError(null);
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingPackage(null);
    setModalOpen(true);
  };

  const openEdit = (pkg: ItineraryRow) => {
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const handleSubmit = async (values: PackageFormValues) => {
    if (!session?.user?.id) return;
    const supabase = getSupabase();
    const totalPrice = values.items.reduce((sum, item) => sum + (item.price || 0), 0);

    const itineraryPayload = {
      title: values.title,
      description: values.description || null,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      status: values.status,
      total_price: totalPrice,
    };

    let itineraryId = editingPackage?.id;

    if (editingPackage) {
      const { error } = await supabase.from("itineraries").update(itineraryPayload as never).eq("id", editingPackage.id);
      if (error) throw new Error(error.message);
      // Simplest correct approach for a small item list: replace all items rather than diff them.
      await supabase.from("itinerary_items").delete().eq("itinerary_id", editingPackage.id);
    } else {
      const { data, error } = await supabase
        .from("itineraries")
        .insert({ ...itineraryPayload, agency_id: session.user.id } as never)
        .select()
        .single();
      if (error) throw new Error(error.message);
      itineraryId = (data as ItineraryRow).id;
    }

    const itemRows = values.items.map((item, index) => ({
      itinerary_id: itineraryId,
      service_id: item.service_id,
      title: item.title,
      price: item.price,
      sort_order: index,
    }));
    const { error: itemsError } = await supabase.from("itinerary_items").insert(itemRows as never);
    if (itemsError) throw new Error(itemsError.message);

    setToastMessage(editingPackage ? "Package updated." : "Package created.");
    await fetchData();
  };

  const handleDelete = async (pkg: ItineraryRow) => {
    if (!confirm(`Delete "${pkg.title}"? This can't be undone.`)) return;
    const supabase = getSupabase();
    const { error } = await supabase.from("itineraries").delete().eq("id", pkg.id);
    if (error) {
      setToastMessage(error.message);
      return;
    }
    setToastMessage("Package deleted.");
    setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
  };

  const statusVariant = (status: ItineraryRow["status"]) =>
    status === "active" ? "success" : status === "completed" ? "default" : "warning";

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Packages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bundle your services into multi-day packages travelers can book directly.
          </p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Package
        </Button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">Failed to load packages: {error}</div>
      ) : isLoading ? (
        <div className="flex justify-center py-24">
          <LoadingPulse className="scale-150 text-primary" />
        </div>
      ) : packages.length === 0 ? (
        <Card className="p-12 text-center rounded-xl border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
          <p className="text-gray-500 font-medium">You haven't built any packages yet.</p>
          <Button onClick={openCreate} className="mt-4 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Build your first package
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const items = itemsByPackage[pkg.id] ?? [];
            return (
              <Card key={pkg.id} className="rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                    <PackageIcon className="w-5 h-5" />
                  </div>
                  <Badge variant={statusVariant(pkg.status)}>{pkg.status}</Badge>
                </div>
                <h3 className="font-bold text-gray-900 leading-snug mb-1">{pkg.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 flex-1">{pkg.description || "No description."}</p>
                {(pkg.start_date || pkg.end_date) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {pkg.start_date ?? "?"} → {pkg.end_date ?? "?"}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{items.length} service{items.length === 1 ? "" : "s"} included</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="font-bold text-primary">
                    {pkg.total_price.toLocaleString()} {pkg.currency}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/packages/${pkg.id}/departures`}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                      aria-label={`Manage departures for ${pkg.title}`}
                      title="Manage departures"
                    >
                      <CalendarClock className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openEdit(pkg)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                      aria-label={`Edit ${pkg.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      aria-label={`Delete ${pkg.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PackageFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingPackage ? "Edit Package" : "Add Package"}
        availableServices={availableServices}
        initialValues={
          editingPackage
            ? {
                title: editingPackage.title,
                description: editingPackage.description ?? "",
                start_date: editingPackage.start_date ?? "",
                end_date: editingPackage.end_date ?? "",
                status: editingPackage.status,
                items: (itemsByPackage[editingPackage.id] ?? []).map((item) => ({
                  service_id: item.service_id,
                  title: item.title ?? "",
                  price: item.price ?? 0,
                })),
              }
            : undefined
        }
        onSubmit={handleSubmit}
      />

      <Toast message={toastMessage ?? ""} isVisible={toastMessage !== null} onClose={() => setToastMessage(null)} />
    </div>
  );
}
