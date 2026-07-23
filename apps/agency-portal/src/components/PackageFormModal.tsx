"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Input, Select, Textarea, LoadingPulse } from "@repo/ui";
import { Check } from "lucide-react";

export interface PackageableService {
  id: string;
  title: string;
  price: number;
  currency: string;
}

export interface PackageItemValue {
  service_id: string | null;
  title: string;
  price: number;
}

export interface PackageFormValues {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "completed";
  items: PackageItemValue[];
}

interface PackageFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: PackageFormValues;
  availableServices: PackageableService[];
  onSubmit: (values: PackageFormValues) => Promise<void>;
  title: string;
}

const emptyValues: PackageFormValues = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "active",
  items: [],
};

export function PackageFormModal({
  open,
  onOpenChange,
  initialValues,
  availableServices,
  onSubmit,
  title,
}: PackageFormModalProps) {
  const [values, setValues] = useState<PackageFormValues>(initialValues ?? emptyValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyValues);
      setError(null);
    }
  }, [open, initialValues]);

  const totalPrice = useMemo(
    () => values.items.reduce((sum, item) => sum + (item.price || 0), 0),
    [values.items]
  );

  const toggleService = (service: PackageableService) => {
    setValues((prev) => {
      const exists = prev.items.some((i) => i.service_id === service.id);
      if (exists) {
        return { ...prev, items: prev.items.filter((i) => i.service_id !== service.id) };
      }
      return {
        ...prev,
        items: [...prev.items, { service_id: service.id, title: service.title, price: service.price }],
      };
    });
  };

  const updateItemPrice = (serviceId: string, price: number) => {
    setValues((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.service_id === serviceId ? { ...i, price } : i)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (values.items.length === 0) {
      setError("Select at least one service to include in this package.");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save package.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Package Title"
          placeholder="e.g. 3-Day Silk Road Discovery"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          required
          disabled={isSaving}
        />

        <Textarea
          label="Description"
          placeholder="What's the story of this package?"
          rows={3}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          disabled={isSaving}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={values.start_date}
            onChange={(e) => setValues({ ...values, start_date: e.target.value })}
            disabled={isSaving}
          />
          <Input
            type="date"
            label="End Date"
            value={values.end_date}
            onChange={(e) => setValues({ ...values, end_date: e.target.value })}
            disabled={isSaving}
          />
          <Select
            label="Status"
            value={values.status}
            onChange={(e) => setValues({ ...values, status: e.target.value as PackageFormValues["status"] })}
            disabled={isSaving}
          >
            <option value="active">Active (visible to tourists)</option>
            <option value="draft">Draft (hidden)</option>
            <option value="completed">Completed</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Included Services ({values.items.length} selected)
          </label>
          {availableServices.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center">
              Add services in Inventory first, then come back here to bundle them into a package.
            </p>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-56 overflow-y-auto">
              {availableServices.map((service) => {
                const item = values.items.find((i) => i.service_id === service.id);
                const isSelected = Boolean(item);
                return (
                  <div key={service.id} className="flex items-center gap-3 p-3">
                    <button
                      type="button"
                      onClick={() => toggleService(service)}
                      disabled={isSaving}
                      className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                      }`}
                      aria-label={isSelected ? `Remove ${service.title}` : `Add ${service.title}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <span className="flex-1 text-sm font-medium text-gray-900">{service.title}</span>
                    {isSelected ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item?.price ?? 0}
                        onChange={(e) => updateItemPrice(service.id, Number(e.target.value) || 0)}
                        disabled={isSaving}
                        className="w-28 h-8 rounded border border-gray-300 px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <span className="w-28 text-right text-sm text-gray-400">
                        {service.price.toLocaleString()} {service.currency}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
          <span className="text-sm font-semibold text-gray-600">Total Package Price</span>
          <span className="text-lg font-bold text-primary">{totalPrice.toLocaleString()} UZS</span>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
            {isSaving && <LoadingPulse className="scale-50 h-5 w-5 text-white" />}
            {isSaving ? "Saving..." : "Save Package"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
