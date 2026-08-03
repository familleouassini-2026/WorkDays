"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Calendar, Users, TrendingUp, FileText, Plus, Play, Pencil, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  calculateSeniorityYears,
  findBaseSalary,
  calculateDProduct,
  calculatePersonalIncreases,
  type IndexationRow,
  type EmployeeIndexationRow,
  type SeniorityScaleRow,
} from "@/lib/calculations";

interface AbsenceReport {
  employee_name: string;
  code: string;
  code_description: string;
  total_days: number;
  total_minutes: number;
}

interface MonthlySummary {
  month: number;
  count: number;
}

interface SalaryEmployee {
  id: number;
  first_name: string;
  last_name: string;
  date_of_hire: string | null;
  granted_seniority_date: string | null;
  granted_seniority: number | null;
  sector_id: number | null;
  sectors: { name: string } | null;
  currentSalary: number | null;
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    async function fetchTemplates() {
      setTemplatesLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });
      setTemplates(data || []);
      setTemplatesLoading(false);
    }
    fetchTemplates();
  }, []);

  async function deleteTemplate(templateId: string) {
    if (!confirm("Supprimer ce rapport sauvegarde ?")) return;
    const supabase = createClient();
    await supabase.from("report_templates").delete().eq("id", templateId);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }

  const reports = [
    { id: "absences-employee", label: "Absences par employe", description: "Total absences par type et par employe pour l'annee", icon: Users, color: "text-blue-600 bg-blue-50" },
    { id: "absences-monthly", label: "Absences par mois", description: "Nombre d'absences par mois (tous employes)", icon: Calendar, color: "text-emerald-600 bg-emerald-50" },
    { id: "salary-overview", label: "Apercu salarial", description: "Salaire de base, anciennete et salaire actuel par employe", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
  ];

  async function generateReport(reportId: string) {
    setActiveReport(reportId);
    setLoading(true);
    const supabase = createClient();

    if (reportId === "absences-employee") {
      const { data } = await supabase
        .from("year_calendar")
        .select("employee_id, absence_code_id, absence_minutes, absence_days, employees(first_name, last_name), absence_codes(code, description)")
        .eq("year", selectedYear);

      if (data) {
        const grouped: Record<string, AbsenceReport> = {};
        for (const row of data as any[]) {
          const key = `${row.employee_id}-${row.absence_code_id}`;
          if (!grouped[key]) {
            grouped[key] = {
              employee_name: row.employees ? `${row.employees.last_name}, ${row.employees.first_name}` : "?",
              code: row.absence_codes?.code || "?",
              code_description: row.absence_codes?.description || "",
              total_days: 0,
              total_minutes: 0,
            };
          }
          grouped[key].total_days += row.absence_days || 0;
          grouped[key].total_minutes += row.absence_minutes || 0;
        }
        setReportData(Object.values(grouped).sort((a, b) => a.employee_name.localeCompare(b.employee_name)));
      }
    } else if (reportId === "absences-monthly") {
      const { data } = await supabase
        .from("year_calendar")
        .select("absence_date")
        .eq("year", selectedYear);

      if (data) {
        const months: Record<number, number> = {};
        for (const row of data) {
          const m = new Date(row.absence_date + "T00:00:00").getMonth() + 1;
          months[m] = (months[m] || 0) + 1;
        }
        const summary: MonthlySummary[] = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          count: months[i + 1] || 0,
        }));
        setReportData(summary);
      }
    } else if (reportId === "salary-overview") {
      // Fetch employees, scales, org indexations, sector indexations, and employee indexations
      const [empRes, scalesRes, orgIdxRes, secIdxRes, empIdxRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name, date_of_hire, granted_seniority_date, granted_seniority, sector_id, sectors(name)")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase
          .from("seniority_scales")
          .select("id, sector_id, years, base_salary"),
        supabase
          .from("organisation_indexations")
          .select("id, indexation_value, indexation_date"),
        supabase
          .from("sector_indexations")
          .select("id, sector_id, indexation_value, indexation_date"),
        supabase
          .from("employee_indexations")
          .select("id, employee_id, indexation_value, indexation_date"),
      ]);

      const scales: SeniorityScaleRow[] = (scalesRes.data || []) as SeniorityScaleRow[];
      const orgIndexations: IndexationRow[] = (orgIdxRes.data || []) as IndexationRow[];
      const allSectorIndexations = (secIdxRes.data || []) as (IndexationRow & { sector_id: number })[];
      const allEmployeeIndexations = (empIdxRes.data || []) as EmployeeIndexationRow[];

      const orgDProduct = calculateDProduct(orgIndexations);

      const employees: SalaryEmployee[] = ((empRes.data || []) as any[]).map((emp) => {
        let currentSalary: number | null = null;
        if (emp.sector_id) {
          const seniorityYears = calculateSeniorityYears(
            emp.date_of_hire,
            emp.granted_seniority,
            emp.granted_seniority_date
          );
          const baseSalary = findBaseSalary(emp.sector_id, seniorityYears, scales);
          if (baseSalary !== null) {
            const sectorIdxs: IndexationRow[] = allSectorIndexations.filter(
              (si) => si.sector_id === emp.sector_id
            );
            const sectorDProduct = calculateDProduct(sectorIdxs);
            const empIdxs: EmployeeIndexationRow[] = allEmployeeIndexations.filter(
              (ei) => ei.employee_id === emp.id
            );
            const personalTotal = calculatePersonalIncreases(empIdxs);
            currentSalary = baseSalary * orgDProduct * sectorDProduct + personalTotal;
          }
        }
        return {
          id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          date_of_hire: emp.date_of_hire,
          granted_seniority_date: emp.granted_seniority_date,
          granted_seniority: emp.granted_seniority,
          sector_id: emp.sector_id,
          sectors: emp.sectors,
          currentSalary,
        };
      });

      setReportData(employees);
    }

    setLoading(false);
  }

  function exportCSV() {
    if (!reportData || !activeReport) return;
    let csv = "";

    if (activeReport === "absences-employee") {
      csv = "Employe,Code,Description,Jours,Minutes\n";
      for (const row of reportData as AbsenceReport[]) {
        csv += `"${row.employee_name}","${row.code}","${row.code_description}",${row.total_days},${row.total_minutes}\n`;
      }
    } else if (activeReport === "absences-monthly") {
      const monthNames = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
      csv = "Mois,Absences\n";
      for (const row of reportData as MonthlySummary[]) {
        csv += `${monthNames[row.month - 1]},${row.count}\n`;
      }
    } else if (activeReport === "salary-overview") {
      csv = "Employe,Secteur,Date embauche,Anciennete effective,Salaire actuel\n";
      for (const row of reportData as SalaryEmployee[]) {
        const salary = row.currentSalary !== null ? row.currentSalary.toFixed(2) : "";
        csv += `"${row.last_name}, ${row.first_name}","${row.sectors?.name || ""}","${row.date_of_hire || ""}","${row.granted_seniority_date || row.date_of_hire || ""}",${salary}\n`;
      }
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${activeReport}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    if (!reportData || !activeReport) return;
    const reportTitle = reports.find((r) => r.id === activeReport)?.label || "Rapport";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let tableHtml = "";
    if (activeReport === "absences-employee") {
      tableHtml = `<table><thead><tr><th>Employe</th><th>Code</th><th>Description</th><th>Jours</th><th>Heures</th></tr></thead><tbody>`;
      for (const row of reportData as AbsenceReport[]) {
        const hours = row.total_minutes > 0 ? `${Math.floor(row.total_minutes / 60)}h${(row.total_minutes % 60).toString().padStart(2, "0")}` : "-";
        tableHtml += `<tr><td>${row.employee_name}</td><td>${row.code}</td><td>${row.code_description}</td><td>${row.total_days || "-"}</td><td>${hours}</td></tr>`;
      }
      tableHtml += `</tbody></table>`;
    } else if (activeReport === "absences-monthly") {
      const mNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
      tableHtml = `<table><thead><tr><th>Mois</th><th>Nombre d'absences</th></tr></thead><tbody>`;
      for (const row of reportData as MonthlySummary[]) {
        tableHtml += `<tr><td>${mNames[row.month - 1]}</td><td>${row.count}</td></tr>`;
      }
      tableHtml += `</tbody></table>`;
    } else if (activeReport === "salary-overview") {
      tableHtml = `<table><thead><tr><th>Employe</th><th>Secteur</th><th>Embauche</th><th>Anciennete eff.</th><th>Salaire actuel</th></tr></thead><tbody>`;
      for (const row of reportData as SalaryEmployee[]) {
        const salary = row.currentSalary !== null ? row.currentSalary.toLocaleString("fr-BE", { style: "currency", currency: "EUR" }) : "-";
        tableHtml += `<tr><td>${row.last_name}, ${row.first_name}</td><td>${row.sectors?.name || "-"}</td><td>${row.date_of_hire || "-"}</td><td>${row.granted_seniority_date || row.date_of_hire || "-"}</td><td>${salary}</td></tr>`;
      }
      tableHtml += `</tbody></table>`;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${reportTitle} - ${selectedYear}</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#1e293b}h1{font-size:20px;margin-bottom:4px}p{color:#64748b;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f1f5f9;text-align:left;padding:8px 12px;border-bottom:2px solid #e2e8f0;font-weight:600;text-transform:uppercase;font-size:11px;color:#64748b}td{padding:8px 12px;border-bottom:1px solid #f1f5f9}tr:hover{background:#f8fafc}@media print{body{padding:20px}}</style></head><body><h1>${reportTitle}</h1><p>WorkDays - Annee ${selectedYear} - Genere le ${new Date().toLocaleDateString("fr-FR")}</p>${tableHtml}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  }

  const monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rapports</h1>
          <p className="text-slate-500 mt-1">Generez et exportez des rapports RH</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            {years.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
          <Link href="/reports/builder" className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nouveau rapport
          </Link>
        </div>
      </div>

      {/* Report selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          return (
            <button key={report.id} onClick={() => generateReport(report.id)} className={`text-left rounded-lg border p-5 transition-all ${isActive ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50/30" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.color}`}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{report.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{report.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report output */}
      {loading && (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" /><p className="text-slate-500 mt-4">Generation...</p></div>
      )}

      {!loading && reportData && activeReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Resultat - {selectedYear}</h3>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"><Download className="w-3.5 h-3.5" />CSV</button>
              <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Download className="w-3.5 h-3.5" />PDF</button>
            </div>
          </div>

          {activeReport === "absences-employee" && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Employe</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jours</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Heures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(reportData as AbsenceReport[]).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-sm text-slate-900 font-medium">{row.employee_name}</td>
                      <td className="px-4 py-2 text-sm text-slate-600"><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{row.code}</span> {row.code_description}</td>
                      <td className="px-4 py-2 text-sm text-slate-900 text-right">{row.total_days > 0 ? row.total_days : "-"}</td>
                      <td className="px-4 py-2 text-sm text-slate-900 text-right">{row.total_minutes > 0 ? `${Math.floor(row.total_minutes / 60)}h${(row.total_minutes % 60).toString().padStart(2, "0")}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(reportData as AbsenceReport[]).length === 0 && <p className="text-center py-6 text-sm text-slate-500">Aucune absence enregistree pour {selectedYear}.</p>}
            </div>
          )}

          {activeReport === "absences-monthly" && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="grid grid-cols-12 gap-2 items-end h-48">
                {(reportData as MonthlySummary[]).map((row) => {
                  const max = Math.max(...(reportData as MonthlySummary[]).map((r) => r.count), 1);
                  const height = max > 0 ? (row.count / max) * 100 : 0;
                  return (
                    <div key={row.month} className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-slate-700">{row.count}</span>
                      <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%`, minHeight: row.count > 0 ? "4px" : "0" }} />
                      <span className="text-xs text-slate-500">{monthNames[row.month - 1].slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeReport === "salary-overview" && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Employe</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Secteur</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Embauche</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Anciennete eff.</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Salaire actuel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(reportData as SalaryEmployee[]).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-sm text-slate-900 font-medium">{emp.last_name}, {emp.first_name}</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{emp.sectors?.name || "-"}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 text-center">{emp.date_of_hire ? new Date(emp.date_of_hire + "T00:00:00").toLocaleDateString("fr-FR") : "-"}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 text-center">{(emp.granted_seniority_date || emp.date_of_hire) ? new Date((emp.granted_seniority_date || emp.date_of_hire)! + "T00:00:00").toLocaleDateString("fr-FR") : "-"}</td>
                      <td className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                        {emp.currentSalary !== null
                          ? emp.currentSalary.toLocaleString("fr-BE", { style: "currency", currency: "EUR" })
                          : <span className="text-slate-400 text-xs">N/A</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!activeReport && !loading && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Selectionnez un rapport ci-dessus pour le generer.</p>
        </div>
      )}

      {/* Saved templates section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Rapports sauvegardes</h2>
        {templatesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-3 text-sm">Aucun rapport sauvegarde. Utilisez le bouton &quot;Nouveau rapport&quot; pour en creer un.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => {
              const config = tpl.config as { tables?: string[]; columns?: unknown[] } | null;
              const tableCount = config?.tables?.length || 0;
              const columnCount = config?.columns?.length || 0;
              const createdDate = tpl.created_at
                ? new Date(tpl.created_at).toLocaleDateString("fr-FR")
                : "-";

              return (
                <div key={tpl.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{tpl.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Cree le {createdDate} &middot; {tableCount} table{tableCount !== 1 ? "s" : ""}, {columnCount} colonne{columnCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/reports/${tpl.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Utiliser
                    </Link>
                    <Link
                      href={`/reports/builder?id=${tpl.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Modifier
                    </Link>
                    <Link
                      href={`/reports/builder?duplicate=${tpl.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Dupliquer
                    </Link>
                    <button
                      onClick={() => deleteTemplate(tpl.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
