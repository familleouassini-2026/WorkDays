"use client";

import { useState } from "react";
import projectHealth from "@/data/project-health.json";

type Tab = "architecture" | "traceability" | "gaps";

interface ArchitectureFile {
  file: string;
  title: string;
  description: string;
  type: string;
  reason: string;
}

interface Feature {
  id: string;
  name: string;
  status: string;
  spec: string;
  code: string[];
  accessOrigin: string | null;
  notes: string;
}

interface Gap {
  severity: string;
  feature: string;
  description: string;
  impact: string;
  accessQuery: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  steering: { bg: "bg-violet-100", text: "text-violet-700" },
  spec: { bg: "bg-blue-100", text: "text-blue-700" },
  documentation: { bg: "bg-green-100", text: "text-green-700" },
  reference: { bg: "bg-gray-100", text: "text-gray-700" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  implemented: { label: "Implementé", icon: "\u2705", bg: "bg-green-100", text: "text-green-700" },
  partial: { label: "Partiel", icon: "\u26a0\ufe0f", bg: "bg-orange-100", text: "text-orange-700" },
  missing: { label: "Manquant", icon: "\u274c", bg: "bg-red-100", text: "text-red-700" },
};

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  high: { label: "Haute", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  medium: { label: "Moyenne", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  low: { label: "Basse", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

const CATEGORY_LABELS: Record<string, string> = {
  steering: "Steering (principes permanents)",
  specs: "Spécifications",
  docs: "Documentation",
  reference: "Référence",
};

function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_COLORS[type] || TYPE_COLORS.reference;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon} {config.label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function ArchitectureTab() {
  const { architecture } = projectHealth;
  const categories = Object.entries(architecture) as [string, ArchitectureFile[]][];

  return (
    <div className="space-y-8">
      {categories.map(([category, files]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <div key={file.file} className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-slate-900">{file.title}</h4>
                  <TypeBadge type={file.type} />
                </div>
                <p className="text-sm text-slate-600">{file.description}</p>
                <p className="text-xs text-slate-400 font-mono">{file.file}</p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    <span className="font-medium">Pourquoi :</span> {file.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TraceabilityTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const features = projectHealth.features as Feature[];

  const implemented = features.filter((f) => f.status === "implemented").length;
  const partial = features.filter((f) => f.status === "partial").length;
  const missing = features.filter((f) => f.status === "missing").length;

  return (
    <div className="space-y-4">
      {/* Counters */}
      <div className="flex flex-wrap gap-4">
        <div className="card px-4 py-2 flex items-center gap-2">
          <span className="text-green-600 font-bold">{implemented}</span>
          <span className="text-sm text-slate-600">implémentés</span>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2">
          <span className="text-orange-600 font-bold">{partial}</span>
          <span className="text-sm text-slate-600">partiels</span>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2">
          <span className="text-red-600 font-bold">{missing}</span>
          <span className="text-sm text-slate-600">manquants</span>
        </div>
      </div>

      {/* Features table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Spec</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">Code</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">Origine Access</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                isExpanded={expandedId === feature.id}
                onToggle={() => setExpandedId(expandedId === feature.id ? null : feature.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureRow({
  feature,
  isExpanded,
  onToggle,
}: {
  feature: Feature;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">{isExpanded ? "▼" : "▶"}</span>
            <span className="text-sm font-medium text-slate-900">{feature.name}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={feature.status} />
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <span className="text-xs text-slate-500 font-mono truncate block max-w-[200px]">
            {feature.spec}
          </span>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="text-xs text-slate-500">
            {feature.code.length > 0 ? `${feature.code.length} fichier(s)` : "-"}
          </span>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="text-xs text-slate-500 font-mono truncate block max-w-[200px]">
            {feature.accessOrigin || "-"}
          </span>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="px-4 py-4">
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-slate-700">Notes :</span>{" "}
                <span className="text-slate-600">{feature.notes}</span>
              </div>
              {feature.code.length > 0 && (
                <div>
                  <span className="font-medium text-slate-700">Fichiers :</span>
                  <ul className="mt-1 space-y-0.5">
                    {feature.code.map((file) => (
                      <li key={file} className="text-xs text-slate-500 font-mono pl-2">
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {feature.accessOrigin && (
                <div>
                  <span className="font-medium text-slate-700">Origine Access :</span>{" "}
                  <span className="text-xs text-slate-500 font-mono">{feature.accessOrigin}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function GapsTab() {
  const gaps = projectHealth.gaps as Gap[];
  const features = projectHealth.features as Feature[];

  const highCount = gaps.filter((g) => g.severity === "high").length;
  const mediumCount = gaps.filter((g) => g.severity === "medium").length;
  const lowCount = gaps.filter((g) => g.severity === "low").length;

  const getFeatureName = (featureId: string) => {
    const feature = features.find((f) => f.id === featureId);
    return feature?.name || featureId;
  };

  return (
    <div className="space-y-4">
      {/* Severity counters */}
      <div className="flex flex-wrap gap-4">
        <div className="card px-4 py-2 flex items-center gap-2">
          <span className="text-red-600 font-bold">{highCount}</span>
          <span className="text-sm text-slate-600">haute priorité</span>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2">
          <span className="text-orange-600 font-bold">{mediumCount}</span>
          <span className="text-sm text-slate-600">moyenne priorité</span>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2">
          <span className="text-gray-600 font-bold">{lowCount}</span>
          <span className="text-sm text-slate-600">basse priorité</span>
        </div>
      </div>

      {/* Gap cards */}
      <div className="space-y-3">
        {gaps.map((gap, index) => {
          const config = SEVERITY_CONFIG[gap.severity] || SEVERITY_CONFIG.low;
          return (
            <div
              key={index}
              className={`card p-4 border ${config.border} ${config.bg}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={gap.severity} />
                    <span className="text-sm font-medium text-slate-900">
                      {getFeatureName(gap.feature)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{gap.description}</p>
                  <div className="pt-2 space-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">Impact :</span> {gap.impact}
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-medium">Query Access :</span>{" "}
                      <span className="font-mono">{gap.accessQuery}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProjectHealthPage() {
  const [activeTab, setActiveTab] = useState<Tab>("architecture");

  const tabs: { id: Tab; label: string }[] = [
    { id: "architecture", label: "Architecture" },
    { id: "traceability", label: "Traçabilité" },
    { id: "gaps", label: "Gaps & Priorités" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Santé du projet</h1>
        <p className="text-slate-500 mt-1">
          Traçabilité bidirectionnelle et état des fonctionnalités
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Dernière mise à jour : {projectHealth.lastUpdated}
        </p>
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
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "architecture" && <ArchitectureTab />}
      {activeTab === "traceability" && <TraceabilityTab />}
      {activeTab === "gaps" && <GapsTab />}
    </div>
  );
}
