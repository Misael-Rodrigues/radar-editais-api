import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/stats-cards";
import { FilterPanel, type FilterValues } from "@/components/filter-panel";
import { TenderTable } from "@/components/tender-table";
import type { Tender, SearchTendersParams } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedTenders, setSelectedTenders] = useState<string[]>([]);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterValues, setFilterValues] = useState<FilterValues>({
    keywords: "",
    states: [],
    tenderTypes: [],
    minValue: "",
    maxValue: "",
  });

  const [activeSearch, setActiveSearch] = useState<SearchTendersParams>({});

  // Construct query string from search params
  const tenderUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (activeSearch.keywords) params.append("keywords", activeSearch.keywords);
    if (activeSearch.states) params.append("states", activeSearch.states);
    if (activeSearch.tenderTypes) params.append("tenderTypes", activeSearch.tenderTypes);
    if (activeSearch.minValue !== undefined) params.append("minValue", activeSearch.minValue.toString());
    if (activeSearch.maxValue !== undefined) params.append("maxValue", activeSearch.maxValue.toString());
    if (activeSearch.startDate) params.append("startDate", activeSearch.startDate);
    if (activeSearch.endDate) params.append("endDate", activeSearch.endDate);
    
    const queryString = params.toString();
    return queryString ? `/api/tenders?${queryString}` : "/api/tenders";
  }, [activeSearch]);

  const { data: tenders = [], isLoading } = useQuery<Tender[]>({
    queryKey: [tenderUrl],
  });

  const { data: stats } = useQuery<{
    totalTenders: number;
    totalValue: number;
    activeFilters: number;
    alertsSent: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const handleSearch = () => {
    const searchParams: SearchTendersParams = {};
    
    if (filterValues.keywords) {
      searchParams.keywords = filterValues.keywords;
    }
    
    if (filterValues.states.length > 0) {
      searchParams.states = filterValues.states.join(",");
    }
    
    if (filterValues.tenderTypes.length > 0) {
      searchParams.tenderTypes = filterValues.tenderTypes.join(",");
    }
    
    if (filterValues.minValue) {
      searchParams.minValue = parseInt(filterValues.minValue);
    }
    
    if (filterValues.maxValue) {
      searchParams.maxValue = parseInt(filterValues.maxValue);
    }

    setActiveSearch(searchParams);
    setSelectedTenders([]);
  };

  const handleClearFilters = () => {
    setFilterValues({
      keywords: "",
      states: [],
      tenderTypes: [],
      minValue: "",
      maxValue: "",
    });
    setActiveSearch({});
    setSelectedTenders([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiRequest("POST", "/api/tenders/refresh", {});
      // Invalidate all tender queries (including filtered ones)
      await queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/tenders"),
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Atualização concluída",
        description: "Editais atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na atualização",
        description: "Não foi possível atualizar os editais.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendAlert = async () => {
    if (selectedTenders.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum edital selecionado",
        description: "Selecione pelo menos um edital para enviar alerta.",
      });
      return;
    }

    setIsSendingAlert(true);
    try {
      await apiRequest("POST", "/api/alerts/send", { tenderIds: selectedTenders });
      toast({
        title: "Alerta enviado!",
        description: `Email enviado com ${selectedTenders.length} edita${selectedTenders.length > 1 ? "is" : "l"}.`,
      });
      setSelectedTenders([]);
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar alerta",
        description: "Não foi possível enviar o email. Tente novamente.",
      });
    } finally {
      setIsSendingAlert(false);
    }
  };

  const activeFiltersCount =
    (filterValues.keywords ? 1 : 0) +
    filterValues.states.length +
    filterValues.tenderTypes.length +
    (filterValues.minValue ? 1 : 0) +
    (filterValues.maxValue ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitore editais públicos em tempo real
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh-tenders"
          className="hover-elevate"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar Agora"}
        </Button>
      </div>

      <StatsCards
        totalTenders={stats?.totalTenders || 0}
        totalValue={stats?.totalValue || 0}
        activeFilters={activeFiltersCount}
        alertsSent={stats?.alertsSent || 0}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <FilterPanel
            values={filterValues}
            onChange={setFilterValues}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            isSearching={isLoading}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Resultados {tenders.length > 0 && `(${tenders.length})`}
            </h2>
            {selectedTenders.length > 0 && (
              <Button
                onClick={handleSendAlert}
                disabled={isSendingAlert}
                data-testid="button-send-alert"
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Alerta ({selectedTenders.length})
              </Button>
            )}
          </div>

          <TenderTable
            tenders={tenders}
            selectedTenders={selectedTenders}
            onSelectionChange={setSelectedTenders}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
