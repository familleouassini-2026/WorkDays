"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ChevronDown, ChevronRight, Users } from "lucide-react";

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

function TreeNodeComponent({
  node,
  level,
}: {
  node: TreeNode;
  level: number;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;

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
          className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 hover:shadow transition-all group flex-1 min-w-0"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-blue-700">
              {node.employee.first_name?.[0]}
              {node.employee.last_name?.[0]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">
              {node.employee.last_name} {node.employee.first_name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {node.employee.job_title || "Pas de fonction"}
              {node.employee.sectors?.name
                ? ` - ${node.employee.sectors.name}`
                : ""}
            </p>
          </div>
          {hasChildren && (
            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {node.children.length}
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

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from("employees")
        .select("id, first_name, last_name, job_title, manager_id, sector_id, is_inactive, sectors(name)")
        .eq("is_inactive", false)
        .order("last_name");

      if (fetchErr) {
        setError("Impossible de charger les donnees.");
      } else if (data) {
        setEmployees(data as unknown as Employee[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

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
            Vue hierarchique de l&apos;organisation ({employees.length} employes actifs)
          </p>
        </div>
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
      ) : tree.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            Aucun employe actif ou aucune hierarchie configuree.
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Assignez des responsables hierarchiques dans les fiches employes pour construire l&apos;organigramme.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 space-y-2">
          {tree.map((node) => (
            <TreeNodeComponent key={node.employee.id} node={node} level={0} />
          ))}
        </div>
      )}
    </div>
  );
}
