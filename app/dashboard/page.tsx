import { Card } from "@/app/ui/componentes/Card";
import { ProgressBar } from "@/app/ui/componentes/ProgressBar";
import { auth } from "@/auth";
import { Text, Metric, Flex } from "@tremor/react";
import React, { Suspense } from "react";
import { RevenueChartSkeleton } from "../ui/skeletons";
import { revenue } from "../lib/placeholder-data";
import RevenueChart from "../ui/dashboard/revenue-chart";

export default async function page() {
  const session = await auth();

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-center">
        {/* Cada tarjeta */}
        <Card className="flex-shrink-0 max-w-xs w-full sm:max-w-md lg:max-w-xs">
          <Text>Totales</Text>
          <p className="text-center text-gray-400">Tickets</p>
          <Metric>13</Metric>
        </Card>
        <Card className="flex-shrink-0 max-w-xs w-full sm:max-w-md lg:max-w-xs">
          <Text>Pendientes</Text>
          <p className="text-center text-gray-400">Tickets</p>
          <Metric>7</Metric>
        </Card>
        <Card className="flex-shrink-0 max-w-xs w-full sm:max-w-md lg:max-w-xs">
          <Text>Atendido</Text>
          <p className="text-center text-gray-400">Tickets</p>
          <Metric>5</Metric>
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart revenue={revenue} />
        </Suspense>
      </div>
      <div>{<pre>{JSON.stringify(session, null, 2)}</pre>}</div>
    </>
  );
}
