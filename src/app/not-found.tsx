import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-6">
        <Zap className="h-6 w-6 text-white" />
      </div>
      <p className="text-8xl font-bold text-slate-900 tracking-tight mb-2">404</p>
      <h1 className="text-xl font-semibold text-slate-700 mb-2">Page not found</h1>
      <p className="text-sm text-slate-400 max-w-xs mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button asChild><Link href={ROUTES.home}>Go Home</Link></Button>
        <Button variant="outline" asChild><Link href={ROUTES.dashboard}>Dashboard</Link></Button>
      </div>
    </div>
  );
}
