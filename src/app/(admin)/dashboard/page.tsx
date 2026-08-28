import { ConnectedUsersChart } from "@/components/dashboard/connected-users-chart";
import { FlashAlert } from "@/components/feedback/flash-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCentralAdminSession } from "@/lib/auth/session";
import { getCollectionCounts } from "@/lib/db/collections";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  await requireCentralAdminSession();
  const counts = await getCollectionCounts();
  const params = await searchParams;

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Resumen operativo del auth central.
        </h1>
      </div>

      <FlashAlert
        success={Array.isArray(params.success) ? params.success[0] : params.success}
        error={Array.isArray(params.error) ? params.error[0] : params.error}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Usuarios totales", value: counts.users },
          { label: "Usuarios activos", value: counts.activeUsers },
          { label: "Usuarios inactivos", value: counts.inactiveUsers },
          { label: "Aplicaciones", value: counts.applications },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Usuarios conectados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sesiones vigentes al momento de cargar el dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-px border bg-border sm:grid-cols-3">
            <div className="bg-background p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Conectados
              </p>
              <p className="text-3xl font-semibold tracking-tight">{counts.connectedUsers}</p>
            </div>
            <div className="bg-background p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Sesiones activas
              </p>
              <p className="text-3xl font-semibold tracking-tight">{counts.activeSessions}</p>
            </div>
            <div className="bg-background p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Cobertura
              </p>
              <p className="text-3xl font-semibold tracking-tight">
                {counts.activeUsers ? Math.round((counts.connectedUsers / counts.activeUsers) * 100) : 0}%
              </p>
            </div>
          </div>

          <ConnectedUsersChart
            connectedUsers={counts.connectedUsers}
            activeSessions={counts.activeSessions}
            activeUsers={counts.activeUsers}
            inactiveUsers={counts.inactiveUsers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
