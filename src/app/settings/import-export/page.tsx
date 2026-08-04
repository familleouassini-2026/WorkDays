"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { importTemplates, ImportTemplate } from "@/data/import-templates";
import { Download, Upload, AlertTriangle, XCircle, X, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

// ============================================================
// TYPES
// ============================================================

interface TableCount {
  [tableName: string]: number;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportReport {
  inserted: number;
  updated: number;
  errors: ImportError[];
}

type ImportMode = "insert" | "upsert";

const BATCH_SIZE = 50;

// ============================================================
// HELPERS
// ============================================================

function detectSeparator(text: string): string {
  const firstLine = text.split("\n")[0] || "";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ";" : ",";
}

function parseCSV(text: string, separator: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === separator && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return "";
  if (type === "boolean") return value ? "Oui" : "Non";
  if (type === "date") {
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("fr-BE");
  }
  return String(value);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ImportExportPage() {
  const [counts, setCounts] = useState<TableCount>({});
  const [loading, setLoading] = useState(true);
  const [activeImport, setActiveImport] = useState<ImportTemplate | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  // Import state
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>("insert");
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [fkCache, setFkCache] = useState<Record<string, Record<string, number>>>({});
  const [showErrors, setShowErrors] = useState(false);

  // ============================================================
  // FETCH COUNTS (parallel using Promise.all)
  // ============================================================

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const results = await Promise.all(
      importTemplates.map(async (tpl) => {
        const { count } = await supabase
          .from(tpl.tableName)
          .select("*", { count: "exact", head: true });
        return { tableName: tpl.tableName, count: count || 0 };
      })
    );
    const newCounts: TableCount = {};
    for (const r of results) {
      newCounts[r.tableName] = r.count;
    }
    setCounts(newCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // EXPORT
  // ============================================================

  async function handleExport(template: ImportTemplate) {
    setExporting(template.tableName);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from(template.tableName)
        .select("*")
        .range(0, 9999);
      if (fetchError) {
        alert(`Erreur lors de la recuperation des donnees : ${fetchError.message}`);
        setExporting(null);
        return;
      }
      if (!data || data.length === 0) {
        alert("Aucune donnee a exporter pour cette table.");
        setExporting(null);
        return;
      }

      // Resolve FK labels
      const fkLookups: Record<string, Record<number, string>> = {};
      const fkErrors: string[] = [];
      for (const col of template.columns) {
        if (col.fk) {
          const { data: refData, error: fkError } = await supabase
            .from(col.fk.table)
            .select(`${col.fk.idField},${col.fk.labelField}`)
            .range(0, 9999);
          if (fkError) {
            fkErrors.push(`${col.label}: ${fkError.message}`);
          } else if (refData) {
            const lookup: Record<number, string> = {};
            for (const row of refData) {
              const idKey = col.fk.idField as string;
              const labelKey = col.fk.labelField as string;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const r = row as any;
              lookup[r[idKey] as number] = String(r[labelKey] || "");
            }
            fkLookups[col.field] = lookup;
          }
        }
      }

      if (fkErrors.length > 0) {
        const proceed = confirm(
          `Attention : certaines references n'ont pas pu etre resolues :\n${fkErrors.join("\n")}\n\nContinuer l'export sans ces labels ?`
        );
        if (!proceed) {
          setExporting(null);
          return;
        }
      }

      // Build HTML table
      let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
      html += `<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${template.displayName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>`;
      html += `<body><table border="1">`;

      // Headers (French labels) + FK label columns
      html += "<tr>";
      for (const col of template.columns) {
        html += `<th style="background:#4472C4;color:white;font-weight:bold;padding:4px 8px;">${col.label}</th>`;
        if (col.fk) {
          html += `<th style="background:#4472C4;color:white;font-weight:bold;padding:4px 8px;">${col.label} (nom)</th>`;
        }
      }
      html += "</tr>";

      // Data rows
      for (const row of data) {
        html += "<tr>";
        for (const col of template.columns) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const val = (row as any)[col.field];
          html += `<td style="padding:4px 8px;">${formatValue(val, col.type)}</td>`;
          if (col.fk) {
            const label = fkLookups[col.field]?.[val as number] || "";
            html += `<td style="padding:4px 8px;">${label}</td>`;
          }
        }
        html += "</tr>";
      }
      html += "</table></body></html>";

      // Download
      const blob = new Blob(["\uFEFF" + html], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.tableName}_export.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Erreur lors de l'export");
    }
    setExporting(null);
  }

  // ============================================================
  // IMPORT - File handling
  // ============================================================

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const sep = detectSeparator(text);
      const parsed = parseCSV(text, sep);
      if (parsed.length < 2) {
        alert("Le fichier doit contenir au moins un en-tete et une ligne de donnees.");
        return;
      }
      setCsvHeaders(parsed[0]);
      setCsvData(parsed.slice(1));
      setImportErrors([]);
      setImportReport(null);
      setImportProgress(0);
    };
    reader.readAsText(file, "UTF-8");
  }

  // ============================================================
  // IMPORT - Validation
  // ============================================================

  async function validateData(template: ImportTemplate, headers: string[], rows: string[][]) {
    const errors: ImportError[] = [];
    const cache: Record<string, Record<string, number>> = {};
    const supabase = createClient();

    // Load FK lookups for validation
    for (const col of template.columns) {
      if (col.fk) {
        const { data: refData, error: fkError } = await supabase
          .from(col.fk.table)
          .select(`${col.fk.idField},${col.fk.labelField}`)
          .range(0, 9999);
        if (fkError) {
          errors.push({
            row: 0,
            field: col.label,
            message: `Impossible de charger les references depuis ${col.fk.table}: ${fkError.message}`,
          });
        } else if (refData) {
          const lookup: Record<string, number> = {};
          for (const row of refData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r = row as any;
            const label = String(r[col.fk.labelField] || "").toLowerCase();
            lookup[label] = r[col.fk.idField] as number;
            // Also allow by ID
            lookup[String(r[col.fk.idField])] = r[col.fk.idField] as number;
          }
          cache[col.field] = lookup;
        }
      }
    }
    setFkCache(cache);

    // Validate each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (const col of template.columns) {
        const colIdx = headers.findIndex(
          (h) => h.toLowerCase() === col.label.toLowerCase() || h.toLowerCase() === col.field.toLowerCase()
        );
        if (colIdx === -1) continue;
        const val = row[colIdx] || "";

        // Required check
        if (col.required && !val && col.field !== "id") {
          errors.push({ row: i + 1, field: col.label, message: "Champ obligatoire" });
        }

        // Type checks
        if (val) {
          if (col.type === "number" && isNaN(Number(val))) {
            errors.push({ row: i + 1, field: col.label, message: `"${val}" n'est pas un nombre valide` });
          }
          if (col.type === "date") {
            const d = new Date(val);
            if (isNaN(d.getTime())) {
              errors.push({ row: i + 1, field: col.label, message: `"${val}" n'est pas une date valide` });
            }
          }
          if (col.type === "boolean" && !["true", "false", "oui", "non", "1", "0", ""].includes(val.toLowerCase())) {
            errors.push({ row: i + 1, field: col.label, message: `"${val}" n'est pas un booleen valide (Oui/Non)` });
          }

          // FK check
          if (col.fk && cache[col.field]) {
            const lookup = cache[col.field];
            if (!lookup[val.toLowerCase()] && !lookup[val]) {
              errors.push({
                row: i + 1,
                field: col.label,
                message: `Reference "${val}" introuvable dans ${col.fk.table}`,
              });
            }
          }
        }
      }
    }

    setImportErrors(errors);
    return errors;
  }

  // ============================================================
  // IMPORT - Execute
  // ============================================================

  async function executeImport(template: ImportTemplate, headers: string[], rows: string[][]) {
    // Show warning about partial import risk
    const confirmed = confirm(
      `Vous etes sur le point d'importer ${rows.length} ligne(s) dans "${template.displayName}".\n\n` +
      `Attention : en cas d'interruption (coupure reseau, fermeture du navigateur), ` +
      `les lignes deja importees ne seront pas annulees.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setImporting(true);
    setImportProgress(0);
    const report: ImportReport = { inserted: 0, updated: 0, errors: [] };
    const supabase = createClient();

    // Build all records first
    const records: { record: Record<string, unknown>; rowIndex: number; hasId: boolean }[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const record: Record<string, unknown> = {};
      let hasId = false;

      for (const col of template.columns) {
        if (col.field === "id") {
          // For upsert mode, check if ID is present
          const idIdx = headers.findIndex(
            (h) => h.toLowerCase() === "id"
          );
          const idVal = idIdx >= 0 ? row[idIdx] : null;
          if (idVal && Number(idVal)) {
            record.id = Number(idVal);
            hasId = true;
          }
          continue;
        }
        const colIdx = headers.findIndex(
          (h) => h.toLowerCase() === col.label.toLowerCase() || h.toLowerCase() === col.field.toLowerCase()
        );
        if (colIdx === -1) continue;
        let val: string | number | boolean | null = row[colIdx] || null;

        if (val !== null && val !== "") {
          if (col.type === "number") {
            val = Number(val);
          } else if (col.type === "boolean") {
            const bStr = String(val).toLowerCase();
            val = bStr === "true" || bStr === "oui" || bStr === "1";
          } else if (col.fk && fkCache[col.field]) {
            // Resolve FK: try label first, then direct ID
            const lookup = fkCache[col.field];
            const resolved = lookup[String(val).toLowerCase()] || lookup[String(val)];
            if (resolved) {
              val = resolved;
            } else {
              // Try as number (direct ID)
              const numVal = Number(val);
              if (!isNaN(numVal)) val = numVal;
            }
          }
        } else {
          val = null;
        }
        record[col.field] = val;
      }
      records.push({ record, rowIndex: i + 1, hasId });
    }

    // Process in batches
    for (let batchStart = 0; batchStart < records.length; batchStart += BATCH_SIZE) {
      const batch = records.slice(batchStart, batchStart + BATCH_SIZE);

      try {
        if (importMode === "upsert") {
          // Separate records with ID from those without
          const withId = batch.filter((r) => r.hasId);
          const withoutId = batch.filter((r) => !r.hasId);

          // Upsert records that have an ID (use onConflict with keyField)
          if (withId.length > 0) {
            const { error } = await supabase
              .from(template.tableName)
              .upsert(withId.map((r) => r.record), { onConflict: "id" });
            if (error) {
              for (const r of withId) {
                report.errors.push({ row: r.rowIndex, field: "-", message: error.message });
              }
            } else {
              report.updated += withId.length;
            }
          }

          // For records without ID, upsert using keyField
          if (withoutId.length > 0) {
            const { error } = await supabase
              .from(template.tableName)
              .upsert(withoutId.map((r) => r.record), { onConflict: template.keyField });
            if (error) {
              for (const r of withoutId) {
                report.errors.push({ row: r.rowIndex, field: "-", message: error.message });
              }
            } else {
              report.updated += withoutId.length;
            }
          }
        } else {
          // Insert only mode
          const { error } = await supabase
            .from(template.tableName)
            .insert(batch.map((r) => r.record));
          if (error) {
            for (const r of batch) {
              report.errors.push({ row: r.rowIndex, field: "-", message: error.message });
            }
          } else {
            report.inserted += batch.length;
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        for (const r of batch) {
          report.errors.push({ row: r.rowIndex, field: "-", message: msg });
        }
      }

      setImportProgress(Math.round((Math.min(batchStart + BATCH_SIZE, records.length) / records.length) * 100));
    }

    setImportReport(report);
    setImporting(false);
    fetchCounts();
  }

  // ============================================================
  // IMPORT MODAL
  // ============================================================

  function renderImportModal() {
    if (!activeImport) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-slate-900">
              Importer : {activeImport.displayName}
            </h2>
            <button
              onClick={() => {
                setActiveImport(null);
                setCsvData(null);
                setCsvHeaders([]);
                setImportErrors([]);
                setImportReport(null);
                setImportProgress(0);
              }}
              className="p-1 rounded hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* File upload */}
            {!importReport && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fichier CSV (separateur ; ou , detecte automatiquement)
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Colonnes attendues : {activeImport.columns.map((c) => c.label).join(", ")}
                </p>
              </div>
            )}

            {/* Preview */}
            {csvData && !importReport && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">
                    Apercu ({Math.min(csvData.length, 10)} sur {csvData.length} lignes)
                  </h3>
                  <div className="overflow-x-auto border rounded">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          {csvHeaders.map((h, i) => (
                            <th key={i} className="px-2 py-1 text-left font-medium text-slate-600 border-b">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 10).map((row, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-2 py-1 border-b text-slate-700">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Validation errors */}
                {importErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                      <XCircle className="w-4 h-4" />
                      {importErrors.length} erreur(s) de validation
                    </div>
                    <ul className="mt-1 text-xs text-red-600 max-h-32 overflow-y-auto">
                      {importErrors.slice(0, 20).map((err, i) => (
                        <li key={i}>Ligne {err.row}, {err.field}: {err.message}</li>
                      ))}
                      {importErrors.length > 20 && (
                        <li className="font-medium">... et {importErrors.length - 20} autres</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Import mode */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode d&apos;import</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "insert"}
                        onChange={() => setImportMode("insert")}
                      />
                      Ajouter uniquement
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "upsert"}
                        onChange={() => setImportMode("upsert")}
                      />
                      Mettre a jour (upsert par ID ou {activeImport.keyField})
                    </label>
                  </div>
                </div>

                {/* Progress bar */}
                {importing && (
                  <div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                      <span>Import en cours...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!importing && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => validateData(activeImport, csvHeaders, csvData)}
                      className="px-4 py-2 text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => executeImport(activeImport, csvHeaders, csvData)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={importing}
                    >
                      Lancer l&apos;import
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Report */}
            {importReport && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Rapport d&apos;import</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{importReport.inserted}</div>
                    <div className="text-xs text-green-600">inseres</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{importReport.updated}</div>
                    <div className="text-xs text-blue-600">mis a jour</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-red-700">{importReport.errors.length}</div>
                    <div className="text-xs text-red-600">erreurs</div>
                  </div>
                </div>

                {importReport.errors.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowErrors(!showErrors)}
                      className="text-sm text-red-600 underline"
                    >
                      {showErrors ? "Masquer" : "Voir"} les erreurs
                    </button>
                    {showErrors && (
                      <ul className="mt-2 text-xs text-red-600 max-h-48 overflow-y-auto bg-red-50 p-2 rounded">
                        {importReport.errors.map((err, i) => (
                          <li key={i}>Ligne {err.row}: {err.message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setActiveImport(null);
                    setCsvData(null);
                    setCsvHeaders([]);
                    setImportErrors([]);
                    setImportReport(null);
                  }}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DEPENDENCY WARNINGS
  // ============================================================

  function getDependencyWarning(template: ImportTemplate): string | null {
    const fkCols = template.columns.filter((c) => c.fk);
    const emptyDeps = fkCols
      .filter((c) => c.fk && (counts[c.fk.table] || 0) === 0)
      .map((c) => {
        const depTpl = importTemplates.find((t) => t.tableName === c.fk!.table);
        return depTpl?.displayName || c.fk!.table;
      });
    if (emptyDeps.length === 0) return null;
    return `Dependance(s) vide(s) : ${emptyDeps.join(", ")}`;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/settings" className="text-blue-600 hover:underline text-sm">
              Parametres
            </Link>
            <span className="text-slate-400">/</span>
            <h1 className="text-2xl font-bold text-slate-900">Import / Export</h1>
          </div>
          <p className="text-slate-500 mt-1">
            Importer et exporter les donnees de toutes les tables en CSV/Excel
          </p>
        </div>
        <FileSpreadsheet className="w-8 h-8 text-blue-600" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importTemplates.map((template) => {
            const count = counts[template.tableName] || 0;
            const warning = getDependencyWarning(template);

            return (
              <div
                key={template.tableName}
                className="card p-4 border rounded-lg hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {template.order}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{template.displayName}</h3>
                      <p className="text-xs text-slate-500">
                        {count} enregistrement{count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {warning && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>{warning}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleExport(template)}
                    disabled={exporting === template.tableName || count === 0}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3" />
                    {exporting === template.tableName ? "Export..." : "Exporter Excel"}
                  </button>
                  <button
                    onClick={() => {
                      setActiveImport(template);
                      setCsvData(null);
                      setCsvHeaders([]);
                      setImportErrors([]);
                      setImportReport(null);
                      setImportProgress(0);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                  >
                    <Upload className="w-3 h-3" />
                    Importer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {renderImportModal()}
    </div>
  );
}
