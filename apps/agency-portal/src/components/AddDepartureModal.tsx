"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Input, LoadingPulse } from "@repo/ui";

export interface DepartureFormValues {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  max_guests: string;
}

interface AddDepartureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DepartureFormValues) => Promise<void>;
}

const emptyValues: DepartureFormValues = {
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  max_guests: "10",
};

export function AddDepartureModal({ open, onOpenChange, onSubmit }: AddDepartureModalProps) {
  const [values, setValues] = useState<DepartureFormValues>(emptyValues);
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

    if (!values.start_date || !values.end_date) {
      setError("Set both a start and end date.");
      return;
    }
    if (values.end_date < values.start_date) {
      setError("End date must be on or after the start date.");
      return;
    }
    if (Number(values.max_guests) < 1) {
      setError("Max guests must be at least 1.");
      return;
    }
    // Mirrors package_departures_time_pair_check: a real time-of-day needs both ends set
    // together, an all-day departure must leave both blank.
    if (Boolean(values.start_time) !== Boolean(values.end_time)) {
      setError("Set both a start and end time, or leave both blank for an all-day departure.");
      return;
    }
    if (values.start_time && values.end_time && values.end_time <= values.start_time) {
      setError("End time must be after the start time.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add departure.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add Departure">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            min={new Date().toISOString().slice(0, 10)}
            value={values.start_date}
            onChange={(e) => setValues({ ...values, start_date: e.target.value })}
            required
            disabled={isSaving}
          />
          <Input
            type="date"
            label="End Date"
            min={values.start_date || new Date().toISOString().slice(0, 10)}
            value={values.end_date}
            onChange={(e) => setValues({ ...values, end_date: e.target.value })}
            required
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="time"
            label="Start Time (optional)"
            value={values.start_time}
            onChange={(e) => setValues({ ...values, start_time: e.target.value })}
            disabled={isSaving}
          />
          <Input
            type="time"
            label="End Time (optional)"
            value={values.end_time}
            onChange={(e) => setValues({ ...values, end_time: e.target.value })}
            disabled={isSaving}
          />
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          Leave both blank for an all-day departure -- travelers will just see the date.
        </p>

        <Input
          type="number"
          label="Max guests"
          min="1"
          step="1"
          value={values.max_guests}
          onChange={(e) => setValues({ ...values, max_guests: e.target.value })}
          required
          disabled={isSaving}
        />

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
            {isSaving && <LoadingPulse className="scale-50 h-5 w-5 text-white" />}
            {isSaving ? "Saving..." : "Add Departure"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
