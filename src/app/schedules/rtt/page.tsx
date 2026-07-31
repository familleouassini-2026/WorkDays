"use client";

import { Fragment, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calculator, ChevronDown, ChevronRight } from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sector_id: number;
  is_inactive: boolean;
}

interface Sector {
  id: number;
  name: string;
  has_rtt: boolean;
}

interface RTTEntitlement {
  id: number;
  sector_id: number;
  seniority_start: number;
  hours_per_year: number;
}

interface Timesheet {
  id: number;
  employee_id: number;
  is_active: boolean;
  monday_minutes: number | null;
  tuesday_minutes: number | null;
  wednesday_minutes: number | null;
  thursday_minutes: number | null;
  friday_minutes: number | null;
  saturday_minutes: number | null;
  sunday_minutes: number | null;
  full_time_minutes: number;
}

interface RTTResult {
  ageAtBirthdayThisYear: number;
  ageLastYear: number;
  birthMonth: number;
  hrPerYearThisYear: number;
  hrPerYearLastYear: number;
  firstPortion: number;
  secondPortion: number;
  rttLastYear: number;
  rttThisYear: number;
  totalRTT: number;
  percentWorkTime: number;
  totalRTTAdjusted: number;
}

interface EmployeeRTTRow {
  employee: Employee;
  sector: Sector;
  timesheet: Timesheet | null;
  rttResult: RTTResult | null;
  reason: string | null;
}

function calculateRTT(
  employee: Employee,
  rttEntitlements: RTTEntitlement[],
  timesheet: Timesheet | null
): RTTResult | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  const birthDate = new Date(employee.date_of_birth);
  const birthMonth = birthDate.getMonth() + 1;
  const ageAtBirthdayThisYear = currentYear - birthDate.getFullYear();
  const ageLastYear = ageAtBirthdayThisYear - 1;

  const sectorRTT = rttEntitlements.filter((r) => r.sector_id === employee.sector_id);
  if (sectorRTT.length === 0) return null;

  const minAge = Math.min(...sectorRTT.map((r) => r.seniority_start));
  if (ageAtBirthdayThisYear < minAge) return null;

  const findHours = (age: number): number => {
    const match = sectorRTT
      .filter((r) => r.seniority_start <= age)
      .sort((a, b) => b.seniority_start - a.seniority_start)[0];
    return match ? match.hours_per_year : 0;
  };

  const hrPerYearThisYear = findHours(ageAtBirthdayThisYear);
  const hrPerYearLastYear = findHours(ageLastYear);
  const firstPortion = (birthMonth - 1) / 12;
  const secondPortion = 1 - firstPortion;
  const rttLastYear = firstPortion * hrPerYearLastYear;
  const rttThisYear = secondPortion * hrPerYearThisYear;
  const totalRTT = rttLastYear + rttThisYear;

  let percentWorkTime = 1;
  if (timesheet) {
    const totalMinutes =
      (timesheet.monday_minutes || 0) +
      (timesheet.tuesday_minutes || 0) +
      (timesheet.wednesday_minutes || 0) +
      (timesheet.thursday_minutes || 0) +
      (timesheet.friday_minutes || 0) +
      (timesheet.saturday_minutes || 0) +
      (timesheet.sunday_minutes || 0);
    percentWorkTime = totalMinutes / (timesheet.full_time_minutes || 2280);
  }

  const totalRTTAdjusted = Math.round(totalRTT * percentWorkTime * 100) / 100;

  return {
    ageAtBirthdayThisYear,
    ageLastYear,
    birthMonth,
    hrPerYearThisYear,
    hrPerYearLastYear,
    firstPortion,
    secondPortion,
    rttLastYear: Math.round(rttLastYear * 100) / 100,
    rttThisYear: Math.round(rttThisYear * 100) / 100,
    totalRTT: Math.round(totalRTT * 100) / 100,
    percentWorkTime: Math.round(percentWorkTime * 100),
    totalRTTAdjusted,
  };
}

export default function RTTPage() {
  const [rows, setRows] = useState<EmployeeRTTRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [totalActive, setTotalActive] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [employeesRes, sectorsRes, entitlementsRes, timesheetsRes] = await Promise.all([
        supabase.from("employees").select("*").eq("is_inactive", false),
        supabase.from("sectors").select("*"),
        supabase.from("rtt_entitlements").select("*"),
        supabase.from("timesheets").select("*").eq("is_active", true),
      ]);

      const employees: Employee[] = employeesRes.data || [];
      const sectors: Sector[] = sectorsRes.data || [];
      const entitlements: RTTEntitlement[] = entitlementsRes.data || [];
      const timesheets: Timesheet[] = timesheetsRes.data || [];

      setTotalActive(employees.length);

      const sectorMap = new Map(sectors.map((s) => [s.id, s]));
      const timesheetMap = new Map(timesheets.map((t) => [t.employee_id, t]));

      const computed: EmployeeRTTRow[] = employees.map((emp) => {
        const sector = sectorMap.get(emp.sector_id) || { id: emp.sector_id, name: "Inconnu", has_rtt: false };
        const timesheet = timesheetMap.get(emp.id) || null;

        if (!sector.has_rtt) {
          return { employee: emp, sector, timesheet, rttResult: null, reason: "Secteur non eligible RTT" };
        }

        const result = calculateRTT(emp, entitlements, timesheet);
        if (!result) {
          return { employee: emp, sector, timesheet, rttResult: null, reason: "Age insuffisant" };
        }

        return { employee: emp, sector, timesheet, rttResult: result, reason: null };
      });

      // Sort: eligible first (by totalRTTAdjusted descending), then non-eligible
      computed.sort((a, b) => {
        if (a.rttResult && b.rttResult) {
          return b.rttResult.totalRTTAdjusted - a.rttResult.totalRTTAdjusted;
        }
        if (a.rttResult) return -1;
        if (b.rttResult) return 1;
        return 0;
      });

      setRows(computed);
      setLoading(false);
    }
    fetchData();
  }, []);

  const eligibleCount = rows.filter((r) => r.rttResult !== null).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">RTT &mdash; Reduction du Temps de Travail</h1>
        <p className="text-slate-500 mt-1">
          Calcul des droits RTT par employe : base sur l&apos;age, prorata par date d&apos;anniversaire, ajuste au pourcentage de temps de travail.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm text-blue-700 font-medium">
            {eligibleCount} employe{eligibleCount > 1 ? "s" : ""} eligible{eligibleCount > 1 ? "s" : ""} sur {totalActive} actif{totalActive > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Calculator className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun employe trouve.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-8"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Employe</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Secteur</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Age</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Heures/an (avant anni.)</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Heures/an (apres anni.)</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Prorata</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Total brut</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">% travail</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Total RTT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const isExpanded = expandedId === row.employee.id;
                const r = row.rttResult;

                return (
                  <Fragment key={row.employee.id}>
                    <tr
                      className={`hover:bg-slate-50 cursor-pointer ${r ? "" : "opacity-60"}`}
                      onClick={() => setExpandedId(isExpanded ? null : row.employee.id)}
                    >
                      <td className="px-4 py-3 text-slate-400">
                        {r ? (
                          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {row.employee.last_name}, {row.employee.first_name}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">{row.sector.name}</td>
                      {r ? (
                        <>
                          <td className="text-center px-3 py-3 text-sm text-slate-700">{r.ageAtBirthdayThisYear}</td>
                          <td className="text-center px-3 py-3 text-sm text-slate-700">{r.hrPerYearLastYear}h</td>
                          <td className="text-center px-3 py-3 text-sm text-slate-700">{r.hrPerYearThisYear}h</td>
                          <td className="text-center px-3 py-3 text-sm text-slate-700">
                            {r.rttLastYear}h + {r.rttThisYear}h
                          </td>
                          <td className="text-center px-3 py-3 text-sm text-slate-700">{r.totalRTT}h</td>
                          <td className="text-center px-3 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${r.percentWorkTime === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {r.percentWorkTime}%
                            </span>
                          </td>
                          <td className="text-center px-3 py-3">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                              {r.totalRTTAdjusted}h
                            </span>
                          </td>
                        </>
                      ) : (
                        <td colSpan={7} className="px-3 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                            Non eligible &mdash; {row.reason}
                          </span>
                        </td>
                      )}
                    </tr>
                    {isExpanded && r && (
                      <tr className="bg-blue-50/50">
                        <td colSpan={10} className="px-8 py-4">
                          <div className="text-sm text-slate-700 space-y-2">
                            <p className="font-semibold text-slate-900">Detail du calcul RTT</p>
                            <div className="grid grid-cols-2 gap-4 max-w-2xl">
                              <div>
                                <p className="text-xs text-slate-500">Age au {r.birthMonth}/01/{new Date().getFullYear()}</p>
                                <p className="font-medium">{r.ageAtBirthdayThisYear} ans (avant : {r.ageLastYear} ans)</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Mois anniversaire</p>
                                <p className="font-medium">Mois {r.birthMonth}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Portion avant anniversaire</p>
                                <p className="font-medium">{r.firstPortion.toFixed(4)} ({r.birthMonth - 1}/12) x {r.hrPerYearLastYear}h = {r.rttLastYear}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Portion apres anniversaire</p>
                                <p className="font-medium">{r.secondPortion.toFixed(4)} ({12 - r.birthMonth + 1}/12) x {r.hrPerYearThisYear}h = {r.rttThisYear}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Total brut</p>
                                <p className="font-medium">{r.rttLastYear}h + {r.rttThisYear}h = {r.totalRTT}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Ajustement temps de travail</p>
                                <p className="font-medium">{r.totalRTT}h x {r.percentWorkTime}% = {r.totalRTTAdjusted}h</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


