/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React, { useState } from "react";

import { Button, Modal } from "@/components/ui";
import {
  FabricSoldBy,
  FabricUpsert,
  PricingFabric,
  useGetPricingFabricsQuery,
  useUpsertPricingFabricMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import DataTable from "../../_components/DataTable";
import ImportDialog from "./ImportDialog";
import {
  apiErrorMessage,
  Field,
  formatNgn,
  inputClass,
  IssueBadges,
  isNegativeOrNaN,
  Notice,
  numStr,
  StatusPill,
  toNum,
} from "./shared";

const emptyForm = {
  fabricCode: "",
  name: "",
  category: "",
  priceCoversYards: "",
  lowNgn: "",
  highNgn: "",
  confirmedNgn: "",
  soldBy: "PER_YARD" as FabricSoldBy,
  available: true,
  supplier: "",
  lastVerified: "",
  imageUrl: "",
  notes: "",
};

type FormState = typeof emptyForm;

const toForm = (f: PricingFabric): FormState => ({
  fabricCode: f.fabricCode,
  name: f.name,
  category: f.category || "",
  priceCoversYards: numStr(f.priceCoversYards),
  lowNgn: numStr(f.lowNgn),
  highNgn: numStr(f.highNgn),
  confirmedNgn: numStr(f.confirmedNgn),
  soldBy: f.soldBy || "PER_YARD",
  available: f.available,
  supplier: f.supplier || "",
  lastVerified: f.lastVerified || "",
  imageUrl: f.imageUrl || "",
  notes: f.notes || "",
});

const FabricsTab = () => {
  const { data: fabrics = [], isLoading } = useGetPricingFabricsQuery();
  const [upsertFabric, { isLoading: isSaving }] =
    useUpsertPricingFabricMutation();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openForm = (fabric?: PricingFabric) => {
    setForm(fabric ? toForm(fabric) : emptyForm);
    setEditing(!!fabric);
    setFormError("");
    setShowForm(true);
  };

  const validate = (): string => {
    if (!form.fabricCode.trim()) return "Fabric code is required";
    if (!form.name.trim()) return "Name is required";
    const numbers = {
      "Price unit (yards)": toNum(form.priceCoversYards),
      "Low price": toNum(form.lowNgn),
      "High price": toNum(form.highNgn),
      "Confirmed price": toNum(form.confirmedNgn),
    };
    for (const [label, value] of Object.entries(numbers)) {
      if (isNegativeOrNaN(value)) {
        return `${label} must be a non-negative number`;
      }
    }
    const low = numbers["Low price"];
    const high = numbers["High price"];
    if (low !== undefined && high !== undefined && low > high) {
      return "Low price cannot be higher than High price";
    }
    if (!(numbers["Price unit (yards)"] ?? 0)) {
      return "Price unit (yards) is required, e.g. 1 for a per-yard price or 5 for a 5-yard price";
    }
    return "";
  };

  const handleSave = async () => {
    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }
    const payload: FabricUpsert = {
      fabricCode: form.fabricCode.trim(),
      name: form.name.trim(),
      category: form.category || undefined,
      priceCoversYards: toNum(form.priceCoversYards),
      lowNgn: toNum(form.lowNgn),
      highNgn: toNum(form.highNgn),
      confirmedNgn: toNum(form.confirmedNgn),
      soldBy: form.soldBy,
      available: form.available,
      supplier: form.supplier || undefined,
      lastVerified: form.lastVerified || undefined,
      imageUrl: form.imageUrl || undefined,
      notes: form.notes || undefined,
    };
    try {
      const saved = await upsertFabric(payload).unwrap();
      showToast.success(
        saved.issues?.length
          ? "Fabric saved but hidden until the listed issues are fixed"
          : "Fabric saved"
      );
      setShowForm(false);
    } catch (e: any) {
      setFormError(apiErrorMessage(e, "Failed to save fabric"));
    }
  };

  const columns = [
    { key: "fabricCode", header: "Code" },
    { key: "name", header: "Name" },
    {
      key: "priceCoversYards",
      header: "Price unit",
      render: (v: unknown) => (v ? `${v} yd` : "-"),
    },
    {
      key: "lowNgn",
      header: "Low",
      render: (v: unknown) => formatNgn(v as number),
    },
    {
      key: "highNgn",
      header: "High",
      render: (v: unknown) => formatNgn(v as number),
    },
    {
      key: "confirmedNgn",
      header: "Confirmed",
      render: (v: unknown) => formatNgn(v as number),
    },
    {
      key: "soldBy",
      header: "Sold by",
      render: (v: unknown) =>
        v === "PACK_ONLY" ? "Pack only" : v === "PER_YARD" ? "Per yard" : "-",
    },
    {
      key: "available",
      header: "Available",
      render: (v: unknown) => (
        <StatusPill on={!!v} onLabel="Yes" offLabel="No" />
      ),
    },
    {
      key: "issues",
      header: "Status",
      render: (_v: unknown, row: PricingFabric) => (
        <IssueBadges issues={row.issues} />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (_v: unknown, row: PricingFabric) => (
        <button
          type="button"
          onClick={() => openForm(row)}
          className="text-primary hover:underline text-sm"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <p className="text-sm text-gray-600">
          Fabric prices are Cuffino&apos;s cost in naira. Fabrics with issues
          are saved but not offered to customers.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            Import spreadsheet
          </Button>
          <Button onClick={() => openForm()}>Add fabric</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={fabrics.map((f) => ({ ...f, id: f.fabricPriceId }))}
          columns={columns}
          loading={isLoading}
          emptyMessage="No fabrics yet. Import the fabric sheet or add one."
        />
      </div>

      <ImportDialog
        kind="fabrics"
        isOpen={showImport}
        onClose={() => setShowImport(false)}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        closeOnOverlayClick={false}
        className="max-w-3xl"
      >
        <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900">
            {editing ? "Edit fabric" : "Add fabric"}
          </h2>
          {formError && <Notice tone="error">{formError}</Notice>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Fabric code *">
              <input
                className={inputClass}
                value={form.fabricCode}
                disabled={editing}
                onChange={(e) => set("fabricCode", e.target.value)}
              />
            </Field>
            <Field label="Name *">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Category">
              <input
                className={inputClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Sold by"
              hint="Per yard: the customer pays for the exact yards the style needs. Pack only: the price unit is the pack, and the customer pays for every pack needed."
            >
              <select
                className={inputClass}
                value={form.soldBy}
                onChange={(e) => set("soldBy", e.target.value as FabricSoldBy)}
              >
                <option value="PER_YARD">Per yard</option>
                <option value="PACK_ONLY">Pack only</option>
              </select>
            </Field>
            <Field
              label="Price unit (yards) *"
              hint="What the prices below are for: 1 = per yard, 5 = a 5-yard price, 10 = a 10-yard price."
            >
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.priceCoversYards}
                onChange={(e) => set("priceCoversYards", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Low price (NGN)">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.lowNgn}
                onChange={(e) => set("lowNgn", e.target.value)}
              />
            </Field>
            <Field label="High price (NGN)">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.highNgn}
                onChange={(e) => set("highNgn", e.target.value)}
              />
            </Field>
            <Field
              label="Confirmed price (NGN)"
              hint="When set, it is used instead of the Low/Mid/High basis."
            >
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.confirmedNgn}
                onChange={(e) => set("confirmedNgn", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Last verified">
              <input
                type="date"
                className={inputClass}
                value={form.lastVerified}
                onChange={(e) => set("lastVerified", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Supplier">
              <input
                className={inputClass}
                value={form.supplier}
                onChange={(e) => set("supplier", e.target.value)}
              />
            </Field>
            <Field label="Image URL">
              <input
                className={inputClass}
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
              />
            </Field>
            <Field label="Notes">
              <input
                className={inputClass}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => set("available", e.target.checked)}
            />
            Available to customers
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={isSaving}>
              Save fabric
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FabricsTab;
