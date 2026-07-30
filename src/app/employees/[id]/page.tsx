"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

interface Employee {
  id: number;
  title: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile_phone: string | null;
  business_phone: string | null;
  home_phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  country: string | null;
  job_title: string | null;
  contract_type: string | null;
  date_of_hire: string | null;
  end_date: string | null;
  date_of_birth: string | null;
  is_inactive: boolean;
  nationality: string | null;
  national_registration: string | null;
  inami_number: string | null;
  iban: string | null;
  bic: string | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  distance_to_home: number | null;
  sector_id: number | null;
  location_id: number | null;
  notes: string | null;
  sectors?: { name: string } | null;
  locations?: { name: string } | null;
}

interface Timesheet {
  id: number;
  monday_minutes: number | null;
  tuesday_minutes: number | null;
  wednesday_minutes: number | null;
  thursday_minutes: number | null;
  friday_minutes: number | null;
  saturday_minutes: number | null;
  sunday_minutes: number | null;
  full_time_minutes: number;
}

const tabs = [
  { id: "overview", label: "Aperçu" },
  { id: "contract", label: "Contrat" },
  { id: "schedule", label: "Horaire" },
  { id: "salary", label: "Salaire" },
];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-BE");
}

function minutesToHM(m: number | null) {
  if (!m) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

function calcSeniority(hireDate: string | null, grantedDate: string | null) {
  const start = grantedDate || hireDate;
  if (!start) return "—";
  const diff = Date.now() - new Date(start).getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor(
    (diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000)
  );
  return `${years} an${years > 1 ? "s" : ""} ${months} mois`;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from("employees")
        .select("*, sectors(name), locations(name)")
        .eq("id", params.id)
        .single();

      if (data) setEmployee(data);

      const { data: ts } = await supabase
        .from("timesheets")
        .select("*")
        .eq("employee_id", params.id)
        .eq("is_active", true)
        .single();

      if (ts) setTimesheet(ts);
      setLoading(false);
    }
    fetch();
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("employees").delete().eq("id", params.id);
    router.push("/employees");
  }

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
        <p className="text-slate-500">Employé non trouvé.</p>
        <Link href="/employees" className="text-blue-600 hover:underline mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const totalMinutes =
    (timesheet?.monday_minutes || 0) +
    (timesheet?.tuesday_minutes || 0) +
    (timesheet?.wednesday_minutes || 0) +
    (timesheet?.thursday_minutes || 0) +
    (timesheet?.friday_minutes || 0) +
    (timesheet?.saturday_minutes || 0) +
    (timesheet?.sunday_minutes || 0);

  const pctFullTime = timesheet
    ? Math.round((totalMinutes / timesheet.full_time_minutes) * 100)
    : null;

  return (
    <div className="space-y-6">
      <Link href="/employees" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Retour au personnel
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-blue-700">
              {employee.first_name[0]}{employee.last_name[0]}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {employee.title && <span className="text-slate-500 font-normal">{employee.title} </span>}
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-slate-500">{employee.job_title || "—"} • {employee.sectors?.name || "Pas de secteur"}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {employee.email && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Mail className="w-3.5 h-3.5" /> {employee.email}
                </span>
              )}
              {employee.mobile_phone && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Phone className="w-3.5 h-3.5" /> {employee.mobile_phone}
                </span>
              )}
              {employee.locations?.name && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="w-3.5 h-3.5" /> {employee.locations.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${employee.is_inactive ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
              {employee.is_inactive ? "Inactif" : "Actif"}
            </span>
            <Link href={`/employees/${employee.id}/edit`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium">
              <Pencil className="w-4 h-4" />
              Modifier
            </Link>
            <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Aperçu */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><User className="w-4 h-4" /> Informations personnelles</h3>
            <InfoRow label="Date de naissance" value={formatDate(employee.date_of_birth)} />
            <InfoRow label="Nationalité" value={employee.nationality} />
            <InfoRow label="N° Registre National" value={employee.national_registration} />
            <InfoRow label="N° INAMI" value={employee.inami_number} />
            <InfoRow label="Adresse" value={[employee.address, employee.postal_code, employee.city, employee.province].filter(Boolean).join(", ") || null} />
          </div>
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Building className="w-4 h-4" /> Informations professionnelles</h3>
            <InfoRow label="Fonction" value={employee.job_title} />
            <InfoRow label="Secteur" value={employee.sectors?.name} />
            <InfoRow label="Site" value={employee.locations?.name} />
            <InfoRow label="Contrat" value={employee.contract_type} />
            <InfoRow label="Date d'embauche" value={formatDate(employee.date_of_hire)} />
            <InfoRow label="Ancienneté" value={calcSeniority(employee.date_of_hire, employee.granted_seniority_date)} />
            {pctFullTime && <InfoRow label="Temps de travail" value={`${pctFullTime}% (${minutesToHM(totalMinutes)}/sem)`} />}
          </div>
        </div>
      )}

      {/* Tab: Contrat */}
      {activeTab === "contract" && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Détails du contrat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <InfoRow label="Type de contrat" value={employee.contract_type} />
              <InfoRow label="Date d'embauche" value={formatDate(employee.date_of_hire)} />
              <InfoRow label="Date de fin" value={formatDate(employee.end_date)} />
              <InfoRow label="Ancienneté accordée" value={employee.granted_seniority ? `${employee.granted_seniority} an(s)` : null} />
              <InfoRow label="Date ancienneté accordée" value={formatDate(employee.granted_seniority_date)} />
            </div>
            <div className="space-y-3">
              <InfoRow label="IBAN" value={employee.iban} />
              <InfoRow label="BIC" value={employee.bic} />
              <InfoRow label="Distance domicile" value={employee.distance_to_home ? `${employee.distance_to_home} km` : null} />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Horaire */}
      {activeTab === "schedule" && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Horaire hebdomadaire</h3>
          {timesheet ? (
            <div>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {[
                  { label: "Lun", val: timesheet.monday_minutes },
                  { label: "Mar", val: timesheet.tuesday_minutes },
                  { label: "Mer", val: timesheet.wednesday_minutes },
                  { label: "Jeu", val: timesheet.thursday_minutes },
                  { label: "Ven", val: timesheet.friday_minutes },
                  { label: "Sam", val: timesheet.saturday_minutes },
                  { label: "Dim", val: timesheet.sunday_minutes },
                ].map((day) => (
                  <div key={day.label} className="text-center bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium">{day.label}</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{minutesToHM(day.val)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-600">Total: <strong>{minutesToHM(totalMinutes)}</strong>/semaine</span>
                <span className="text-slate-600">Temps plein: <strong>{minutesToHM(timesheet.full_time_minutes)}</strong></span>
                <span className="text-slate-600">Pourcentage: <strong className="text-blue-600">{pctFullTime}%</strong></span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Aucun horaire défini pour cet employé.</p>
          )}
        </div>
      )}

      {/* Tab: Salaire */}
      {activeTab === "salary" && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Informations salariales</h3>
          <p className="text-slate-500 text-sm">
            Le module de calcul salarial sera connecté prochainement. 
            Il calculera le salaire indexé basé sur le barème du secteur et l&apos;ancienneté.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium">Secteur</p>
              <p className="text-sm font-bold text-blue-900 mt-1">{employee.sectors?.name || "—"}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium">Ancienneté effective</p>
              <p className="text-sm font-bold text-blue-900 mt-1">{calcSeniority(employee.date_of_hire, employee.granted_seniority_date)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium">Temps de travail</p>
              <p className="text-sm font-bold text-blue-900 mt-1">{pctFullTime ? `${pctFullTime}%` : "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm text-slate-900 font-medium text-right">{value || "—"}</span>
    </div>
  );
}
