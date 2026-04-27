"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DesignProject } from "@/types/design";

export function useDesignProjects(orgId: string | null) {
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [loading, setLoading] = useState(orgId !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("design_projects").select("*").eq("org_id", orgId).order("updated_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message); else setProjects(data ?? []);
        setLoading(false);
      });
  }, [orgId, setLoading, setError, setProjects]);

  return { projects, loading, error };
}
