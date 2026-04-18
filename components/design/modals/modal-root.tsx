"use client";
import { useDesignStore } from "@/store/design-store";
import { TutorialModal } from "@/components/design/modals/tutorial-modal";
import { CreateDesignSystemModal } from "@/components/design/modals/create-design-system-modal";

export function ModalRoot() {
  const openModal = useDesignStore((s) => s.openModal);
  return (
    <>
      <TutorialModal open={openModal === "tutorial"} />
      <CreateDesignSystemModal open={openModal === "createDesignSystem"} />
    </>
  );
}
