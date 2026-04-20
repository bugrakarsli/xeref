"use client";
import { create } from "zustand";
import type { ProjectType, PrototypeMode, OrgRole } from "@/types/design";

type SidebarTab = ProjectType;
type ModalId = "tutorial" | "createDesignSystem" | "createProject" | "none";
type MainTab = "recent" | "your_designs" | "examples" | "design_systems";

interface State {
  activeTab: SidebarTab;
  prototypeName: string; prototypeMode: PrototypeMode;
  slideDeckName: string; useSpeakerNotes: boolean;
  templateName: string; selectedTemplateId: string | null;
  otherName: string;
  openModal: ModalId; tutorialRoles: OrgRole[];
  accountMenuOpen: boolean;
  mainTab: MainTab;
}

interface Actions {
  setActiveTab: (t: SidebarTab) => void;
  setPrototypeName: (v: string) => void; setPrototypeMode: (v: PrototypeMode) => void;
  setSlideDeckName: (v: string) => void; setUseSpeakerNotes: (v: boolean) => void;
  setTemplateName: (v: string) => void; setSelectedTemplateId: (v: string | null) => void;
  setOtherName: (v: string) => void; resetLauncher: () => void;
  openTutorial: () => void; openCreateDesignSystem: () => void;
  openCreateProject: () => void; closeModal: () => void;
  toggleTutorialRole: (r: OrgRole) => void; completeTutorial: () => void;
  toggleAccountMenu: () => void; closeAccountMenu: () => void;
  setMainTab: (t: MainTab) => void;
}

const defaults: State = {
  activeTab: "prototype", prototypeName: "", prototypeMode: "high_fidelity",
  slideDeckName: "", useSpeakerNotes: false, templateName: "",
  selectedTemplateId: null, otherName: "",
  openModal: "none", tutorialRoles: [],
  accountMenuOpen: false, mainTab: "design_systems",
};

export const useDesignStore = create<State & Actions>((set) => ({
  ...defaults,
  setActiveTab: (activeTab) => set({ activeTab }),
  setPrototypeName: (prototypeName) => set({ prototypeName }),
  setPrototypeMode: (prototypeMode) => set({ prototypeMode }),
  setSlideDeckName: (slideDeckName) => set({ slideDeckName }),
  setUseSpeakerNotes: (useSpeakerNotes) => set({ useSpeakerNotes }),
  setTemplateName: (templateName) => set({ templateName }),
  setSelectedTemplateId: (selectedTemplateId) => set({ selectedTemplateId }),
  setOtherName: (otherName) => set({ otherName }),
  resetLauncher: () => set(defaults),
  openTutorial: () => set({ openModal: "tutorial" }),
  openCreateDesignSystem: () => set({ openModal: "createDesignSystem" }),
  openCreateProject: () => set({ openModal: "createProject" }),
  closeModal: () => set({ openModal: "none" }),
  toggleTutorialRole: (role) => set((s) => ({
    tutorialRoles: s.tutorialRoles.includes(role)
      ? s.tutorialRoles.filter((r) => r !== role)
      : [...s.tutorialRoles, role],
  })),
  completeTutorial: () => set({ openModal: "none", tutorialRoles: [] }),
  toggleAccountMenu: () => set((s) => ({ accountMenuOpen: !s.accountMenuOpen })),
  closeAccountMenu: () => set({ accountMenuOpen: false }),
  setMainTab: (mainTab) => set({ mainTab }),
}));
