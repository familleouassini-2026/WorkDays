/**
 * WorkDays - Report Engine
 *
 * Builds and executes dynamic Supabase queries from a report configuration,
 * then applies client-side grouping and aggregation.
 */

import { createClient } from "@/lib/supabase/client";
import { schemaMetadata, type ForeignKey } from "@/data/schema-metadata";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateSeniorityBreakdown,
  calculateSeniorityYears,
  findBaseSalary,
  calculateFullSalary,
  type IndexationRow,
  type EmployeeIndexationRow,
  type SeniorityScaleRow,
} from "@/lib/calculations";

// ============================================================
// TYPES
// ============================================================

export interface ReportColumn {
  table: string;
  field: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
}

export interface ReportJoin {
  from: string; // "table.field"
  to: string; // "table.field"
  type: "inner" | "left";
}

export interface ReportFilter {
  field: string; // "table.field"
  op: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "like" | "is" | "not_null";
  value: string | number | boolean | null;
}

export interface ReportSort {
  field: string; // "table.field"
  direction: "asc" | "desc";
}

export interface ReportTotal {
  field: string; // "table.field"
  fn: "SUM" | "COUNT" | "AVG";
  label: string;
}

export interface ReportConfig {
  tables: string[];
  columns: ReportColumn[];
  joins: ReportJoin[];
  groupBy: string[]; // "table.field" format
  totals: ReportTotal[];
  filters: ReportFilter[];
  sortBy: ReportSort[];
  orientation: "auto" | "portrait" | "landscape";
  title: string;
  calculatedColumns?: string[]; // IDs of calculated columns to include
}

export interface JoinPath {
  from: string; // "table.field"
  to: string; // "table.field"
  type: "inner";
  direction: "many-to-one" | "one-to-many";
}

export interface GroupedResult {
  groupKey: Record<string, unknown>;
  rows: Record<string, unknown>[];
  totals: Record<string, number>;
}

// ============================================================
// QUERY BUILDER
// ============================================================

/**
 * Build a Supabase query from a report configuration.
 *
 * Strategy: use the first table in config.tables as the primary table,
 * then use Supabase's relational query syntax to fetch related data.
 * Filters are applied via Supabase query builder methods.
 */
export function buildSupabaseQuery(
  config: ReportConfig,
  supabase: SupabaseClient
) {
  const primaryTable = config.tables[0];
  if (!primaryTable) {
    throw new Error("Report config must specify at least one table");
  }

  // Build select string with related tables using Supabase relational syntax
  const relatedTables = config.tables.slice(1);
  const selectParts: string[] = ["*"];

  for (const relatedTable of relatedTables) {
    // Check if there's a join path from primary to related
    const joinDef = config.joins.find((j) => {
      const fromTable = j.from.split(".")[0];
      const toTable = j.to.split(".")[0];
      return (
        (fromTable === primaryTable && toTable === relatedTable) ||
        (fromTable === relatedTable && toTable === primaryTable)
      );
    });

    if (joinDef) {
      // Use Supabase relational query: select related table as nested object
      selectParts.push(`${relatedTable}(*)`);
    } else {
      // No valid join definition found - skip this table to avoid PostgREST errors
      console.warn(
        `[report-engine] Skipping table "${relatedTable}" in select: no valid join path from "${primaryTable}".`
      );
    }
  }

  const selectString = selectParts.join(", ");
  let query = supabase.from(primaryTable).select(selectString);

  // Apply filters
  for (const filter of config.filters) {
    const fieldParts = filter.field.split(".");
    // Only apply filters on the primary table directly via query builder
    // Filters on related tables will be applied client-side after fetch
    if (fieldParts[0] === primaryTable) {
      const column = fieldParts[1];
      switch (filter.op) {
        case "eq":
          query = query.eq(column, filter.value);
          break;
        case "neq":
          query = query.neq(column, filter.value);
          break;
        case "gt":
          query = query.gt(column, filter.value as string | number);
          break;
        case "lt":
          query = query.lt(column, filter.value as string | number);
          break;
        case "gte":
          query = query.gte(column, filter.value as string | number);
          break;
        case "lte":
          query = query.lte(column, filter.value as string | number);
          break;
        case "like":
          query = query.like(column, filter.value as string);
          break;
        case "is":
          query = query.is(column, filter.value as null | boolean);
          break;
        case "not_null":
          query = query.not(column, "is", null);
          break;
      }
    }
  }

  // Apply sorting on primary table fields
  for (const sort of config.sortBy) {
    const fieldParts = sort.field.split(".");
    if (fieldParts[0] === primaryTable) {
      query = query.order(fieldParts[1], { ascending: sort.direction === "asc" });
    }
  }

  // Limit results to prevent memory exhaustion on large tables
  query = query.limit(5000);

  return query;
}

// ============================================================
// QUERY EXECUTION
// ============================================================

/**
 * Execute a report: creates a Supabase client, builds the query,
 * executes it, and returns flattened data rows.
 */
export async function executeReport(
  config: ReportConfig
): Promise<Record<string, unknown>[]> {
  const supabase = createClient();
  const query = buildSupabaseQuery(config, supabase);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Report query failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Flatten nested relational objects into "table.field" keys
  const primaryTable = config.tables[0];
  const relatedTables = config.tables.slice(1);
  const rawRows = data as unknown as Record<string, unknown>[];

  const flattenedRows: Record<string, unknown>[] = [];

  for (const row of rawRows) {
    const flatRow: Record<string, unknown> = {};

    // Add primary table fields
    for (const [key, value] of Object.entries(row)) {
      if (!relatedTables.includes(key) && typeof value !== "object") {
        flatRow[`${primaryTable}.${key}`] = value;
      } else if (!relatedTables.includes(key) && value === null) {
        flatRow[`${primaryTable}.${key}`] = null;
      }
    }

    // Add related table fields (flatten nested objects)
    for (const relatedTable of relatedTables) {
      const nested = row[relatedTable];
      if (nested && typeof nested === "object" && !Array.isArray(nested)) {
        for (const [key, value] of Object.entries(
          nested as Record<string, unknown>
        )) {
          flatRow[`${relatedTable}.${key}`] = value;
        }
      } else if (Array.isArray(nested)) {
        // One-to-many relation: take the first element and flatten it
        const first = nested.length > 0 ? nested[0] : null;
        if (first && typeof first === "object") {
          for (const [key, value] of Object.entries(
            first as Record<string, unknown>
          )) {
            flatRow[`${relatedTable}.${key}`] = value;
          }
        } else {
          // Empty array or non-object elements - set all fields to null
          const tableMeta = schemaMetadata.find(
            (t) => t.tableName === relatedTable
          );
          if (tableMeta) {
            for (const col of tableMeta.columns) {
              flatRow[`${relatedTable}.${col.field}`] = null;
            }
          }
        }
      } else if (nested === null) {
        // Related record not found, set fields to null
        const tableMeta = schemaMetadata.find(
          (t) => t.tableName === relatedTable
        );
        if (tableMeta) {
          for (const col of tableMeta.columns) {
            flatRow[`${relatedTable}.${col.field}`] = null;
          }
        }
      }
    }

    flattenedRows.push(flatRow);
  }

  // Apply client-side filters for related tables
  const relatedFilters = config.filters.filter(
    (f) => f.field.split(".")[0] !== primaryTable
  );

  if (relatedFilters.length === 0) {
    return flattenedRows;
  }

  return flattenedRows.filter((row) => {
    return relatedFilters.every((filter) => {
      const rowValue = row[filter.field];
      switch (filter.op) {
        case "eq":
          return String(rowValue ?? "") === String(filter.value ?? "");
        case "neq":
          return String(rowValue ?? "") !== String(filter.value ?? "");
        case "gt": {
          const numValue = Number(filter.value);
          return (
            rowValue !== null &&
            rowValue !== undefined &&
            (rowValue as number) > numValue
          );
        }
        case "lt": {
          const numValue = Number(filter.value);
          return (
            rowValue !== null &&
            rowValue !== undefined &&
            (rowValue as number) < numValue
          );
        }
        case "gte": {
          const numValue = Number(filter.value);
          return (
            rowValue !== null &&
            rowValue !== undefined &&
            (rowValue as number) >= numValue
          );
        }
        case "lte": {
          const numValue = Number(filter.value);
          return (
            rowValue !== null &&
            rowValue !== undefined &&
            (rowValue as number) <= numValue
          );
        }
        case "like":
          return (
            rowValue !== null &&
            rowValue !== undefined &&
            String(rowValue)
              .toLowerCase()
              .includes(String(filter.value).toLowerCase().replace(/%/g, ""))
          );
        case "is":
          return rowValue === filter.value;
        case "not_null":
          return rowValue !== null && rowValue !== undefined;
        default:
          return true;
      }
    });
  });
}

// ============================================================
// GROUPING & AGGREGATION
// ============================================================

/**
 * Group rows by the specified fields and compute aggregation totals.
 * Grouping and totals are calculated client-side after data fetch.
 */
export function applyGrouping(
  data: Record<string, unknown>[],
  config: ReportConfig
): GroupedResult[] {
  if (config.groupBy.length === 0) {
    // No grouping: return single group with all rows
    const totals = computeTotals(data, config.totals);
    return [{ groupKey: {}, rows: data, totals }];
  }

  // Group rows by the groupBy fields
  const groups = new Map<string, Record<string, unknown>[]>();

  for (const row of data) {
    const keyParts: string[] = [];
    for (const field of config.groupBy) {
      const value = row[field];
      keyParts.push(String(value ?? ""));
    }
    const key = keyParts.join("|||");

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  }

  // Build results with totals per group
  const results: GroupedResult[] = [];

  groups.forEach((rows) => {
    const groupKey: Record<string, unknown> = {};
    for (const field of config.groupBy) {
      groupKey[field] = rows[0][field];
    }

    const totals = computeTotals(rows, config.totals);
    results.push({ groupKey, rows, totals });
  });

  return results;
}

/**
 * Compute aggregation totals for a set of rows.
 */
function computeTotals(
  rows: Record<string, unknown>[],
  totals: ReportTotal[]
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const total of totals) {
    const values = rows
      .map((row) => row[total.field])
      .filter((v): v is number => typeof v === "number");

    switch (total.fn) {
      case "SUM":
        result[total.label] = values.reduce((sum, v) => sum + v, 0);
        break;
      case "COUNT":
        result[total.label] = values.length;
        break;
      case "AVG":
        result[total.label] =
          values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 0;
        break;
    }
  }

  return result;
}

// ============================================================
// JOIN RESOLUTION
// ============================================================

/**
 * Given an array of selected table names, looks up FK relationships
 * in schema-metadata and returns possible join paths between them.
 */
export function resolveJoins(selectedTables: string[]): JoinPath[] {
  if (selectedTables.length < 2) {
    return [];
  }

  const joinPaths: JoinPath[] = [];
  const selectedSet = new Set(selectedTables);

  for (const tableName of selectedTables) {
    const tableMeta = schemaMetadata.find((t) => t.tableName === tableName);
    if (!tableMeta) continue;

    for (const fk of tableMeta.foreignKeys) {
      // Only include joins where both tables are selected
      if (selectedSet.has(fk.toTable)) {
        // Determine direction relative to the primary table (first in selectedTables)
        // If the FK is on the primary table (primary.fk -> related.id), it's many-to-one
        // If the FK is on the related table (related.fk -> primary.id), it's one-to-many
        const primaryTable = selectedTables[0];
        const direction: "many-to-one" | "one-to-many" =
          tableName === primaryTable ? "many-to-one" : "one-to-many";

        const joinPath: JoinPath = {
          from: `${tableName}.${fk.fromField}`,
          to: `${fk.toTable}.${fk.toField}`,
          type: "inner",
          direction,
        };

        // Avoid duplicates (same join in reverse direction)
        const isDuplicate = joinPaths.some(
          (existing) =>
            (existing.from === joinPath.from &&
              existing.to === joinPath.to) ||
            (existing.from === joinPath.to && existing.to === joinPath.from)
        );

        if (!isDuplicate) {
          joinPaths.push(joinPath);
        }
      }
    }
  }

  return joinPaths;
}

// ============================================================
// CALCULATED COLUMNS
// ============================================================

/**
 * Apply calculated columns to the data rows based on the report config.
 * Each row is enriched with computed values for the selected calculated columns.
 */
export function applyCalculatedColumns(
  data: Record<string, unknown>[],
  config: ReportConfig,
  allScales: SeniorityScaleRow[],
  allIndexations: {
    org: IndexationRow[];
    sector: IndexationRow[];
    employee: EmployeeIndexationRow[];
  }
): Record<string, unknown>[] {
  const selectedCalcCols = config.calculatedColumns || [];
  if (selectedCalcCols.length === 0) return data;

  return data.map((row) => {
    const enrichedRow = { ...row };

    for (const colId of selectedCalcCols) {
      switch (colId) {
        case "seniority_years": {
          const dateOfHire = row["employees.date_of_hire"] as string | null;
          const grantedSeniority = row["employees.granted_seniority"] as number | null;
          const grantedSeniorityDate = row["employees.granted_seniority_date"] as string | null;
          const breakdown = calculateSeniorityBreakdown(
            dateOfHire,
            grantedSeniorityDate,
            new Date(),
            grantedSeniority
          );
          enrichedRow["_calc.seniority_years"] = breakdown.totale;
          break;
        }
        case "indexed_salary": {
          const sectorId = row["employees.sector_id"] as number | null;
          const dateOfHire = row["employees.date_of_hire"] as string | null;
          const grantedSeniority = row["employees.granted_seniority"] as number | null;
          const grantedSeniorityDate = row["employees.granted_seniority_date"] as string | null;
          if (sectorId && dateOfHire) {
            const senYears = calculateSeniorityYears(dateOfHire, grantedSeniority, grantedSeniorityDate);
            const baseSalary = findBaseSalary(sectorId, senYears, allScales);
            if (baseSalary !== null) {
              const employeeId = row["employees.id"] as number | undefined;
              const personalIncreases = employeeId
                ? allIndexations.employee.filter((ei) => ei.employee_id === employeeId)
                : [];
              const result = calculateFullSalary({
                baseSalary,
                orgIndexations: allIndexations.org,
                sectorIndexations: allIndexations.sector.filter(
                  (si) => (si as unknown as Record<string, unknown>)["sector_id"] === sectorId
                ),
                personalIncreases,
              });
              enrichedRow["_calc.indexed_salary"] = Math.round(result.totalSalary * 100) / 100;
            } else {
              enrichedRow["_calc.indexed_salary"] = null;
            }
          } else {
            enrichedRow["_calc.indexed_salary"] = null;
          }
          break;
        }
        case "age": {
          const dateOfBirth = row["employees.date_of_birth"] as string | null;
          if (dateOfBirth) {
            const birth = new Date(dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            enrichedRow["_calc.age"] = age;
          } else {
            enrichedRow["_calc.age"] = null;
          }
          break;
        }
        case "work_time_percent": {
          const monday = (row["timesheets.monday_minutes"] as number) || 0;
          const tuesday = (row["timesheets.tuesday_minutes"] as number) || 0;
          const wednesday = (row["timesheets.wednesday_minutes"] as number) || 0;
          const thursday = (row["timesheets.thursday_minutes"] as number) || 0;
          const friday = (row["timesheets.friday_minutes"] as number) || 0;
          const saturday = (row["timesheets.saturday_minutes"] as number) || 0;
          const sunday = (row["timesheets.sunday_minutes"] as number) || 0;
          const fullTime = (row["timesheets.full_time_minutes"] as number) || 0;
          const totalMinutes = monday + tuesday + wednesday + thursday + friday + saturday + sunday;
          if (fullTime > 0) {
            enrichedRow["_calc.work_time_percent"] = Math.round((totalMinutes / fullTime) * 100 * 100) / 100;
          } else {
            enrichedRow["_calc.work_time_percent"] = null;
          }
          break;
        }
        case "seniority_considered": {
          const dateOfHire = row["employees.date_of_hire"] as string | null;
          const grantedSeniority = row["employees.granted_seniority"] as number | null;
          const grantedSeniorityDate = row["employees.granted_seniority_date"] as string | null;
          const sectorId = row["employees.sector_id"] as number | null;
          if (dateOfHire) {
            const breakdown = calculateSeniorityBreakdown(
              dateOfHire,
              grantedSeniorityDate,
              new Date(),
              grantedSeniority
            );
            let considered = Math.floor(breakdown.totale);
            // Cap at max scale for sector
            if (sectorId) {
              const sectorScales = allScales
                .filter((s) => s.sector_id === sectorId)
                .sort((a, b) => b.years - a.years);
              if (sectorScales.length > 0 && considered > sectorScales[0].years) {
                considered = sectorScales[0].years;
              }
            }
            enrichedRow["_calc.seniority_considered"] = considered;
          } else {
            enrichedRow["_calc.seniority_considered"] = null;
          }
          break;
        }
      }
    }

    return enrichedRow;
  });
}

// ============================================================
// RPC AGGREGATION
// ============================================================

/**
 * Execute a Supabase RPC function for aggregation.
 * Returns null if the function does not exist or fails (fallback to client-side calculation).
 */
export async function executeRpcAggregation(
  rpcName: string,
  params: Record<string, unknown>
): Promise<Record<string, unknown>[] | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc(rpcName, params);
    if (error) {
      // Function may not exist or other error - return null for fallback
      console.warn(`[report-engine] RPC "${rpcName}" failed: ${error.message}`);
      return null;
    }
    return data as Record<string, unknown>[] | null;
  } catch {
    return null;
  }
}