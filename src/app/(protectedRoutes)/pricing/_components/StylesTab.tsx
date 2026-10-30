/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React, { useState } from "react";

import { Button, Modal } from "@/components/ui";
import {
  PieceOption,
  PricingStyle,
  StyleBand,
  useGetPricingFabricsQuery,
  useGetPricingStylesQuery,
  useSetPricingStyleActiveMutation,
  useUpsertPricingStyleMutation,
  useUploadProductImageMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import DataTable from "../../_components/DataTable";
import ImportDialog from "./ImportDialog";
import {
  apiErrorMessage,
  Field,
  formatUsd,
  inputClass,
  IssueBadges,
  isNegativeOrNaN,
  Notice,
  numStr,
  StatusPill,
  toNum,
} from "./shared";

interface BandForm {
  offered: boolean;
  min: string;
  max: string;
  yards: string;
  logistics: string;
}

const emptyBand: BandForm = { offered: false, min: "", max: "", yards: "", logistics: "" };

const emptyForm = {
  styleCode: "",
  name: "",
  description: "",
  gender: "Men",
  category: "",
  clothDesignOffered: false,
  clothDesignMinNgn: "",
  clothDesignMaxNgn: "",
  defaultFabricCode: "",
  tailoringDays: "",
  supplier: "",
  imageUrl: "",
  active: true,
  twoPiece: emptyBand,
  threePiece: emptyBand,
};

type FormState = typeof emptyForm;

const bandToForm = (bands: StyleBand[], option: PieceOption): BandForm => {
  const band = bands.find((b) => b.pieceOption === option);
  return band
    ? {
        offered: true,
        min: numStr(band.tailorMinNgn),
        max: numStr(band.tailorMaxNgn),
        yards: numStr(band.yardsRequired),
        logistics: numStr(band.logisticsUsd),
      }
    : emptyBand;
};

const toForm = (s: PricingStyle): FormState => ({
  styleCode: s.styleCode,
  name: s.name,
  description: s.description || "",
  gender: s.gender || "Men",
  category: s.category || "",
  clothDesignOffered: s.clothDesignOffered,
  clothDesignMinNgn: numStr(s.clothDesignMinNgn),
  clothDesignMaxNgn: numStr(s.clothDesignMaxNgn),
  defaultFabricCode: s.defaultFabricCode || "",
  tailoringDays: numStr(s.tailoringDays),
  supplier: s.supplier || "",
  imageUrl: s.imageUrl || "",
  active: s.active,
  twoPiece: bandToForm(s.bands || [], "TWO_PIECE"),
  threePiece: bandToForm(s.bands || [], "THREE_PIECE"),
});

const BandEditor = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: BandForm;
  onChange: (_next: BandForm) => void;
}) => (
  <div className="rounded-md border border-gray-200 p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={!value.offered}
          onChange={(e) => onChange({ ...value, offered: !e.target.checked })}
        />
        Not offered
      </label>
    </div>
    {value.offered && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Field label="Tailor min (NGN) *">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
          />
        </Field>
        <Field label="Tailor max (NGN) *">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={value.max}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
          />
        </Field>
        <Field label="Yards of fabric needed *" hint="The fabric chosen sets the cost per yard.">
          <input
            type="number"
            min="0"
            step="0.25"
            className={inputClass}
            value={value.yards}
            onChange={(e) => onChange({ ...value, yards: e.target.value })}
          />
        </Field>
        <Field label="Logistics override (USD)" hint="Blank = use the default.">
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={value.logistics}
            onChange={(e) => onChange({ ...value, logistics: e.target.value })}
          />
        </Field>
      </div>
    )}
  </div>
);

const StylesTab = () => {
  const { data: styles = [], isLoading } = useGetPricingStylesQuery();
  const { data: fabrics = [] } = useGetPricingFabricsQuery();
  const [upsertStyle, { isLoading: isSaving }] =
    useUpsertPricingStyleMutation();
  const [setActive] = useSetPricingStyleActiveMutation();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [uploadProductImage] = useUploadProductImageMutation();
  const [uploading, setUploading] = useState(false);

  // Picks one or more pictures, stores them in S3 and appends their permanent URLs to the field
  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        // eslint-disable-next-line no-await-in-loop
        const res = await uploadProductImage(file).unwrap();
        urls.push(res.imageUrl);
      }
      const existing = form.imageUrl ? [form.imageUrl] : [];
      setForm((f) => ({ ...f, imageUrl: [...existing, ...urls].join(",") }));
      showToast.success(`${urls.length} picture(s) uploaded`);
    } catch (e) {
      showToast.error(apiErrorMessage(e, "Picture upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openForm = (style?: PricingStyle) => {
    setForm(style ? toForm(style) : emptyForm);
    setEditing(!!style);
    setFormError("");
    setShowForm(true);
  };

  const toggleActive = async (style: PricingStyle) => {
    try {
      await setActive({
        styleCode: style.styleCode,
        active: !style.active,
      }).unwrap();
      showToast.success(style.active ? "Style hidden" : "Style activated");
    } catch (e: any) {
      showToast.error(apiErrorMessage(e, "Failed to update style"));
    }
  };

  const buildBands = (): { bands?: StyleBand[]; error?: string } => {
    const bands: StyleBand[] = [];
    const entries: [string, PieceOption, BandForm][] = [
      ["2-piece", "TWO_PIECE", form.twoPiece],
      ["3-piece", "THREE_PIECE", form.threePiece],
    ];
    for (const [label, pieceOption, band] of entries) {
      if (!band.offered) continue;
      const min = toNum(band.min);
      const max = toNum(band.max);
      const yards = toNum(band.yards);
      const logistics = toNum(band.logistics);
      if (min === undefined || max === undefined) {
        return { error: `${label}: tailor min and max are required` };
      }
      if (
        isNegativeOrNaN(min) ||
        isNegativeOrNaN(max) ||
        isNegativeOrNaN(yards) ||
        isNegativeOrNaN(logistics)
      ) {
        return { error: `${label}: amounts must be non-negative numbers` };
      }
      if (min > max) {
        return { error: `${label}: tailor min cannot be higher than max` };
      }
      bands.push({
        pieceOption,
        tailorMinNgn: min,
        tailorMaxNgn: max,
        yardsRequired: yards ?? null,
        logisticsUsd: logistics ?? null,
      });
    }
    return { bands };
  };

  const handleSave = async () => {
    if (!form.styleCode.trim()) return setFormError("Style code is required");
    if (!form.name.trim()) return setFormError("Name is required");
    const built = buildBands();
    if (built.error) return setFormError(built.error);

    const designMin = toNum(form.clothDesignMinNgn);
    const designMax = toNum(form.clothDesignMaxNgn);
    const days = toNum(form.tailoringDays);
    if (
      isNegativeOrNaN(designMin) ||
      isNegativeOrNaN(designMax) ||
      isNegativeOrNaN(days)
    ) {
      return setFormError(
        "Cloth design amounts and tailoring days must be non-negative numbers"
      );
    }
    if (form.clothDesignOffered) {
      if (designMin === undefined || designMax === undefined) {
        return setFormError(
          "Cloth design min and max are required when it is offered"
        );
      }
      if (designMin > designMax) {
        return setFormError("Cloth design min cannot be higher than max");
      }
    }

    try {
      const saved = await upsertStyle({
        styleCode: form.styleCode.trim(),
        name: form.name.trim(),
        description: form.description || undefined,
        gender: form.gender || undefined,
        category: form.category || undefined,
        clothDesignOffered: form.clothDesignOffered,
        clothDesignMinNgn: form.clothDesignOffered ? designMin : undefined,
        clothDesignMaxNgn: form.clothDesignOffered ? designMax : undefined,
        defaultFabricCode: form.defaultFabricCode || undefined,
        tailoringDays: days,
        supplier: form.supplier || undefined,
        imageUrl: form.imageUrl || undefined,
        active: form.active,
        bands: built.bands || [],
      }).unwrap();
      showToast.success(
        saved.issues?.length
          ? "Style saved but hidden until the listed issues are fixed"
          : "Style saved"
      );
      setShowForm(false);
    } catch (e: any) {
      setFormError(apiErrorMessage(e, "Failed to save style"));
    }
  };

  const columns = [
    { key: "styleCode", header: "Code" },
    { key: "name", header: "Name" },
    {
      key: "startingPrice",
      header: "Starting price",
      render: (v: unknown) => formatUsd(v as number),
    },
    {
      key: "active",
      header: "Active",
      render: (_v: unknown, row: PricingStyle) => (
        <button type="button" onClick={() => toggleActive(row)}>
          <StatusPill on={row.active} onLabel="Active" offLabel="Hidden" />
        </button>
      ),
    },
    {
      key: "visible",
      header: "Visible",
      render: (v: unknown) => (
        <StatusPill on={!!v} onLabel="Live" offLabel="Not live" />
      ),
    },
    {
      key: "issues",
      header: "Status",
      render: (_v: unknown, row: PricingStyle) => (
        <IssueBadges issues={row.issues} />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (_v: unknown, row: PricingStyle) => (
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
          Tailor min/max are Cuffino&apos;s cost in naira. Styles with issues
          are saved but hidden from customers.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            Import spreadsheet
          </Button>
          <Button onClick={() => openForm()}>Add style</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={styles.map((s) => ({ ...s, id: s.profileId }))}
          columns={columns}
          loading={isLoading}
          emptyMessage="No styles yet. Import the styles sheet or add one."
        />
      </div>

      <ImportDialog
        kind="styles"
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
            {editing ? "Edit style" : "Add style"}
          </h2>
          {formError && <Notice tone="error">{formError}</Notice>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Style code *">
              <input
                className={inputClass}
                value={form.styleCode}
                disabled={editing}
                onChange={(e) => set("styleCode", e.target.value)}
              />
            </Field>
            <Field label="Name *" className="md:col-span-2">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              rows={2}
              className={inputClass}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Gender">
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </Field>
            <Field label="Category">
              <input
                className={inputClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </Field>
            <Field label="Tailoring days">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.tailoringDays}
                onChange={(e) => set("tailoringDays", e.target.value)}
              />
            </Field>
          </div>

          <BandEditor
            title="2-piece (Buba & Sokoto)"
            value={form.twoPiece}
            onChange={(next) => set("twoPiece", next)}
          />
          <BandEditor
            title="3-piece (Buba, Sokoto & Agbada)"
            value={form.threePiece}
            onChange={(next) => set("threePiece", next)}
          />

          <div className="rounded-md border border-gray-200 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={form.clothDesignOffered}
                onChange={(e) => set("clothDesignOffered", e.target.checked)}
              />
              Cloth design offered
            </label>
            {form.clothDesignOffered && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Design min (NGN) *">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.clothDesignMinNgn}
                    onChange={(e) => set("clothDesignMinNgn", e.target.value)}
                  />
                </Field>
                <Field label="Design max (NGN) *">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.clothDesignMaxNgn}
                    onChange={(e) => set("clothDesignMaxNgn", e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Default fabric"
              hint="Used for the starting price shown before the customer chooses."
            >
              <select
                className={inputClass}
                value={form.defaultFabricCode}
                onChange={(e) => set("defaultFabricCode", e.target.value)}
              >
                <option value="">None</option>
                {fabrics.map((f) => (
                  <option key={f.fabricCode} value={f.fabricCode}>
                    {f.fabricCode} - {f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Supplier">
              <input
                className={inputClass}
                value={form.supplier}
                onChange={(e) => set("supplier", e.target.value)}
              />
            </Field>
            <Field label="Images (first one is the main picture; separate links with commas)">
              <input
                className={inputClass}
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                className="mt-2 text-xs"
                onChange={(e) => {
                  uploadImages(e.target.files);
                  e.target.value = "";
                }}
              />
              {uploading && (
                <p className="text-xs text-gray-500 mt-1">Uploading...</p>
              )}
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            Active (shown to customers once complete)
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={isSaving}>
              Save style
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StylesTab;
