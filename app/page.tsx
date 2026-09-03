import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardClient } from "./DashboardClient";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of implementation reviews performed in this browser."
      />
      <div className="p-6 md:p-10 max-w-2xl">
        <DashboardClient />
      </div>
    </>
  );
}
