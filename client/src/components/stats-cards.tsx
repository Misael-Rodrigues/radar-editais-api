import { FileText, DollarSign, Filter as FilterIcon, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  totalTenders: number;
  totalValue: number;
  activeFilters: number;
  alertsSent: number;
}

export function StatsCards({
  totalTenders,
  totalValue,
  activeFilters,
  alertsSent,
}: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
    {
      title: "Editais (D-1)",
      value: totalTenders,
      icon: FileText,
      testId: "stat-total-tenders",
    },
    {
      title: "Valor Total",
      value: formatCurrency(totalValue),
      icon: DollarSign,
      testId: "stat-total-value",
    },
    {
      title: "Filtros Ativos",
      value: activeFilters,
      icon: FilterIcon,
      testId: "stat-active-filters",
    },
    {
      title: "Alertas Enviados",
      value: alertsSent,
      icon: Mail,
      testId: "stat-alerts-sent",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover-elevate transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              data-testid={stat.testId}
            >
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
