"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
} from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  position: string;
  status: string;
  hire_date: string;
  contract_type: string;
  salary: number;
  national_number: string;
}

const tabs = [
  { id: "overview", label: "Aperçu" },
  { id: "contract", label: "Contrat" },
  { id: "leaves", label: "Congés" },
  { id: "salary", label: "Salaire" },
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployee() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setEmployee(data);
      }
      setLoading(false);
    }

    fetchEmployee();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Employé non trouvé.</p>
        <Link
          href="/employees"
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au personnel
      </Link>

      {/* Employee Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-primary-700">
              {employee.first_name?.[0]}
              {employee.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-slate-500">{employee.position}</p>
            <div className="flex items-center gap-4 mt-3">
              {employee.email && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {employee.email}
                </span>
              )}
              {employee.phone && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  {employee.phone}
                </span>
              )}
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              employee.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {employee.status === "active" ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">
                Informations personnelles
              </h3>
              <div className="space-y-3">
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={employee.email}
                />
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Téléphone"
                  value={employee.phone}
                />
                <InfoRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="Adresse"
                  value={employee.address}
                />
              </div>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">
                Informations professionnelles
              </h3>
              <div className="space-y-3">
                <InfoRow
                  icon={<Building className="w-4 h-4" />}
                  label="Département"
                  value={employee.department}
                />
                <InfoRow
                  icon={<Building className="w-4 h-4" />}
                  label="Fonction"
                  value={employee.position}
                />
                <InfoRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Date d'entrée"
                  value={
                    employee.hire_date
                      ? new Date(employee.hire_date).toLocaleDateString("fr-BE")
                      : "—"
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "contract" && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Détails du contrat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <InfoRow
                  label="Type de contrat"
                  value={employee.contract_type || "CDI"}
                />
                <InfoRow
                  label="Date de début"
                  value={
                    employee.hire_date
                      ? new Date(employee.hire_date).toLocaleDateString("fr-BE")
                      : "—"
                  }
                />
                <InfoRow label="Statut" value={employee.status === "active" ? "Actif" : "Inactif"} />
              </div>
              <div className="space-y-3">
                <InfoRow
                  label="Numéro national"
                  value={employee.national_number || "—"}
                />
                <InfoRow
                  label="Département"
                  value={employee.department || "—"}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaves" && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Solde de congés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-sm text-emerald-600 font-medium">
                  Congés annuels
                </p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  12 / 20
                </p>
                <p className="text-xs text-emerald-600 mt-1">jours restants</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-medium">RTT</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">4 / 6</p>
                <p className="text-xs text-blue-600 mt-1">jours restants</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 font-medium">Maladie</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">2</p>
                <p className="text-xs text-purple-600 mt-1">
                  jours pris cette année
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "salary" && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Informations salariales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <InfoRow
                  label="Salaire brut mensuel"
                  value={
                    employee.salary
                      ? `€ ${employee.salary.toLocaleString("fr-BE")}`
                      : "—"
                  }
                />
                <InfoRow label="Barème" value="—" />
                <InfoRow label="Échelon" value="—" />
              </div>
              <div className="space-y-3">
                <InfoRow label="Commission paritaire" value="—" />
                <InfoRow label="Dernier index appliqué" value="—" />
                <InfoRow label="Prime de fin d'année" value="—" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="text-slate-400 mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-900">{value || "—"}</p>
      </div>
    </div>
  );
}
