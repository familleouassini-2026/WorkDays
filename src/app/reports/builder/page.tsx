"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { schemaMetadata, type TableMetadata, calculatedColumns } from "@/data/schema-metadata";
import {
  resolveJoins,
  executeReport,
  applyGrouping,
  type ReportConfig,
  type ReportColumn,
  type ReportJoin,
  type ReportFilter,
  type ReportSort,
  type ReportTotal,
  type JoinPath,
  type GroupedResult,
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
  Calculator,
  FileText,
  Monitor,
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
  valueTo?: string; // For date range (end value)
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

interface SectorOption {
  id: number;
  name: string;
}

interface YearOption {
  year: number;
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
  const [previewFullCount, setPreviewFullCount] = useState(0);
  const [previewTotals, setPreviewTotals] = useState<Record<string, number>>({});
  const [previewGrouped, setPreviewGrouped] = useState<GroupedResult[]>([]);

  // Calculated columns state
  const [selectedCalculatedColumns, setSelectedCalculatedColumns] = useState<string[]>([]);

  // Smart filter options
  const [sectorOptions, setSectorOptions] = useState<SectorOption[]>([]);
  const [yearOptions, setYearOptions] = useState<YearOption[]>([]);

  // Load sectors and years for smart filters
  useEffect(() => {
    const loadFilterOptions = async () => {
      const supabase = createClient();
      const [sectorsRes, yearsRes] = await Promise.all([
        supabase.from("sectors").select("id, name").order("name"),
        supabase.from("year_calendar").select("year"),
      ]);
      if (sectorsRes.data) {
        setSectorOptions(sectorsRes.data as SectorOption[]);
      }
      if (yearsRes.data) {
        const uniqueYears = Array.from(new Set((yearsRes.data as YearOption[]).map((y) => y.year)))
          .sort((a, b) => b - a)
          .map((y) => ({ year: y }));
        setYearOptions(uniqueYears);
      }
    };
    loadFilterOptions();
  }, []);

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
      setReportName(editId ? (data.name || "") : duplicateId ? `Copie de ${data.name || ""}` : "");
      setReportTitle(config.title || "");
      setReportDescription(editId ? (data.description || "") : "");
      setOrientation(config.orientation || "auto");
      setSelectedCalculatedColumns(config.calculatedColumns || []);
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

  // Helper to determine smart filter type for a field
  const getFilterWidgetType = (field: string): "date_range" | "sector" | "boolean" | "status" | "year" | "text" => {
    if (!field) return "text";
    const parts = field.split(".");
    const tableName = parts[0];
    const fieldName = parts[1];

    // Check if field is a date type
    const tableMeta = schemaMetadata.find((t) => t.tableName === tableName);
    const colMeta = tableMeta?.columns.find((c) => c.field === fieldName);
    if (colMeta?.type === "date") return "date_range";

    // Sector dropdown
    if (field === "employees.sector_id") return "sector";

    // Boolean dropdown
    if (field === "employees.is_inactive") return "boolean";

    // Status dropdown
    if (field === "requests.status") return "status";

    // Year dropdown
    if (fieldName === "year") return "year";

    return "text";
  };

  // Build report config from current state
  const buildConfig = useCallback((): ReportConfig => {
    const mappedFilters: ReportFilter[] = [];
    for (const f of filters) {
      if (!f.field) continue;
      if (f.op === "is_null") {
        mappedFilters.push({ field: f.field, op: "is" as const, value: null });
      } else if (f.op === "is_not_null") {
        mappedFilters.push({ field: f.field, op: "not_null" as const, value: null });
      } else if (f.op === "neq") {
        mappedFilters.push({ field: f.field, op: "neq" as const, value: f.value });
      } else {
        // Handle date range: if valueTo is set, generate two filters (gte + lte)
        const widgetType = getFilterWidgetType(f.field);
        if (widgetType === "date_range" && f.value && f.valueTo) {
          mappedFilters.push({ field: f.field, op: "gte" as const, value: f.value });
          mappedFilters.push({ field: f.field, op: "lte" as const, value: f.valueTo });
        } else {
          mappedFilters.push({ field: f.field, op: f.op as ReportFilter["op"], value: f.value });
        }
      }
    }

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
      calculatedColumns: selectedCalculatedColumns.length > 0 ? selectedCalculatedColumns : undefined,
    };
  }, [selectedTables, selectedColumns, joins, filters, groupBy, totals, sortRows, orientation, reportTitle, selectedCalculatedColumns]);

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
      setPreviewFullCount(data.length);
      setPreviewData(data.slice(0, 20));

      // Compute totals across all data
      if (config.totals && config.totals.length > 0) {
        const allTotals: Record<string, number> = {};
        for (const total of config.totals) {
          const values = data
            .map((row) => row[total.field])
            .filter((v): v is number => typeof v === "number");
          switch (total.fn) {
            case "SUM":
              allTotals[total.label] = values.reduce((sum, v) => sum + v, 0);
              break;
            case "COUNT":
              allTotals[total.label] = values.length;
              break;
            case "AVG":
              allTotals[total.label] = values.length > 0
                ? values.reduce((sum, v) => sum + v, 0) / values.length
                : 0;
              break;
          }
        }
        setPreviewTotals(allTotals);
      } else {
        setPreviewTotals({});
      }

      // Compute grouped preview if groupBy is configured
      if (config.groupBy && config.groupBy.length > 0) {
        const grouped = applyGrouping(data, config);
        setPreviewGrouped(grouped);
      } else {
        setPreviewGrouped([]);
      }
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
        const { data, error } = await supabase
          .from("report_templates")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setSaveMessage("Rapport sauvegarde avec succes.");
        // If duplicate mode, redirect to edit the new report
        if (duplicateId && data?.id) {
          window.location.href = `/reports/builder?id=${data.id}`;
        }
      }
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [reportName, reportDescription, buildConfig, editId, duplicateId]);

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

          {/* Calculated Columns Section */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-500" />
              Colonnes calculees
            </h4>
            <p className="text-sm text-slate-500 mb-3">
              Colonnes virtuelles calculees cote client a partir des donnees brutes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {calculatedColumns.map((calcCol) => {
                const allRequiredTablesSelected = calcCol.requiredTables.every(
                  (t) => selectedTables.includes(t)
                );
                const isChecked = selectedCalculatedColumns.includes(calcCol.id);
                return (
                  <label
                    key={calcCol.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      allRequiredTablesSelected
                        ? "hover:bg-slate-50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    title={
                      allRequiredTablesSelected
                        ? calcCol.description
                        : `Requiert les tables : ${calcCol.requiredTables.join(", ")}`
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!allRequiredTablesSelected}
                      onChange={() => {
                        if (!allRequiredTablesSelected) return;
                        setSelectedCalculatedColumns((prev) =>
                          prev.includes(calcCol.id)
                            ? prev.filter((id) => id !== calcCol.id)
                            : [...prev, calcCol.id]
                        );
                      }}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Calculator className="w-4 h-4 text-purple-400" />
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-700">{calcCol.label}</span>
                      {!allRequiredTablesSelected && (
                        <span className="text-xs text-slate-400">
                          Requiert : {calcCol.requiredTables.join(", ")}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFilterValueWidget = (filter: FilterRow, idx: number) => {
    if (filter.op === "is_null" || filter.op === "is_not_null") return null;

    const widgetType = getFilterWidgetType(filter.field);

    switch (widgetType) {
      case "date_range":
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Du</span>
            <input
              type="date"
              value={filter.value}
              onChange={(e) => {
                const updated = [...filters];
                updated[idx] = { ...updated[idx], value: e.target.value };
                setFilters(updated);
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-xs text-slate-500">Au</span>
            <input
              type="date"
              value={filter.valueTo || ""}
              onChange={(e) => {
                const updated = [...filters];
                updated[idx] = { ...updated[idx], valueTo: e.target.value };
                setFilters(updated);
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        );
      case "sector":
        return (
          <select
            value={filter.value}
            onChange={(e) => {
              const updated = [...filters];
              updated[idx] = { ...updated[idx], value: e.target.value };
              setFilters(updated);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Secteur --</option>
            {sectorOptions.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        );
      case "boolean":
        return (
          <select
            value={filter.value}
            onChange={(e) => {
              const updated = [...filters];
              updated[idx] = { ...updated[idx], value: e.target.value };
              setFilters(updated);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Statut --</option>
            <option value="false">Actif</option>
            <option value="true">Inactif</option>
          </select>
        );
      case "status":
        return (
          <select
            value={filter.value}
            onChange={(e) => {
              const updated = [...filters];
              updated[idx] = { ...updated[idx], value: e.target.value };
              setFilters(updated);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Statut --</option>
            <option value="open">Ouvert</option>
            <option value="closed">Ferme</option>
            <option value="completed">Termine</option>
          </select>
        );
      case "year":
        return (
          <select
            value={filter.value}
            onChange={(e) => {
              const updated = [...filters];
              updated[idx] = { ...updated[idx], value: e.target.value };
              setFilters(updated);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Annee --</option>
            {yearOptions.map((y) => (
              <option key={y.year} value={String(y.year)}>{y.year}</option>
            ))}
          </select>
        );
      default:
        return (
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
        );
    }
  };

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
              updated[idx] = { ...updated[idx], field: e.target.value, value: "", valueTo: undefined };
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
          {renderFilterValueWidget(filter, idx)}
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
            {/* Orientation indicator */}
            {(orientation === "landscape" || (orientation === "auto" && autoOrientation === "landscape")) ? (
              <Monitor className="w-4 h-4 text-slate-400 rotate-0" />
            ) : (
              <FileText className="w-4 h-4 text-slate-400 rotate-0" />
            )}
            <span className="text-xs text-slate-400">
              ({(orientation === "landscape" || (orientation === "auto" && autoOrientation === "landscape")) ? "Paysage" : "Portrait"})
            </span>
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
              <div>
                {/* Total count */}
                <p className="text-sm text-slate-600 mb-3 font-medium">
                  {previewFullCount} ligne{previewFullCount !== 1 ? "s" : ""} au total
                </p>

                {/* Grouped preview */}
                {previewGrouped.length > 0 ? (
                  <div className="space-y-4">
                    {previewGrouped.map((group, gi) => {
                      const groupLabel = Object.entries(group.groupKey)
                        .map(([field, value]) => {
                          const col = selectedColumns.find((c) => `${c.table}.${c.field}` === field);
                          const label = col ? col.label : field;
                          return `${label}: ${value ?? "-"}`;
                        })
                        .join(" | ");

                      return (
                        <div key={gi} className="border border-slate-200 rounded-lg overflow-hidden">
                          {/* Group header */}
                          <div className="bg-indigo-50 px-3 py-2 border-b border-slate-200">
                            <p className="text-sm font-semibold text-indigo-800">{groupLabel}</p>
                            <p className="text-xs text-indigo-600">{group.rows.length} ligne{group.rows.length !== 1 ? "s" : ""}</p>
                          </div>
                          {/* Group rows (limit to first 5 per group in preview) */}
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
                                {group.rows.slice(0, 5).map((row, rowIdx) => (
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
                                {group.rows.length > 5 && (
                                  <tr>
                                    <td colSpan={selectedColumns.length} className="px-3 py-2 text-xs text-slate-400 italic text-center border-b border-slate-100">
                                      ... et {group.rows.length - 5} autre{group.rows.length - 5 > 1 ? "s" : ""} ligne{group.rows.length - 5 > 1 ? "s" : ""}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          {/* Group subtotals */}
                          {Object.keys(group.totals).length > 0 && (
                            <div className="bg-gray-100 px-3 py-2 border-t border-slate-200 flex flex-wrap gap-4">
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
                  </div>
                ) : (
                  /* Flat preview */
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

                {/* Grand totals row */}
                {Object.keys(previewTotals).length > 0 && (
                  <div className="bg-blue-50 px-3 py-2 mt-3 rounded-lg border border-blue-100 flex flex-wrap gap-4">
                    <span className="text-xs font-bold text-blue-900">Totaux :</span>
                    {Object.entries(previewTotals).map(([label, value]) => (
                      <span key={label} className="text-xs font-bold text-blue-800">
                        {label}: {typeof value === "number" ? value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : value}
                      </span>
                    ))}
                  </div>
                )}

                {previewFullCount > 20 && previewGrouped.length === 0 && (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    Affichage limite aux 20 premieres lignes.
                  </p>
                )}
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
