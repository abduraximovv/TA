"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Input, LoadingPulse } from "@repo/ui";

export interface SlotFormValues {
  available_date: string;
  hasTimeRange: boolean;
  start_time: string;
  end_time: string;
  total_capacity: string;
}

interface AddSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SlotFormValues) => Promise<void>;
}

const emptyValues: SlotFormValues = {
  available_date: "",
  hasTimeRange: false,
  start_time: "",
  end_time: "",
  total_capacity: "1",
};

export function AddSlotModal({ open, onOpenChange, onSubmit }: AddSlotModalProps) {
  const [values, setValues] = useState<SlotFormValues>(emptyValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(emptyValues);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (values.hasTimeRange && (!values.start_time || !values.end_time)) {
      setError("Set both a start and end time, or turn off the time range for an all-day entry.");
      return;
    }
    if (values.hasTimeRange && values.start_time >= values.end_time) {
      setError("End time must be after start time.");
      return;
    }
    if (Number(values.total_capacity) < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add availability.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add Availability">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <Input
          type="date"
          label="Date"
          min={new Date().toISOString().slice(0, 10)}
          value={values.available_date}
          onChange={(e) => setValues({ ...values, available_date: e.target.value })}
          required
          disabled={isSaving}
        />

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 select-none">
          <input
            type="checkbox"
            checked={values.hasTimeRange}
            onChange={(e) => setValues({ ...values, hasTimeRange: e.target.checked })}
            disabled={isSaving}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          Limit to a specific time slot
        </label>
        <p className="text-xs text-gray-400 -mt-3">
          {values.hasTimeRange
            ? "Capacity below applies only to this time window."
            : "Off = the whole day, capacity applies to the entire day."}
        </p>

        {values.hasTimeRange && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Start time"
              value={values.start_time}
              onChange={(e) => setValues({ ...values, start_time: e.target.value })}
              required={values.hasTimeRange}
              disabled={isSaving}
            />
            <Input
              type="time"
              label="End time"
              value={values.end_time}
              onChange={(e) => setValues({ ...values, end_time: e.target.value })}
              required={values.hasTimeRange}
              disabled={isSaving}
            />
          </div>
        )}

        <Input
          type="number"
          label="Max capacity"
          min="1"
          step="1"
          value={values.total_capacity}
          onChange={(e) => setValues({ ...values, total_capacity: e.target.value })}
          required
          disabled={isSaving}
        />

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
            {isSaving && <LoadingPulse className="scale-50 h-5 w-5 text-white" />}
            {isSaving ? "Saving..." : "Add Availability"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
