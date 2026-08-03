"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Calculator, ExternalLink, Info, ChevronDown, ChevronUp } from "lucide-react";

// ---------- TYPES ----------

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  sector_id: number | null;
  sectors?: { name: string; has_rtt: boolean } | null;
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

// ---------- HELPERS ----------

function formatDate(d: string | null) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("fr-BE");
}

// ---------- PAGE ----------

export default function EmployeeRTTPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [entitlements, setEntitlements] = useState<RTTEntitlement[]>([]);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [noRTT, setNoRTT] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const empId = params.id;

      // Fetch employee with sector
      const { data: emp } = await supabase
        .from("employees")
        .select("id, first_name, last_name, date_of_birth, sector_id, sectors(name, has_rtt)")
        .eq("id", empId)
        .single();

      if (emp) {
        setEmployee(emp as unknown as Employee);

        const sectorData = emp.sectors as unknown as { has_rtt: boolean } | null;
        if (!emp.sector_id || !sectorData?.has_rtt) {
          setNoRTT(true);
          setLoading(false);
          return;
        }

        // Fetch RTT entitlements for this sector
        const { data: ent } = await supabase
          .from("rtt_entitlements")
          .select("*")
          .eq("sector_id", emp.sector_id);

        if (ent && ent.length > 0) {
          setEntitlements(ent);
        } else {
          setNoRTT(true);
          setLoading(false);
          return;
        }

        // Fetch active timesheet
        const { data: ts } = await supabase
          .from("timesheets")
          .select("*")
          .eq("employee_id", empId)
          .eq("is_active", true)
          .single();

        if (ts) setTimesheet(ts);
      }

      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Employ&eacute; non trouv&eacute;.</p>
        <Link href="/employees" className="text-blue-600 hover:underline mt-2 inline-block">
          Retour &agrave; la liste
        </Link>
      </div>
    );
  }

  if (noRTT) {
    return (
      <div className="space-y-6">
        <Link
          href={`/employees/${employee.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Retour &agrave; la fiche
        </Link>

        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-900">
            RTT - {employee.first_name} {employee.last_name}
          </h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-800 font-medium">RTT non applicable pour ce secteur</p>
          <p className="text-amber-600 text-sm mt-1">
            Le secteur {employee.sectors?.name || "non d\u00e9fini"} ne dispose pas de bar&egrave;me RTT configur&eacute;.
          </p>
        </div>
      </div>
    );
  }

  // ---------- RTT CALCULATION ----------
  const currentYear = new Date().getFullYear();
  const birthDate = new Date(employee.date_of_birth!);
  const birthMonth = birthDate.getMonth() + 1;
  const ageAtBirthdayThisYear = currentYear - birthDate.getFullYear();
  const ageLastYear = ageAtBirthdayThisYear - 1;

  // Use all entitlements (already filtered by sector_id in query)
  const findHours = (age: number): number => {
    const match = entitlements
      .filter((r) => Number(r.seniority_start) <= age)
      .sort((a, b) => Number(b.seniority_start) - Number(a.seniority_start))[0];
    return match ? Number(match.hours_per_year) : 0;
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
  const percentDisplay = Math.round(percentWorkTime * 100);

  // Birthday this year
  const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/employees/${employee.id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" /> Retour &agrave; la fiche
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-slate-900">
          RTT - {employee.first_name} {employee.last_name}
        </h1>
      </div>

      {/* Info banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-blue-800">Comment &ccedil;a marche ?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Le calcul RTT est bas&eacute; sur l&apos;&acirc;ge de l&apos;employ&eacute; au moment de son anniversaire. Le total est proratis&eacute; selon le mois de naissance (portion avant/apr&egrave;s anniversaire) puis ajust&eacute; au pourcentage de temps de travail effectif.
            </p>
            <button
              onClick={() => setFormulaOpen(!formulaOpen)}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 mt-2"
            >
              {formulaOpen ? "Masquer la formule" : "Voir la formule"}
              {formulaOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {formulaOpen && (
              <div className="mt-2 bg-white/60 rounded-md p-3 border border-blue-100">
                <p className="text-xs font-mono text-blue-800 leading-relaxed">
                  RTT = (mois_avant/12 &times; heures_N-1) + (mois_apr&egrave;s/12 &times; heures_N) &times; %_temps_travail
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee info card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Informations employ&eacute;</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">&Acirc;ge atteint en {currentYear}</span>
            <span className="font-medium text-slate-900">{ageAtBirthdayThisYear} ans</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">Date de naissance</span>
            <span className="font-medium text-slate-900">{formatDate(employee.date_of_birth)}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">Anniversaire cette ann&eacute;e</span>
            <span className="font-medium text-slate-900">{birthdayThisYear.toLocaleDateString("fr-BE")}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">Secteur</span>
            <span className="font-medium text-slate-900">{employee.sectors?.name || "\u2014"}</span>
          </div>
        </div>
      </div>

      {/* RTT Calculation Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">D&eacute;tail du calcul RTT ({currentYear})</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">&Acirc;ge atteint en {currentYear}</span>
              <span className="font-medium text-slate-900">{ageAtBirthdayThisYear} ans <span className="text-xs text-slate-400">(le {birthdayThisYear.toLocaleDateString("fr-BE")})</span></span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">&Acirc;ge atteint en {currentYear - 1}</span>
              <span className="font-medium text-slate-900">{ageLastYear} ans</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Heures/an (N)</span>
              <span className="font-medium text-slate-900">{hrPerYearThisYear}h</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Heures/an (N-1)</span>
              <span className="font-medium text-slate-900">{hrPerYearLastYear}h</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2">
            <p className="text-slate-600">
              <span className="font-medium">Prorata mois anniversaire :</span>{" "}
              mois {birthMonth} &rarr; {firstPortion.toFixed(4)} + {secondPortion.toFixed(4)}
            </p>
            <p className="text-slate-600">
              <span className="font-medium">RTT N-1 :</span>{" "}
              {firstPortion.toFixed(4)} &times; {hrPerYearLastYear}h = {(Math.round(rttLastYear * 100) / 100).toFixed(2)}h
            </p>
            <p className="text-slate-600">
              <span className="font-medium">RTT N :</span>{" "}
              {secondPortion.toFixed(4)} &times; {hrPerYearThisYear}h = {(Math.round(rttThisYear * 100) / 100).toFixed(2)}h
            </p>
            <p className="text-slate-600">
              <span className="font-medium">Total brut :</span>{" "}
              {(Math.round(rttLastYear * 100) / 100).toFixed(2)}h + {(Math.round(rttThisYear * 100) / 100).toFixed(2)}h = {(Math.round(totalRTT * 100) / 100).toFixed(2)}h
            </p>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-500">% temps de travail</span>
            <span className={`font-medium ${percentDisplay === 100 ? "text-emerald-700" : "text-amber-700"}`}>
              {percentDisplay}%
            </span>
          </div>

          <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-4">
            <span className="font-semibold text-blue-900">TOTAL RTT ajust&eacute;</span>
            <span className="font-bold text-blue-900 text-lg">{totalRTTAdjusted}h</span>
          </div>
        </div>
      </div>

      {/* Source data links */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Modifier les donn&eacute;es source</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/employees/${employee.id}/edit`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Date de naissance
          </Link>
          <Link
            href={`/employees/${employee.id}/timesheets`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Horaires (% temps)
          </Link>
          <Link
            href="/settings/rtt-entitlements"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Modifier les baremes RTT
          </Link>
        </div>
      </div>
    </div>
  );
}
