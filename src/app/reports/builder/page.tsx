"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { schemaMetadata, type TableMetadata } from "@/data/schema-metadata";
import {
  resolveJoins,
  executeReport,
  type ReportConfig,
  type ReportColumn,
  type ReportJoin,
  type ReportFilter,
  type ReportSort,
  type ReportTotal,
  type JoinPath,
} from "@/lib/report-engine";
import {
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// Step labels in French
const STEP_LABELS = [
  "Tables",
  "Colonnes",
  "Filtres",
  "Groupements",
  "Tri",
  "Export",
];

type Operator = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "like" | "is_null" | "is_not_null";

interface FilterRow {
  field: string;
  op: Operator;
  value: string;
}

interface SortRow {
  field: string;
  direction: "asc" | "desc";
}

interface TotalRow {
  field: string;
  fn: "SUM" | "COUNT" | "AVG";
  label: string;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "date":
      return <Calendar className="w-4 h-4 text-slate-400" />;
    case "number":
      return <Hash className="w-4 h-4 text-slate-400" />;
    case "boolean":
      return <ToggleLeft className="w-4 h-4 text-slate-400" />;
    default:
      return <Type className="w-4 h-4 text-slate-400" />;
  }
}

export default function ReportBuilderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Chargement...</div>}>
      <ReportBuilderContent />
    </Suspense>
  );
}

function ReportBuilderContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const duplicateId = searchParams.get("duplicate");
  const templateId = editId || duplicateId;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ReportColumn[]>([]);
  const [joins, setJoins] = useState<JoinPath[]>([]);
  const [joinWarning, setJoinWarning] = useState("");
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [totals, setTotals] = useState<TotalRow[]>([]);
  const [sortRows, setSortRows] = useState<SortRow[]>([]);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Load existing template for edit/duplicate mode
  useEffect(() => {
    if (!templateId) return;
    const loadTemplate = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (error || !data) return;
      const config = data.config as ReportConfig;
      setSelectedTables(config.tables || []);
      setSelectedColumns(config.columns || []);
      // Re-resolve joins to get correct direction information
      const resolved = resolveJoins(config.tables || []);
      setJoins(resolved);
      setFilters(
        (config.filters || []).map((f: ReportFilter) => ({
          field: f.field,
          op: f.op === "is" ? "is_null" as Operator : f.op === "not_null" ? "is_not_null" as Operator : f.op as Operator,
          value: f.value === null ? "" : String(f.value),
        }))
      );
      setGroupBy(config.groupBy || []);
      setTotals(
        (config.totals || []).map((t: ReportTotal) => ({
          field: t.field,
          fn: t.fn,
          label: t.label,
        }))
      );
      setSortRows(
        (config.sortBy || []).map((s: ReportSort) => ({
          field: s.field,
          direction: s.direction,
        }))
      );
      setReportName(editId ? (data.name || "") : "");
      setReportTitle(config.title || "");
      setReportDescription(editId ? (data.description || "") : "");
      setOrientation(config.orientation || "auto");
    };
    loadTemplate();
  }, [templateId, editId]);

  // Handle table toggle
  const toggleTable = useCallback((tableName: string) => {
    setSelectedTables((prev) => {
      const next = prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName];

      // Auto-resolve joins
      const resolved = resolveJoins(next);
      setJoins(resolved);

      // Check for unlinked tables
      if (next.length >= 2 && resolved.length === 0) {
        setJoinWarning("Les tables selectionnees n'ont pas de lien direct (cle etrangere).");
      } else {
        setJoinWarning("");
      }

      // Remove columns that belong to deselected tables
      setSelectedColumns((cols) =>
        cols.filter((c) => next.includes(c.table))
      );

      return next;
    });
  }, []);

  // Handle column toggle
  const toggleColumn = useCallback(
    (table: string, field: string, label: string, type: "text" | "number" | "date" | "boolean") => {
      setSelectedColumns((prev) => {
        const key = `${table}.${field}`;
        const exists = prev.some((c) => `${c.table}.${c.field}` === key);
        if (exists) {
          return prev.filter((c) => `${c.table}.${c.field}` !== key);
        }
        return [...prev, { table, field, label, type }];
      });
    },
    []
  );

  // Build report config from current state
  const buildConfig = useCallback((): ReportConfig => {
    const mappedFilters: ReportFilter[] = filters
      .filter((f) => f.field)
      .map((f) => {
        if (f.op === "is_null") {
          return { field: f.field, op: "is" as const, value: null };
        }
        if (f.op === "is_not_null") {
          return { field: f.field, op: "not_null" as const, value: null };
        }
        if (f.op === "neq") {
          return { field: f.field, op: "neq" as const, value: f.value };
        }
        return { field: f.field, op: f.op as ReportFilter["op"], value: f.value };
      });

    const mappedJoins: ReportJoin[] = joins.map((j) => ({
      from: j.from,
      to: j.to,
      type: "inner" as const,
    }));

    const mappedTotals: ReportTotal[] = totals
      .filter((t) => t.field && t.label)
      .map((t) => ({ field: t.field, fn: t.fn, label: t.label }));

    const mappedSort: ReportSort[] = sortRows
      .filter((s) => s.field)
      .map((s) => ({ field: s.field, direction: s.direction }));

    return {
      tables: selectedTables,
      columns: selectedColumns,
      joins: mappedJoins,
      groupBy,
      totals: mappedTotals,
      filters: mappedFilters,
      sortBy: mappedSort,
      orientation,
      title: reportTitle,
    };
  }, [selectedTables, selectedColumns, joins, filters, groupBy, totals, sortRows, orientation, reportTitle]);

  // Run preview
  const runPreview = useCallback(async () => {
    if (selectedTables.length === 0 || selectedColumns.length === 0) {
      setPreviewError("Selectionnez au moins une table et une colonne.");
      return;
    }
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const config = buildConfig();
      const data = await executeReport(config);
      setPreviewData(data.slice(0, 20));
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Erreur lors de l'apercu");
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedTables, selectedColumns, buildConfig]);

  // Save template
  const handleSave = useCallback(async () => {
    if (!reportName.trim()) {
      setSaveMessage("Le nom du rapport est requis.");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      const supabase = createClient();
      const config = buildConfig();
      const payload = {
        name: reportName.trim(),
        description: reportDescription.trim() || null,
        config,
      };

      if (editId) {
        const { error } = await supabase
          .from("report_templates")
          .update(payload)
          .eq("id", editId);
        if (error) throw error;
        setSaveMessage("Rapport mis a jour avec succes.");
      } else {
        const { error } = await supabase
          .from("report_templates")
          .insert(payload);
        if (error) throw error;
        setSaveMessage("Rapport sauvegarde avec succes.");
      }
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [reportName, reportDescription, buildConfig, editId]);

  // Auto-detect orientation
  const autoOrientation = selectedColumns.length <= 5 ? "portrait" : "landscape";

  // Available columns for filters/sort (from selected columns)
  const availableFields = selectedColumns.map((c) => `${c.table}.${c.field}`);
  const numericColumns = selectedColumns.filter((c) => c.type === "number");

  // ============ RENDER STEP CONTENT ============

  const renderStep1 = () => (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Selection des tables</h3>
      {joinWarning && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{joinWarning}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {schemaMetadata.map((table: TableMetadata) => {
          const isSelected = selectedTables.includes(table.tableName);
          return (
            <button
              key={table.tableName}
              onClick={() => toggleTable(table.tableName)}
              className={`p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="font-medium text-slate-800">{table.displayName}</div>
              <div className="text-sm text-slate-500 mt-1">
                {table.columns.length} colonnes
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Selection des colonnes</h3>
      {selectedColumns.length > 10 && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Plus de 10 colonnes selectionnees. Le rapport pourrait etre difficile a lire.</span>
        </div>
      )}
      {selectedTables.length === 0 ? (
        <p className="text-slate-500">Veuillez d&apos;abord selectionner au moins une table.</p>
      ) : (
        <div className="space-y-6">
          {selectedTables.map((tableName) => {
            const table = schemaMetadata.find((t) => t.tableName === tableName);
            if (!table) return null;
            return (
              <div key={tableName}>
                <h4 className="font-medium text-slate-700 mb-2">{table.displayName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {table.columns.map((col) => {
                    const isChecked = selectedColumns.some(
                      (c) => c.table === tableName && c.field === col.field
                    );
                    return (
                      <label
                        key={`${tableName}.${col.field}`}
                        className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleColumn(tableName, col.field, col.label, col.type)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        {getTypeIcon(col.type)}
                        <span className="text-sm text-slate-700">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Filtres</h3>
      <p className="text-sm text-slate-500 mb-4">Optionnel. Ajoutez des conditions pour filtrer les donnees.</p>
      {filters.map((filter, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-3 flex-wrap">
          <select
            value={filter.field}
            onChange={(e) => {
              const updated = [...filters];
              updated[idx] = { ...updated[idx], field: e.target.value };
              setFilters(updated);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Champ --</option>
            {availableFields.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            value={filter.op}
            onChange={(e) => {
              const updated = [...filters];
              updated[idx] = { ...updated[idx], op: e.target.value as Operator };
              setFilters(updated);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="eq">egal</option>
            <option value="neq">different</option>
            <option value="gt">superieur</option>
            <option value="lt">inferieur</option>
            <option value="gte">sup. ou egal</option>
            <option value="lte">inf. ou egal</option>
            <option value="like">contient</option>
            <option value="is_null">est vide</option>
            <option value="is_not_null">n&apos;est pas vide</option>
          </select>
          {filter.op !== "is_null" && filter.op !== "is_not_null" && (
            <input
              type="text"
              value={filter.value}
              onChange={(e) => {
                const updated = [...filters];
                updated[idx] = { ...updated[idx], value: e.target.value };
                setFilters(updated);
              }}
              placeholder="Valeur"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          )}
          <button
            onClick={() => setFilters(filters.filter((_, i) => i !== idx))}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => setFilters([...filters, { field: "", op: "eq", value: "" }])}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
      >
        <Plus className="w-4 h-4" /> Ajouter un filtre
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Groupements et Totaux</h3>
      <p className="text-sm text-slate-500 mb-4">Optionnel. Regroupez les donnees et calculez des totaux.</p>

      <div className="mb-6">
        <h4 className="font-medium text-slate-700 mb-2">Grouper par</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableFields.map((field) => (
            <label key={field} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={groupBy.includes(field)}
                onChange={() => {
                  setGroupBy((prev) =>
                    prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
                  );
                }}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{field}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-slate-700 mb-2">Totaux (colonnes numeriques)</h4>
        {totals.map((total, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-3 flex-wrap">
            <select
              value={total.field}
              onChange={(e) => {
                const updated = [...totals];
                updated[idx] = { ...updated[idx], field: e.target.value };
                setTotals(updated);
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Colonne --</option>
              {numericColumns.map((c) => (
                <option key={`${c.table}.${c.field}`} value={`${c.table}.${c.field}`}>
                  {c.label} ({c.table})
                </option>
              ))}
            </select>
            <select
              value={total.fn}
              onChange={(e) => {
                const updated = [...totals];
                updated[idx] = { ...updated[idx], fn: e.target.value as "SUM" | "COUNT" | "AVG" };
                setTotals(updated);
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="SUM">SUM</option>
              <option value="COUNT">COUNT</option>
              <option value="AVG">AVG</option>
            </select>
            <input
              type="text"
              value={total.label}
              onChange={(e) => {
                const updated = [...totals];
                updated[idx] = { ...updated[idx], label: e.target.value };
                setTotals(updated);
              }}
              placeholder="Libelle"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => setTotals(totals.filter((_, i) => i !== idx))}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setTotals([...totals, { field: "", fn: "SUM", label: "" }])}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un total
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Tri</h3>
      <p className="text-sm text-slate-500 mb-4">Optionnel. Definissez l&apos;ordre de tri des resultats.</p>
      {sortRows.map((row, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-3">
          <select
            value={row.field}
            onChange={(e) => {
              const updated = [...sortRows];
              updated[idx] = { ...updated[idx], field: e.target.value };
              setSortRows(updated);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Colonne --</option>
            {availableFields.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const updated = [...sortRows];
              updated[idx] = {
                ...updated[idx],
                direction: updated[idx].direction === "asc" ? "desc" : "asc",
              };
              setSortRows(updated);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50"
          >
            {row.direction === "asc" ? "Ascendant" : "Descendant"}
          </button>
          <button
            onClick={() => setSortRows(sortRows.filter((_, i) => i !== idx))}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => setSortRows([...sortRows, { field: "", direction: "asc" }])}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
      >
        <Plus className="w-4 h-4" /> Ajouter un tri
      </button>
    </div>
  );

  const renderStep6 = () => (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Options d&apos;export</h3>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom du rapport <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Ex: Liste des employes actifs"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Description optionnelle du rapport"
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre du rapport</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Titre affiche en haut du rapport"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Orientation</label>
          <div className="flex gap-4">
            {(["auto", "portrait", "landscape"] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orientation"
                  value={opt}
                  checked={orientation === opt}
                  onChange={() => setOrientation(opt)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 capitalize">
                  {opt === "auto" ? `Auto (${autoOrientation})` : opt === "portrait" ? "Portrait" : "Paysage"}
                </span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {saveMessage && (
          <p className={`text-sm ${saveMessage.includes("succes") ? "text-green-600" : "text-red-600"}`}>
            {saveMessage}
          </p>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      case 3: return renderStep4();
      case 4: return renderStep5();
      case 5: return renderStep6();
      default: return null;
    }
  };

  // ============ MAIN RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {editId ? "Modifier le rapport" : duplicateId ? "Dupliquer le rapport" : "Nouveau rapport"}
        </h1>
        <p className="text-slate-500 mt-1">
          Construisez votre rapport etape par etape.
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, idx) => (
            <div key={idx} className="flex items-center">
              <button
                onClick={() => setCurrentStep(idx)}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx === currentStep
                      ? "bg-blue-600 text-white"
                      : idx < currentStep
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-xs mt-1 hidden sm:block ${
                    idx === currentStep ? "text-blue-600 font-medium" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </button>
              {idx < STEP_LABELS.length - 1 && (
                <div
                  className={`w-8 lg:w-16 h-0.5 mx-1 ${
                    idx < currentStep ? "bg-blue-200" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Precedent
        </button>
        <button
          onClick={() => setCurrentStep((s) => Math.min(STEP_LABELS.length - 1, s + 1))}
          disabled={currentStep === STEP_LABELS.length - 1}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Panel */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <button
          onClick={() => {
            setShowPreview(!showPreview);
            if (!showPreview && previewData.length === 0) {
              runPreview();
            }
          }}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Apercu</span>
            <span className="text-sm text-slate-400">(20 premieres lignes)</span>
          </div>
          {showPreview ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        {showPreview && (
          <div className="border-t border-slate-200 p-4">
            {previewLoading && <p className="text-sm text-slate-500">Chargement...</p>}
            {previewError && <p className="text-sm text-red-600">{previewError}</p>}
            {!previewLoading && !previewError && previewData.length === 0 && (
              <p className="text-sm text-slate-500">Aucune donnee a afficher.</p>
            )}
            {!previewLoading && previewData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      {selectedColumns.map((col) => (
                        <th
                          key={`${col.table}.${col.field}`}
                          className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50">
                        {selectedColumns.map((col) => (
                          <td
                            key={`${col.table}.${col.field}`}
                            className="px-3 py-2 text-slate-700 border-b border-slate-100"
                          >
                            {row[`${col.table}.${col.field}`] != null
                              ? String(row[`${col.table}.${col.field}`])
                              : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={runPreview}
              disabled={previewLoading}
              className="mt-3 flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              <Eye className="w-4 h-4" /> Rafraichir l&apos;apercu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
