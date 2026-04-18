"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectTemplate } from "@/types";

export function useTemplates(orgId:string|null) {
  const [templates,setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  useEffect(()=>{
    if (!orgId) return;
    const supabase = createClient();
    supabase.from("project_templates").select("*").eq("org_id",orgId).order("created_at",{ascending:false}).then(({data,error:err})=>{
      if (err) setError(err.message); else setTemplates(data??[]);
      setLoading(false);
    });
  },[orgId]);
  return {templates,loading,error};
}
