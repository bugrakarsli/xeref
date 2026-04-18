"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DesignSystem } from "@/types";

export function useDesignSystems(orgId:string|null) {
  const [designSystems,setDesignSystems] = useState<DesignSystem[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);

  useEffect(()=>{
    if (!orgId) return;
    const supabase = createClient();
    async function fetch() {
      setLoading(true);
      const {data,error:err} = await supabase.from("design_systems").select("*").eq("org_id",orgId).order("created_at",{ascending:false});
      if (err) setError(err.message); else setDesignSystems(data??[]);
      setLoading(false);
    }
    fetch();
    const channel = supabase.channel("ds_"+orgId)
      .on("postgres_changes",{event:"*",schema:"public",table:"design_systems",filter:`org_id=eq.${orgId}`},()=>fetch())
      .subscribe();
    return ()=>{ supabase.removeChannel(channel); };
  },[orgId]);

  return {designSystems,loading,error};
}
