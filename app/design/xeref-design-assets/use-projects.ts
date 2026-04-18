"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";

export function useProjects(orgId:string|null) {
  const [projects,setProjects] = useState<Project[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  useEffect(()=>{
    if (!orgId) return;
    const supabase = createClient();
    supabase.from("projects").select("*").eq("org_id",orgId).order("updated_at",{ascending:false}).then(({data,error:err})=>{
      if (err) setError(err.message); else setProjects(data??[]);
      setLoading(false);
    });
  },[orgId]);
  return {projects,loading,error};
}
