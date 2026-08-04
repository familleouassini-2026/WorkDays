"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ChevronDown, ChevronRight, Users, Settings2 } from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  job_title: string | null;
  manager_id: number | null;
  sector_id: number | null;
  is_inactive: boolean;
  sectors?: { name: string } | null;
}

interface TreeNode {
  employee: Employee;
  children: TreeNode[];
}

function buildTree(employees: Employee[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  // Create nodes
  for (const emp of employees) {
    map.set(emp.id, { employee: emp, children: [] });
  }

  // Build hierarchy
  for (const emp of employees) {
    const node = map.get(emp.id)!;
    if (emp.manager_id && map.has(emp.manager_id)) {
      map.get(emp.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children alphabetically
  function sortChildren(nodes: TreeNode[]) {
    nodes.sort((a, b) =>
      a.employee.last_name.localeCompare(b.employee.last_name)
    );
    for (const node of nodes) {
      sortChildren(node.children);
    }
  }
  sortChildren(roots);

  return roots;
}

function countDirectReports(empId: number, employees: Employee[]): number {
  return employees.filter((e) => e.manager_id === empId).length;
}

function TreeNodeComponent({
  node,
  level,
  employees,
}: {
  node: TreeNode;
  level: number;
  employees: Employee[];
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;
  const directReports = countDirectReports(node.employee.id, employees);

  return (
    <div className="relative">
      {/* Connection line from parent */}
      {level > 0 && (
        <div
          className="absolute top-0 left-[-20px] w-[20px] h-[20px] border-l-2 border-b-2 border-slate-300 rounded-bl-lg"
          style={{ top: "0px" }}
        />
      )}

      <div className="flex items-start gap-2">
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 p-0.5 rounded hover:bg-slate-100 text-slate-500 flex-shrink-0"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-5 flex-shrink-0" />
        )}

        {/* Employee card */}
        <Link
          href={`/employees/${node.employee.id}`}
          className={`flex items-center gap-3 px-3 py-2 border rounded-lg shadow-sm hover:shadow transition-all group flex-1 min-w-0 ${
            node.employee.is_inactive
              ? "bg-slate-50 border-slate-200 opacity-60"
              : "bg-white border-slate-200 hover:border-blue-300"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              node.employee.is_inactive ? "bg-slate-200" : "bg-blue-100"
            }`}
          >
            <span
              className={`text-xs font-medium ${
                node.employee.is_inactive ? "text-slate-500" : "text-blue-700"
              }`}
            >
              {node.employee.first_name?.[0]}
              {node.employee.last_name?.[0]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium truncate ${
                node.employee.is_inactive
                  ? "text-slate-500"
                  : "text-slate-900 group-hover:text-blue-700"
              }`}
            >
              {node.employee.last_name} {node.employee.first_name}
              {node.employee.is_inactive && (
                <span className="ml-1 text-xs text-slate-400 font-normal">
                  (inactif)
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {node.employee.job_title || "Pas de fonction"}
              {node.employee.sectors?.name
                ? ` - ${node.employee.sectors.name}`
                : ""}
            </p>
          </div>
          {directReports > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {directReports}
            </span>
          )}
        </Link>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="ml-7 pl-5 mt-1 space-y-1 border-l-2 border-slate-200">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.employee.id}
              node={child}
              level={level + 1}
              employees={employees}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganigrammePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: activeData, error: fetchErr } = await supabase
      .from("employees")
      .select(
        "id, first_name, last_name, job_title, manager_id, sector_id, is_inactive, sectors(name)"
      )
      .eq("is_inactive", false)
      .order("last_name");

    if (fetchErr) {
      setError("Impossible de charger les donnees.");
      setLoading(false);
      return;
    }

    const activeEmployees = (activeData || []) as unknown as Employee[];

    // Collect manager_ids that reference inactive employees (not in active set)
    const activeIds = new Set(activeEmployees.map((e) => e.id));
    const missingManagerIds = new Set<number>();
    for (const emp of activeEmployees) {
      if (emp.manager_id && !activeIds.has(emp.manager_id)) {
        missingManagerIds.add(emp.manager_id);
      }
    }

    // Fetch inactive managers so their children don't become orphan roots
    let allEmployees = activeEmployees;
    if (missingManagerIds.size > 0) {
      const { data: inactiveManagers } = await supabase
        .from("employees")
        .select(
          "id, first_name, last_name, job_title, manager_id, sector_id, is_inactive, sectors(name)"
        )
        .in("id", Array.from(missingManagerIds));

      if (inactiveManagers && inactiveManagers.length > 0) {
        allEmployees = [
          ...activeEmployees,
          ...(inactiveManagers as unknown as Employee[]),
        ];
      }
    }

    setEmployees(allEmployees);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleManagerChange(empId: number, managerId: number | null) {
    setSaving(empId);
    const supabase = createClient();
    const { error: updateErr } = await supabase
      .from("employees")
      .update({ manager_id: managerId })
      .eq("id", empId);

    if (updateErr) {
      console.error("Failed to update manager:", updateErr);
    } else {
      // Update local state immediately
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === empId ? { ...e, manager_id: managerId } : e
        )
      );
    }
    setSaving(null);
  }

  const tree = buildTree(employees);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/employees"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au personnel
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Organigramme</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Vue hierarchique de l&apos;organisation (
            {employees.filter((e) => !e.is_inactive).length} employes actifs)
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            editMode
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          {editMode ? "Terminer la configuration" : "Configurer la hierarchie"}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      ) : editMode ? (
        /* Edit mode: flat list with manager dropdowns */
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              <strong>Mode configuration</strong> : selectionnez un responsable
              pour chaque employe. Les changements sont sauvegardes
              automatiquement.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {employees
              .filter((e) => !e.is_inactive)
              .map((emp) => (
                <div
                  key={emp.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3"
                >
                  {/* Employee info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-700">
                        {emp.first_name?.[0]}
                        {emp.last_name?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {emp.last_name} {emp.first_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {emp.job_title || "Pas de fonction"}
                        {emp.sectors?.name ? ` - ${emp.sectors.name}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Manager dropdown */}
                  <div className="flex items-center gap-2 sm:w-64">
                    <label className="text-xs text-slate-500 shrink-0">
                      Responsable :
                    </label>
                    <select
                      value={emp.manager_id || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          ? Number(e.target.value)
                          : null;
                        handleManagerChange(emp.id, val);
                      }}
                      disabled={saving === emp.id}
                      className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">-- Aucun (racine) --</option>
                      {employees
                        .filter((e) => e.id !== emp.id && !e.is_inactive)
                        .map((other) => (
                          <option key={other.id} value={other.id}>
                            {other.last_name} {other.first_name}
                          </option>
                        ))}
                    </select>
                    {saving === emp.id && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : tree.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            Aucun employe actif ou aucune hierarchie configuree.
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Cliquez sur &quot;Configurer la hierarchie&quot; pour assigner des
            responsables.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 space-y-2">
          {tree.map((node) => (
            <TreeNodeComponent
              key={node.employee.id}
              node={node}
              level={0}
              employees={employees}
            />
          ))}
        </div>
      )}
    </div>
  );
}
