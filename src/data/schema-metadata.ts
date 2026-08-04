/**
 * WorkDays - Schema Metadata for Report Builder
 *
 * Static metadata describing tables, columns, and foreign key relationships
 * available for building dynamic reports.
 */

// ============================================================
// TYPES
// ============================================================

export type ColumnType = "text" | "number" | "date" | "boolean";

export interface ColumnMetadata {
  field: string;
  label: string; // French
  type: ColumnType;
}

export interface ForeignKey {
  fromField: string;
  toTable: string;
  toField: string;
}

export interface TableMetadata {
  tableName: string;
  displayName: string; // French
  columns: ColumnMetadata[];
  foreignKeys: ForeignKey[];
}

// ============================================================
// TABLE DEFINITIONS
// ============================================================

export const schemaMetadata: TableMetadata[] = [
  {
    tableName: "employees",
    displayName: "Employes",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "first_name", label: "Prenom", type: "text" },
      { field: "last_name", label: "Nom", type: "text" },
      { field: "email", label: "Email", type: "text" },
      { field: "job_title", label: "Fonction", type: "text" },
      { field: "contract_type", label: "Type de contrat", type: "text" },
      { field: "date_of_hire", label: "Date d'embauche", type: "date" },
      { field: "date_of_birth", label: "Date de naissance", type: "date" },
      { field: "is_inactive", label: "Inactif", type: "boolean" },
      { field: "sector_id", label: "Secteur", type: "number" },
      { field: "location_id", label: "Site", type: "number" },
      { field: "granted_seniority", label: "Anciennete accordee", type: "number" },
      { field: "granted_seniority_date", label: "Date anciennete accordee", type: "date" },
    ],
    foreignKeys: [
      { fromField: "sector_id", toTable: "sectors", toField: "id" },
      { fromField: "location_id", toTable: "locations", toField: "id" },
    ],
  },
  {
    tableName: "sectors",
    displayName: "Secteurs",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "name", label: "Nom", type: "text" },
      { field: "code_bareme", label: "Code bareme", type: "text" },
      { field: "has_rtt", label: "RTT", type: "boolean" },
      { field: "is_ific", label: "IFIC", type: "boolean" },
      { field: "ific_category", label: "Categorie IFIC", type: "number" },
    ],
    foreignKeys: [],
  },
  {
    tableName: "timesheets",
    displayName: "Horaires",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "employee_id", label: "Employe", type: "number" },
      { field: "monday_minutes", label: "Lundi (min)", type: "number" },
      { field: "tuesday_minutes", label: "Mardi (min)", type: "number" },
      { field: "wednesday_minutes", label: "Mercredi (min)", type: "number" },
      { field: "thursday_minutes", label: "Jeudi (min)", type: "number" },
      { field: "friday_minutes", label: "Vendredi (min)", type: "number" },
      { field: "saturday_minutes", label: "Samedi (min)", type: "number" },
      { field: "sunday_minutes", label: "Dimanche (min)", type: "number" },
      { field: "full_time_minutes", label: "Temps plein (min)", type: "number" },
      { field: "is_active", label: "Actif", type: "boolean" },
    ],
    foreignKeys: [
      { fromField: "employee_id", toTable: "employees", toField: "id" },
    ],
  },
  {
    tableName: "year_calendar",
    displayName: "Calendrier annuel",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "employee_id", label: "Employe", type: "number" },
      { field: "absence_date", label: "Date d'absence", type: "date" },
      { field: "year", label: "Annee", type: "number" },
      { field: "absence_code_id", label: "Code absence", type: "number" },
      { field: "absence_minutes", label: "Minutes d'absence", type: "number" },
      { field: "absence_days", label: "Jours d'absence", type: "number" },
      { field: "reason", label: "Motif", type: "text" },
    ],
    foreignKeys: [
      { fromField: "employee_id", toTable: "employees", toField: "id" },
      { fromField: "absence_code_id", toTable: "absence_codes", toField: "id" },
    ],
  },
  {
    tableName: "absence_codes",
    displayName: "Codes d'absence",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "code", label: "Code", type: "text" },
      { field: "description", label: "Description", type: "text" },
      { field: "color_hex", label: "Couleur", type: "text" },
      { field: "time_unit", label: "Unite de temps", type: "text" },
    ],
    foreignKeys: [],
  },
  {
    tableName: "vacation_rights",
    displayName: "Droits de vacances",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "employee_id", label: "Employe", type: "number" },
      { field: "absence_code_id", label: "Code absence", type: "number" },
      { field: "year", label: "Annee", type: "number" },
      { field: "days", label: "Jours", type: "number" },
      { field: "hours", label: "Heures", type: "number" },
      { field: "minutes", label: "Minutes", type: "number" },
    ],
    foreignKeys: [
      { fromField: "employee_id", toTable: "employees", toField: "id" },
      { fromField: "absence_code_id", toTable: "absence_codes", toField: "id" },
    ],
  },
  {
    tableName: "seniority_scales",
    displayName: "Baremes d'anciennete",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "sector_id", label: "Secteur", type: "number" },
      { field: "years", label: "Annees", type: "number" },
      { field: "base_salary", label: "Salaire de base", type: "number" },
    ],
    foreignKeys: [
      { fromField: "sector_id", toTable: "sectors", toField: "id" },
    ],
  },
  {
    tableName: "organisation_indexations",
    displayName: "Indexations organisation",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "indexation_value", label: "Valeur d'indexation", type: "number" },
      { field: "indexation_date", label: "Date d'indexation", type: "date" },
    ],
    foreignKeys: [],
  },
  {
    tableName: "sector_indexations",
    displayName: "Indexations secteur",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "sector_id", label: "Secteur", type: "number" },
      { field: "indexation_value", label: "Valeur d'indexation", type: "number" },
      { field: "indexation_date", label: "Date d'indexation", type: "date" },
    ],
    foreignKeys: [
      { fromField: "sector_id", toTable: "sectors", toField: "id" },
    ],
  },
  {
    tableName: "employee_indexations",
    displayName: "Indexations employe",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "employee_id", label: "Employe", type: "number" },
      { field: "indexation_value", label: "Valeur d'indexation", type: "number" },
      { field: "indexation_date", label: "Date d'indexation", type: "date" },
      { field: "amount", label: "Montant", type: "number" },
      { field: "effective_date", label: "Date d'effet", type: "date" },
      { field: "description", label: "Description", type: "text" },
    ],
    foreignKeys: [
      { fromField: "employee_id", toTable: "employees", toField: "id" },
    ],
  },
  {
    tableName: "locations",
    displayName: "Sites",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "name", label: "Nom", type: "text" },
    ],
    foreignKeys: [],
  },
  {
    tableName: "holidays",
    displayName: "Jours feries",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "holiday_date", label: "Date", type: "date" },
      { field: "name", label: "Nom", type: "text" },
      { field: "year", label: "Annee", type: "number" },
    ],
    foreignKeys: [],
  },
  {
    tableName: "meetings",
    displayName: "Reunions",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "meeting_date", label: "Date de reunion", type: "date" },
      { field: "description", label: "Description", type: "text" },
      { field: "type", label: "Type", type: "text" },
    ],
    foreignKeys: [],
  },
  {
    tableName: "decisions",
    displayName: "Decisions",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "description", label: "Description", type: "text" },
      { field: "decision_date", label: "Date de decision", type: "date" },
      { field: "meeting_id", label: "Reunion", type: "number" },
      { field: "request_id", label: "Demande", type: "number" },
    ],
    foreignKeys: [
      { fromField: "meeting_id", toTable: "meetings", toField: "id" },
      { fromField: "request_id", toTable: "requests", toField: "id" },
    ],
  },
  {
    tableName: "requests",
    displayName: "Demandes",
    columns: [
      { field: "id", label: "ID", type: "number" },
      { field: "description", label: "Description", type: "text" },
      { field: "request_date", label: "Date de demande", type: "date" },
      { field: "status", label: "Statut", type: "text" },
      { field: "deadline", label: "Echeance", type: "date" },
    ],
    foreignKeys: [],
  },
];

// ============================================================
// CALCULATED COLUMNS
// ============================================================

export interface CalculatedColumnDef {
  id: string;
  label: string;
  description: string;
  requiredTables: string[];
  requiredFields: string[];
  computeFn: string;
}

export const calculatedColumns: CalculatedColumnDef[] = [
  {
    id: "seniority_years",
    label: "Anciennete (annees)",
    description: "Anciennete totale calculee depuis la date d'embauche, l'anciennete accordee et la date d'anciennete accordee",
    requiredTables: ["employees"],
    requiredFields: ["employees.date_of_hire", "employees.granted_seniority", "employees.granted_seniority_date"],
    computeFn: "computeSeniorityYears",
  },
  {
    id: "indexed_salary",
    label: "Salaire indexe",
    description: "Base x facteur organisation x facteur secteur + augmentations personnelles",
    requiredTables: ["employees", "seniority_scales", "organisation_indexations", "sector_indexations", "employee_indexations"],
    requiredFields: ["employees.sector_id", "employees.date_of_hire"],
    computeFn: "computeIndexedSalary",
  },
  {
    id: "age",
    label: "Age",
    description: "Age calcule depuis la date de naissance",
    requiredTables: ["employees"],
    requiredFields: ["employees.date_of_birth"],
    computeFn: "computeAge",
  },
  {
    id: "work_time_percent",
    label: "% temps de travail",
    description: "Total minutes horaire / minutes temps plein x 100",
    requiredTables: ["timesheets"],
    requiredFields: [
      "timesheets.monday_minutes",
      "timesheets.tuesday_minutes",
      "timesheets.wednesday_minutes",
      "timesheets.thursday_minutes",
      "timesheets.friday_minutes",
      "timesheets.saturday_minutes",
      "timesheets.sunday_minutes",
      "timesheets.full_time_minutes",
    ],
    computeFn: "computeWorkTimePercent",
  },
  {
    id: "seniority_considered",
    label: "Anciennete prise en compte",
    description: "Floor de l'anciennete totale, cappee au maximum du bareme du secteur",
    requiredTables: ["employees", "seniority_scales"],
    requiredFields: ["employees.date_of_hire", "employees.sector_id"],
    computeFn: "computeSeniorityConsidered",
  },
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Look up a table's metadata by name.
 */
export function getTableMetadata(tableName: string): TableMetadata | undefined {
  return schemaMetadata.find((t) => t.tableName === tableName);
}

/**
 * Get all available table names.
 */
export function getTableNames(): string[] {
  return schemaMetadata.map((t) => t.tableName);
}
