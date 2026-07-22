"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@repo/auth";
import { getSupabase } from "@repo/database";
import { Button, Card, Badge, LoadingPulse, Toast } from "@repo/ui";
import { Plus, Pencil, Trash2, Star, ImageOff } from "lucide-react";
import { ServiceFormModal, type ServiceFormValues } from "@/components/ServiceFormModal";

interface ServiceRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  image_url: string | null;
  avg_rating: number;
  reviews_count: number;
}

export default function ServicesPage() {
  const { session } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);

  const fetchServices = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("provider_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setServices((data ?? []) as ServiceRow[]);
      setError(null);
    }
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreate = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const openEdit = (service: ServiceRow) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    if (!session?.user?.id) return;
    const supabase = getSupabase();
    const payload = {
      title: values.title,
      description: values.description || null,
      category: values.category,
      price: Number(values.price) || 0,
      currency: values.currency,
      image_url: values.image_url || null,
    };

    if (editingService) {
      const { error } = await supabase.from("services").update(payload as never).eq("id", editingService.id);
      if (error) throw new Error(error.message);
      setToastMessage("Service updated.");
    } else {
      const { error } = await supabase.from("services").insert({ ...payload, provider_id: session.user.id } as never);
      if (error) throw new Error(error.message);
      setToastMessage("Service created.");
    }
    await fetchServices();
  };

  const handleDelete = async (service: ServiceRow) => {
    if (!confirm(`Delete "${service.title}"? This can't be undone.`)) return;
    const supabase = getSupabase();
    const { error } = await supabase.from("services").delete().eq("id", service.id);
    if (error) {
      setToastMessage(error.message);
      return;
    }
    setToastMessage("Service deleted.");
    setServices((prev) => prev.filter((s) => s.id !== service.id));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the tours and experiences you offer travelers.</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">Failed to load services: {error}</div>
      ) : isLoading ? (
        <div className="flex justify-center py-24">
          <LoadingPulse className="scale-150 text-primary" />
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center rounded-xl border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
          <p className="text-gray-500 font-medium">You haven't added any services yet.</p>
          <Button onClick={openCreate} className="mt-4 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add your first service
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                {service.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Badge>{service.category}</Badge>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {service.avg_rating || "—"} ({service.reviews_count})
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 leading-snug mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 flex-1">{service.description || "No description."}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="font-bold text-primary">
                    {service.price.toLocaleString()} {service.currency}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(service)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                      aria-label={`Edit ${service.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      aria-label={`Delete ${service.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ServiceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingService ? "Edit Service" : "Add Service"}
        initialValues={
          editingService
            ? {
                title: editingService.title,
                description: editingService.description ?? "",
                category: editingService.category,
                price: String(editingService.price),
                currency: editingService.currency,
                image_url: editingService.image_url ?? "",
              }
            : undefined
        }
        onSubmit={handleSubmit}
      />

      <Toast message={toastMessage ?? ""} isVisible={toastMessage !== null} onClose={() => setToastMessage(null)} />
    </div>
  );
}
