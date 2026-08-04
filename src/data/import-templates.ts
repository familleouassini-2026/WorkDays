/**
 * WorkDays - Import/Export Templates
 *
 * Defines the structure of all importable/exportable tables,
 * ordered by FK dependency (tables with no FK dependencies first).
 */

// ============================================================
// TYPES
// ============================================================

export interface ImportColumnDef {
  field: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
  fk?: { table: string; labelField: string; idField: string };
}

export interface ImportTemplate {
  tableName: string;
  displayName: string;
  order: number;
  columns: ImportColumnDef[];
  keyField: string;
  /** Whether the keyField column(s) have a UNIQUE constraint in the database */
  hasUniqueConstraint: boolean;
}

// ============================================================
// TEMPLATES (FK dependency order)
// ============================================================

export const importTemplates: ImportTemplate[] = [
  {
    tableName: "organisations",
    displayName: "Organisation",
    order: 1,
    keyField: "name",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "name", label: "Nom", type: "text", required: true },
      { field: "vat_number", label: "N° TVA", type: "text", required: false },
      { field: "registration", label: "N° d'enregistrement", type: "text", required: false },
      { field: "comite_paritaire", label: "Comite paritaire", type: "text", required: false },
      { field: "address", label: "Adresse", type: "text", required: false },
      { field: "post_code", label: "Code postal", type: "text", required: false },
      { field: "city", label: "Ville", type: "text", required: false },
      { field: "country", label: "Pays", type: "text", required: false },
      { field: "commune", label: "Commune", type: "text", required: false },
      { field: "telephone", label: "Telephone", type: "text", required: false },
      { field: "fax", label: "Fax", type: "text", required: false },
      { field: "full_time_hours", label: "Heures temps plein", type: "number", required: false },
      { field: "full_time_minutes", label: "Minutes temps plein", type: "number", required: false },
    ],
  },
  {
    tableName: "locations",
    displayName: "Sites",
    order: 2,
    keyField: "name",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "name", label: "Nom", type: "text", required: true },
      { field: "address", label: "Adresse", type: "text", required: false },
      { field: "post_code", label: "Code postal", type: "text", required: false },
      { field: "commune", label: "Commune", type: "text", required: false },
      { field: "country", label: "Pays", type: "text", required: false },
      {
        field: "organisation_id",
        label: "Organisation",
        type: "number",
        required: true,
        fk: { table: "organisations", labelField: "name", idField: "id" },
      },
    ],
  },
  {
    tableName: "rtt_groups",
    displayName: "Groupes RTT",
    order: 3,
    keyField: "name",
    hasUniqueConstraint: true,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "name", label: "Nom", type: "text", required: true },
    ],
  },
  {
    tableName: "sectors",
    displayName: "Secteurs",
    order: 4,
    keyField: "name",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "name", label: "Nom", type: "text", required: true },
      { field: "code_bareme", label: "Code bareme", type: "text", required: false },
      { field: "mission", label: "Mission", type: "text", required: false },
      {
        field: "rtt_group_id",
        label: "Groupe RTT",
        type: "number",
        required: false,
        fk: { table: "rtt_groups", labelField: "name", idField: "id" },
      },
      { field: "has_rtt", label: "RTT actif", type: "boolean", required: false },
      { field: "is_ific", label: "IFIC", type: "boolean", required: false },
      { field: "ific_category", label: "Categorie IFIC", type: "number", required: false },
    ],
  },
  {
    tableName: "employees",
    displayName: "Employes",
    order: 5,
    keyField: "email",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "title", label: "Civilite", type: "text", required: false },
      { field: "first_name", label: "Prenom", type: "text", required: true },
      { field: "last_name", label: "Nom", type: "text", required: true },
      { field: "job_title", label: "Fonction", type: "text", required: false },
      { field: "contract_type", label: "Type de contrat", type: "text", required: false },
      { field: "date_of_hire", label: "Date d'embauche", type: "date", required: false },
      { field: "end_date", label: "Date de fin", type: "date", required: false },
      { field: "date_of_birth", label: "Date de naissance", type: "date", required: false },
      { field: "is_inactive", label: "Inactif", type: "boolean", required: false },
      { field: "iban", label: "IBAN", type: "text", required: false },
      { field: "bic", label: "BIC", type: "text", required: false },
      { field: "nationality", label: "Nationalite", type: "text", required: false },
      { field: "inami_number", label: "N° INAMI", type: "text", required: false },
      { field: "national_registration", label: "N° Registre National", type: "text", required: false },
      {
        field: "sector_id",
        label: "Secteur",
        type: "number",
        required: false,
        fk: { table: "sectors", labelField: "name", idField: "id" },
      },
      {
        field: "location_id",
        label: "Site",
        type: "number",
        required: false,
        fk: { table: "locations", labelField: "name", idField: "id" },
      },
      { field: "email", label: "Email", type: "text", required: false },
      { field: "business_phone", label: "Tel. professionnel", type: "text", required: false },
      { field: "home_phone", label: "Tel. domicile", type: "text", required: false },
      { field: "mobile_phone", label: "Tel. mobile", type: "text", required: false },
      { field: "fax_number", label: "Fax", type: "text", required: false },
      { field: "address", label: "Adresse", type: "text", required: false },
      { field: "city", label: "Ville", type: "text", required: false },
      { field: "province", label: "Province", type: "text", required: false },
      { field: "postal_code", label: "Code postal", type: "text", required: false },
      { field: "country", label: "Pays", type: "text", required: false },
      { field: "granted_seniority", label: "Anciennete accordee", type: "number", required: false },
      { field: "granted_seniority_date", label: "Date anciennete accordee", type: "date", required: false },
      { field: "distance_to_home", label: "Distance domicile (km)", type: "number", required: false },
      { field: "notes", label: "Notes", type: "text", required: false },
    ],
  },
  {
    tableName: "timesheets",
    displayName: "Horaires",
    order: 6,
    keyField: "id",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "employee_id",
        label: "Employe",
        type: "number",
        required: true,
        fk: { table: "employees", labelField: "last_name", idField: "id" },
      },
      { field: "is_active", label: "Actif", type: "boolean", required: false },
      { field: "start_date", label: "Date debut", type: "date", required: false },
      { field: "end_date", label: "Date fin", type: "date", required: false },
      { field: "monday", label: "Lundi", type: "text", required: false },
      { field: "tuesday", label: "Mardi", type: "text", required: false },
      { field: "wednesday", label: "Mercredi", type: "text", required: false },
      { field: "thursday", label: "Jeudi", type: "text", required: false },
      { field: "friday", label: "Vendredi", type: "text", required: false },
      { field: "saturday", label: "Samedi", type: "text", required: false },
      { field: "sunday", label: "Dimanche", type: "text", required: false },
      { field: "full_time_hours", label: "Heures temps plein", type: "number", required: false },
      { field: "full_time_minutes", label: "Minutes temps plein", type: "number", required: false },
      { field: "comment", label: "Commentaire", type: "text", required: false },
    ],
  },
  {
    tableName: "seniority_scales",
    displayName: "Baremes salariaux",
    order: 7,
    keyField: "sector_id,years",
    hasUniqueConstraint: true,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "sector_id",
        label: "Secteur",
        type: "number",
        required: true,
        fk: { table: "sectors", labelField: "name", idField: "id" },
      },
      { field: "years", label: "Annees", type: "number", required: true },
      { field: "base_salary", label: "Salaire de base", type: "number", required: true },
    ],
  },
  {
    tableName: "rtt_entitlements",
    displayName: "Baremes RTT",
    order: 8,
    keyField: "sector_id,seniority_start",
    hasUniqueConstraint: true,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "sector_id",
        label: "Secteur",
        type: "number",
        required: true,
        fk: { table: "sectors", labelField: "name", idField: "id" },
      },
      { field: "seniority_start", label: "Anciennete debut", type: "number", required: true },
      { field: "hours_per_year", label: "Heures/an", type: "number", required: true },
    ],
  },
  {
    tableName: "organisation_indexations",
    displayName: "Indexations generales",
    order: 9,
    keyField: "id",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "organisation_id",
        label: "Organisation",
        type: "number",
        required: true,
        fk: { table: "organisations", labelField: "name", idField: "id" },
      },
      { field: "indexation_value", label: "Valeur indexation", type: "number", required: true },
      { field: "indexation_date", label: "Date indexation", type: "date", required: true },
    ],
  },
  {
    tableName: "sector_indexations",
    displayName: "Indexations sectorielles",
    order: 10,
    keyField: "id",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "sector_id",
        label: "Secteur",
        type: "number",
        required: true,
        fk: { table: "sectors", labelField: "name", idField: "id" },
      },
      { field: "indexation_value", label: "Valeur indexation", type: "number", required: true },
      { field: "indexation_date", label: "Date indexation", type: "date", required: true },
    ],
  },
  {
    tableName: "employee_indexations",
    displayName: "Augmentations individuelles",
    order: 11,
    keyField: "id",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "employee_id",
        label: "Employe",
        type: "number",
        required: true,
        fk: { table: "employees", labelField: "last_name", idField: "id" },
      },
      { field: "indexation_value", label: "Valeur indexation", type: "number", required: true },
      { field: "indexation_date", label: "Date indexation", type: "date", required: true },
    ],
  },
  {
    tableName: "absence_codes",
    displayName: "Codes d'absence",
    order: 12,
    keyField: "code",
    hasUniqueConstraint: true,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "code", label: "Code", type: "text", required: true },
      { field: "description", label: "Description", type: "text", required: true },
      { field: "color_hex", label: "Couleur (hex)", type: "text", required: false },
      { field: "text_color_hex", label: "Couleur texte (hex)", type: "text", required: false },
      { field: "time_unit", label: "Unite de temps", type: "text", required: false },
      { field: "is_time_thematic", label: "Thematique temps", type: "boolean", required: false },
      { field: "sort_order", label: "Ordre de tri", type: "number", required: false },
    ],
  },
  {
    tableName: "vacation_rights",
    displayName: "Droits aux conges",
    order: 13,
    keyField: "employee_id,absence_code_id,year",
    hasUniqueConstraint: true,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "employee_id",
        label: "Employe",
        type: "number",
        required: true,
        fk: { table: "employees", labelField: "last_name", idField: "id" },
      },
      {
        field: "absence_code_id",
        label: "Code absence",
        type: "number",
        required: true,
        fk: { table: "absence_codes", labelField: "code", idField: "id" },
      },
      { field: "year", label: "Annee", type: "number", required: true },
      { field: "days", label: "Jours", type: "number", required: false },
      { field: "hours", label: "Heures", type: "number", required: false },
      { field: "minutes", label: "Minutes", type: "number", required: false },
    ],
  },
  {
    tableName: "holidays",
    displayName: "Jours feries",
    order: 14,
    keyField: "holiday_date",
    hasUniqueConstraint: true,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "holiday_date", label: "Date", type: "date", required: true },
      { field: "name", label: "Nom", type: "text", required: true },
    ],
  },
  {
    tableName: "leasing_assets",
    displayName: "Actifs",
    order: 15,
    keyField: "plate_number",
    hasUniqueConstraint: true,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      { field: "type", label: "Type", type: "text", required: true },
      { field: "plate_number", label: "Immatriculation", type: "text", required: false },
      { field: "model", label: "Modele", type: "text", required: false },
      { field: "color", label: "Couleur", type: "text", required: false },
      { field: "start_date", label: "Date debut", type: "date", required: false },
      { field: "end_date", label: "Date fin", type: "date", required: false },
    ],
  },
  {
    tableName: "employee_leasing",
    displayName: "Affectations actifs",
    order: 16,
    keyField: "id",
    hasUniqueConstraint: false,
    columns: [
      { field: "id", label: "ID", type: "number", required: false },
      {
        field: "employee_id",
        label: "Employe",
        type: "number",
        required: true,
        fk: { table: "employees", labelField: "last_name", idField: "id" },
      },
      {
        field: "leasing_id",
        label: "Actif",
        type: "number",
        required: true,
        fk: { table: "leasing_assets", labelField: "model", idField: "id" },
      },
      { field: "start_date", label: "Date debut", type: "date", required: false },
      { field: "end_date", label: "Date fin", type: "date", required: false },
    ],
  },
];
