"use client";

import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Input, Select, Textarea, LoadingPulse } from "@repo/ui";
import { uploadServicePhoto } from "@repo/database";
import { ImageOff, Upload } from "lucide-react";

export interface ServiceFormValues {
  title: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  image_url: string;
}

const CATEGORIES = ["tour", "stay", "food", "gastronomy", "artisan", "experience", "transport", "other", "nature", "bazaar"];

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: ServiceFormValues;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  title: string;
  ownerId: string;
}

const emptyValues: ServiceFormValues = {
  title: "",
  description: "",
  category: "tour",
  price: "",
  currency: "UZS",
  image_url: "",
};

export function ServiceFormModal({ open, onOpenChange, initialValues, onSubmit, title, ownerId }: ServiceFormModalProps) {
  const [values, setValues] = useState<ServiceFormValues>(initialValues ?? emptyValues);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyValues);
      setError(null);
    }
  }, [open, initialValues]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadServicePhoto(file, ownerId);
      setValues((prev) => ({ ...prev, image_url: url }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save listing.");
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

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {isUploading ? (
                <LoadingPulse className="scale-50 text-primary" />
              ) : values.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.image_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageOff className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
              disabled={isUploading || isSaving}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSaving}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {values.image_url ? "Change Photo" : "Upload Photo"}
            </Button>
          </div>
        </div>

        <Input
          label="Title"
          placeholder="e.g. 3-Day Silk Road Discovery Package"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          required
          disabled={isSaving}
        />

        <Textarea
          label="Description"
          placeholder="What's included in this package?"
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

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isUploading} className="flex items-center gap-2">
            {isSaving && <LoadingPulse className="scale-50 h-5 w-5 text-white" />}
            {isSaving ? "Saving..." : "Save Listing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
