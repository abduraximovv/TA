"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea, LoadingPulse } from "@repo/ui";

export interface ServiceFormValues {
  title: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  image_url: string;
}

const CATEGORIES = ["tour", "stay", "food", "gastronomy", "artisan", "experience", "transport", "other"];

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: ServiceFormValues;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  title: string;
}

const emptyValues: ServiceFormValues = {
  title: "",
  description: "",
  category: "tour",
  price: "",
  currency: "UZS",
  image_url: "",
};

export function ServiceFormModal({ open, onOpenChange, initialValues, onSubmit, title }: ServiceFormModalProps) {
  const [values, setValues] = useState<ServiceFormValues>(initialValues ?? emptyValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyValues);
      setError(null);
    }
  }, [open, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Title"
          placeholder="e.g. Samarkand Sunset Walking Tour"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          required
          disabled={isSaving}
        />

        <Textarea
          label="Description"
          placeholder="What makes this experience worth booking?"
          rows={3}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          disabled={isSaving}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={values.category}
            onChange={(e) => setValues({ ...values, category: e.target.value })}
            disabled={isSaving}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </Select>

          <Select
            label="Currency"
            value={values.currency}
            onChange={(e) => setValues({ ...values, currency: e.target.value })}
            disabled={isSaving}
          >
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
          </Select>
        </div>

        <Input
          type="number"
          label="Price"
          placeholder="0"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(e) => setValues({ ...values, price: e.target.value })}
          required
          disabled={isSaving}
        />

        <Input
          label="Image URL"
          placeholder="https://..."
          value={values.image_url}
          onChange={(e) => setValues({ ...values, image_url: e.target.value })}
          disabled={isSaving}
        />

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
            {isSaving && <LoadingPulse className="scale-50 h-5 w-5 text-white" />}
            {isSaving ? "Saving..." : "Save Service"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
