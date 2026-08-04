"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Download, ArrowLeft } from "lucide-react";
import {
  executeReport,
  applyGrouping,
  type ReportConfig,
  type GroupedResult,
} from "@/lib/report-engine";

interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  config: ReportConfig;
  created_at: string;
}

export default function ReportExecutionPage() {
  const params = useParams();
  const id = params.id as string;

  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndExecute() {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: tpl, error: fetchErr } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !tpl) {
        setError("Rapport introuvable.");
        setLoading(false);
        return;
      }

      const loadedTemplate = tpl as ReportTemplate;
      setTemplate(loadedTemplate);

      try {
        const config = loadedTemplate.config;
        const rows = await executeReport(config);
        setData(rows);

        if (config.groupBy && config.groupBy.length > 0) {
          const grouped = applyGrouping(rows, config);
          setGroupedData(grouped);
        } else {
          setGroupedData([]);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setError(`Erreur lors de l'execution du rapport : ${message}`);
      }

      setLoading(false);
    }

    if (id) {
      loadAndExecute();
    }
  }, [id]);

  function getOrientation(): "portrait" | "landscape" {
    if (!template) return "portrait";
    const config = template.config;
    if (config.orientation === "landscape") return "landscape";
    if (config.orientation === "portrait") return "portrait";
    // auto: landscape if > 5 columns
    return config.columns.length > 5 ? "landscape" : "portrait";
  }

  function exportPDF() {
    window.print();
  }

  function exportCSV() {
    if (!template) return;
    const config = template.config;

    // Build CSV header
    const headers = config.columns.map((col) => col.label);
    let csv = headers.join(",") + "\n";

    // Build CSV rows
    const rows = data;
    for (const row of rows) {
      const values = config.columns.map((col) => {
        const key = `${col.table}.${col.field}`;
        const val = row[key];
        if (val === null || val === undefined) return "";
        const str = String(val);
        // Escape quotes and wrap in quotes if contains comma or quote
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csv += values.join(",") + "\n";
    }

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (template.name || "rapport").replace(/\s+/g, "-").toLowerCase();
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    a.download = `rapport-${safeName}-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatCellValue(value: unknown, type: string): string {
    if (value === null || value === undefined) return "-";
    if (type === "date") {
      const d = new Date(String(value) + "T00:00:00");
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString("fr-FR");
    }
    if (type === "number") {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return num.toLocaleString("fr-FR");
    }
    if (type === "boolean") {
      return value === true ? "Oui" : value === false ? "Non" : "-";
    }
    return String(value);
  }

  function getColumnStyle(type: string): React.CSSProperties {
    if (type === "date") return { width: "90px", minWidth: "90px" };
    if (type === "number") return { width: "70px", minWidth: "70px" };
    if (type === "boolean") return { width: "50px", minWidth: "50px" };
    return { minWidth: "120px" };
  }

  const orientation = getOrientation();
  const today = new Date().toLocaleDateString("fr-FR");
  const reportTitle = template?.config?.title || template?.name || "Rapport";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href="/reports" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          Retour aux rapports
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const hasGrouping = groupedData.length > 0 && template?.config.groupBy && template.config.groupBy.length > 0;

  // Compute grand totals across all rows
  const grandTotals: Record<string, number> = {};
  if (template?.config.totals && template.config.totals.length > 0) {
    for (const total of template.config.totals) {
      const values = data
        .map((row) => row[total.field])
        .filter((v): v is number => typeof v === "number");
      switch (total.fn) {
        case "SUM":
          grandTotals[total.label] = values.reduce((sum, v) => sum + v, 0);
          break;
        case "COUNT":
          grandTotals[total.label] = values.length;
          break;
        case "AVG":
          grandTotals[total.label] = values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 0;
          break;
      }
    }
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 15mm; size: ${orientation}; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { page-break-inside: avoid; }
          td, th { padding: 6px 8px; border: 1px solid #e2e8f0; word-wrap: break-word; white-space: normal; }
          .print-header { position: fixed; top: 0; left: 0; right: 0; padding: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 10px; display: flex; justify-content: space-between; }
          .print-footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 8px 0 0 0; border-top: 1px solid #e2e8f0; font-size: 9px; text-align: center; color: #64748b; }
          .subtotal-row { background-color: #f3f4f6 !important; }
          .subtotal-row td { font-weight: 500; }
          .grand-total-row { background-color: #e2e8f0 !important; }
          .grand-total-row td { font-weight: 700; }
          .group-header-row { background-color: #eef2ff !important; }
          .group-header-row td { font-weight: 600; }
          body { padding-top: 30px; padding-bottom: 30px; }
        }
        .print-only { display: none; }
      `}} />

      {/* Header - no-print */}
      <div className="no-print">
        <Link href="/reports" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour aux rapports
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{reportTitle}</h1>
            {template?.description && (
              <p className="text-slate-500 mt-1">{template.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Print header - repeats on each page via position:fixed */}
      <div className="print-only" aria-hidden="true">
        <div className="print-header">
          <span style={{ fontWeight: 600 }}>{reportTitle}</span>
          <span>Genere le {today}</span>
        </div>
        <div className="print-footer">
          Genere par WorkDays le {today}
        </div>
      </div>

      {/* Data count */}
      <p className="text-xs text-slate-500 no-print">
        {data.length} ligne{data.length !== 1 ? "s" : ""} trouvee{data.length !== 1 ? "s" : ""}
      </p>

      {/* Limit warning */}
      {data.length === 5000 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm no-print">
          <span>Resultats limites a 5000 lignes.</span>
        </div>
      )}

      {/* Table */}
      {data.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">Aucune donnee trouvee pour ce rapport.</p>
        </div>
      ) : hasGrouping ? (
        /* Grouped data rendering */
        <div className="space-y-6">
          {groupedData.map((group, gi) => {
            const groupLabel = Object.entries(group.groupKey)
              .map(([field, value]) => {
                const col = template!.config.columns.find((c) => `${c.table}.${c.field}` === field);
                const label = col ? col.label : field;
                return `${label}: ${value ?? "-"}`;
              })
              .join(" | ");

            return (
              <div key={gi} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 group-header-row">
                  <p className="text-sm font-semibold text-slate-700">{groupLabel}</p>
                  <p className="text-xs text-slate-500">{group.rows.length} ligne{group.rows.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ tableLayout: "auto" }}>
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {template!.config.columns.map((col, ci) => (
                          <th
                            key={ci}
                            className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase"
                            style={{ ...getColumnStyle(col.type), wordWrap: "break-word", whiteSpace: "normal" }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-slate-50">
                          {template!.config.columns.map((col, ci) => {
                            const key = `${col.table}.${col.field}`;
                            return (
                              <td
                                key={ci}
                                className="px-4 py-2 text-sm text-slate-700"
                                style={{ ...getColumnStyle(col.type), wordWrap: "break-word", whiteSpace: "normal" }}
                              >
                                {formatCellValue(row[key], col.type)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Group subtotals - styled with gray background */}
                {Object.keys(group.totals).length > 0 && (
                  <div className="bg-gray-100 subtotal-row px-4 py-2 border-t border-slate-200 flex flex-wrap gap-4">
                    {Object.entries(group.totals).map(([label, value]) => (
                      <span key={label} className="text-xs font-medium text-slate-700">
                        {label}: {typeof value === "number" ? value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand totals */}
          {Object.keys(grandTotals).length > 0 && (
            <div className="bg-slate-200 grand-total-row rounded-lg border border-slate-300 px-4 py-3 flex flex-wrap gap-4">
              <span className="text-sm font-bold text-slate-900">Totaux generaux :</span>
              {Object.entries(grandTotals).map(([label, value]) => (
                <span key={label} className="text-sm font-bold text-slate-800">
                  {label}: {typeof value === "number" ? value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : value}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Flat (non-grouped) data rendering */
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: "auto" }}>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {template!.config.columns.map((col, ci) => (
                    <th
                      key={ci}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase"
                      style={{ ...getColumnStyle(col.type), wordWrap: "break-word", whiteSpace: "normal" }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50">
                    {template!.config.columns.map((col, ci) => {
                      const key = `${col.table}.${col.field}`;
                      return (
                        <td
                          key={ci}
                          className="px-4 py-2 text-sm text-slate-700"
                          style={{ ...getColumnStyle(col.type), wordWrap: "break-word", whiteSpace: "normal" }}
                        >
                          {formatCellValue(row[key], col.type)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Grand totals for flat view */}
          {Object.keys(grandTotals).length > 0 && (
            <div className="bg-slate-200 grand-total-row px-4 py-3 border-t border-slate-300 flex flex-wrap gap-4">
              <span className="text-sm font-bold text-slate-900">Totaux generaux :</span>
              {Object.entries(grandTotals).map(([label, value]) => (
                <span key={label} className="text-sm font-bold text-slate-800">
                  {label}: {typeof value === "number" ? value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
