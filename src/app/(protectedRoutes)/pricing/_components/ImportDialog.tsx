/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import { Download } from "lucide-react";
import React, { useState } from "react";

import { Button, Modal } from "@/components/ui";
import {
  ImportKind,
  ImportResult,
  useDownloadPricingTemplateMutation,
  useImportPricingSheetMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import { apiErrorMessage, Notice } from "./shared";

const rowTone: Record<string, string> = {
  OK: "bg-green-50 text-green-800",
  WARNING: "bg-amber-50 text-amber-800",
  ERROR: "bg-red-50 text-red-800",
};

interface Props {
  kind: ImportKind;
  isOpen: boolean;
  onClose: () => void;
}

// Dry-run first, always: the Apply button stays disabled until a dry run has come back with no errors.
const ImportDialog = ({ kind, isOpen, onClose }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportResult | null>(null);
  const [applied, setApplied] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const [importSheet, { isLoading }] = useImportPricingSheetMutation();
  const [downloadTemplate, { isLoading: isDownloading }] =
    useDownloadPricingTemplateMutation();

  const label = kind === "styles" ? "styles" : "fabrics";

  const reset = () => {
    setFile(null);
    setReport(null);
    setApplied(null);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDownload = async () => {
    try {
      await downloadTemplate(kind).unwrap();
    } catch (e: any) {
      showToast.error(apiErrorMessage(e, "Failed to download template"));
    }
  };

  const handleFile = (selected: File | null) => {
    // A new file invalidates any earlier dry run.
    setFile(selected);
    setReport(null);
    setApplied(null);
    setError("");
  };

  const run = async (dryRun: boolean) => {
    if (!file) return;
    setError("");
    try {
      const result = await importSheet({ kind, file, dryRun }).unwrap();
      if (dryRun) {
        setReport(result);
      } else {
        setApplied(result);
        setReport(null);
        showToast.success(
          `Import applied: ${result.created} created, ${result.updated} updated`
        );
      }
    } catch (e: any) {
      setError(apiErrorMessage(e, "Import failed"));
    }
  };

  const canApply = !!file && !!report && report.errors === 0 && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
      className="max-w-3xl"
    >
      <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900">
          Import {label} from spreadsheet
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            loading={isDownloading}
          >
            <Download className="w-4 h-4" /> Download template
          </Button>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </div>

        <p className="text-xs text-gray-500">
          The file is checked first (nothing is saved). If any row has an error,
          nothing is applied; fix the sheet and check again. Warning rows are
          saved but stay hidden from customers until complete.
        </p>

        {error && <Notice tone="error">{error}</Notice>}

        {applied && (
          <Notice tone="info">
            Applied: {applied.created} created, {applied.updated} updated
            {applied.warnings > 0 && `, ${applied.warnings} with warnings`}.
          </Notice>
        )}

        {report && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Dry run: {report.errors} error(s), {report.warnings} warning(s),{" "}
              {report.created} would be created, {report.updated} updated.
            </p>
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Row</th>
                    <th className="px-3 py-2 text-left">Code</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr
                      key={`${row.row}-${row.code}`}
                      className={rowTone[row.status]}
                    >
                      <td className="px-3 py-2">{row.row}</td>
                      <td className="px-3 py-2">{row.code || "-"}</td>
                      <td className="px-3 py-2 font-medium">{row.status}</td>
                      <td className="px-3 py-2">
                        {row.messages.length ? row.messages.join("; ") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            {applied ? "Close" : "Cancel"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!file || isLoading || !!applied}
            onClick={() => run(true)}
          >
            Check file (dry run)
          </Button>
          <Button
            type="button"
            disabled={!canApply || !!applied}
            onClick={() => run(false)}
          >
            Apply import
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportDialog;
