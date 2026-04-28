import { DeveloperAuthProvider } from "@/components/providers/developer-auth-provider";

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DeveloperAuthProvider>{children}</DeveloperAuthProvider>;
}
