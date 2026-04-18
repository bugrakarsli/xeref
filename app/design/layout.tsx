import type { Metadata } from "next";
import "./design.css";

export const metadata: Metadata = {
  title: "Xeref Design",
  description: "Create branded designs, prototypes, and slide decks — powered by XerefAI.",
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <div className="design-scope">{children}</div>;
}
