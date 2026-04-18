export type ProjectType = "prototype" | "slide_deck" | "template" | "other";
export type PrototypeMode = "wireframe" | "high_fidelity";
export type OrgRole = "design"|"engineering"|"product"|"sales"|"data"|"marketing"|"other";

export interface Organization {
  id:string; name:string; slug:string; logo_url:string|null;
  created_at:string; updated_at:string;
}
export interface OrgMember {
  id:string; org_id:string; user_id:string;
  role:"owner"|"admin"|"member"; job_roles:OrgRole[];
  tutorial_completed:boolean; created_at:string;
}
export interface DesignSystem {
  id:string; org_id:string; name:string; description:string|null;
  brand_colors:Record<string,string>|null; typography:Record<string,string>|null;
  component_patterns:Record<string,unknown>|null; is_active:boolean;
  created_by:string; created_at:string; updated_at:string;
}
export interface ProjectTemplate {
  id:string; org_id:string; name:string; description:string|null;
  project_type:ProjectType; thumbnail_url:string|null;
  config:Record<string,unknown>; created_by:string;
  created_at:string; updated_at:string;
}
export interface Project {
  id:string; org_id:string; owner_id:string; name:string;
  project_type:ProjectType; prototype_mode:PrototypeMode|null;
  use_speaker_notes:boolean; template_id:string|null;
  design_system_id:string|null; visibility:"org"|"private"|"public";
  status:"draft"|"active"|"archived"; thumbnail_url:string|null;
  meta:Record<string,unknown>; created_at:string; updated_at:string;
}
export type CreateProjectInput = Pick<Project,"name"|"project_type"|"prototype_mode"|"use_speaker_notes"|"template_id"|"design_system_id"|"visibility">;
export type CreateDesignSystemInput = Pick<DesignSystem,"name"|"description"|"brand_colors"|"typography"|"component_patterns">;
export type CreateTemplateInput = Pick<ProjectTemplate,"name"|"description"|"project_type"|"config">;
export interface ApiSuccess<T> { data:T; error:null; }
export interface ApiError { data:null; error:string; }
export type ApiResponse<T> = ApiSuccess<T>|ApiError;
