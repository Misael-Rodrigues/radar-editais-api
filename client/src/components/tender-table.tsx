import { useState } from "react";
import type { Tender } from "@shared/schema";
import { ExternalLink, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TenderTableProps {
  tenders: Tender[];
  selectedTenders: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
}

type SortField = "publicationDate" | "estimatedValue" | "agency" | "uf";
type SortDirection = "asc" | "desc";

export function TenderTable({
  tenders,
  selectedTenders,
  onSelectionChange,
  isLoading = false,
}: TenderTableProps) {
  const [sortField, setSortField] = useState<SortField>("publicationDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedTenders = [...tenders].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    
    switch (sortField) {
      case "publicationDate":
        return direction * (new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime());
      case "estimatedValue":
        return direction * ((a.estimatedValue || 0) - (b.estimatedValue || 0));
      case "agency":
        return direction * a.agency.localeCompare(b.agency);
      case "uf":
        return direction * a.uf.localeCompare(b.uf);
      default:
        return 0;
    }
  });

  const toggleTender = (id: string) => {
    if (selectedTenders.includes(id)) {
      onSelectionChange(selectedTenders.filter((tid) => tid !== id));
    } else {
      onSelectionChange([...selectedTenders, id]);
    }
  };

  const toggleAll = () => {
    if (selectedTenders.length === tenders.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tenders.map((t) => t.id));
    }
  };

  const getModalityColor = (modality: string) => {
    if (modality.includes("Pregão")) return "bg-primary/10 text-primary border-primary/20";
    if (modality.includes("Concorrência")) return "bg-success/10 text-success border-success/20";
    if (modality.includes("Dispensa")) return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    return "bg-muted text-muted-foreground border-border";
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ExternalLink className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Nenhum edital encontrado</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Ajuste seus filtros ou aguarde a próxima atualização automática para visualizar novos editais.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedTenders.length === tenders.length && tenders.length > 0}
                onCheckedChange={toggleAll}
                data-testid="checkbox-select-all"
              />
            </TableHead>
            <TableHead className="min-w-[300px]">Título</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("agency")}
                className="h-8 px-2 hover-elevate"
                data-testid="button-sort-agency"
              >
                Órgão
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("uf")}
                className="h-8 px-2 hover-elevate"
                data-testid="button-sort-uf"
              >
                UF
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Modalidade</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("publicationDate")}
                className="h-8 px-2 hover-elevate"
                data-testid="button-sort-date"
              >
                Publicação
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("estimatedValue")}
                className="h-8 px-2 hover-elevate"
                data-testid="button-sort-value"
              >
                Valor Estimado
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTenders.map((tender, index) => (
            <TableRow
              key={tender.id}
              className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
              data-testid={`row-tender-${tender.id}`}
            >
              <TableCell>
                <Checkbox
                  checked={selectedTenders.includes(tender.id)}
                  onCheckedChange={() => toggleTender(tender.id)}
                  data-testid={`checkbox-tender-${tender.id}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="max-w-md">
                  <div className="truncate text-sm">{tender.title}</div>
                  {tender.description && (
                    <div className="truncate text-xs text-muted-foreground">
                      {tender.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">{tender.agency}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {tender.uf}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`text-xs ${getModalityColor(tender.modality)}`}>
                  {tender.modality}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {format(new Date(tender.publicationDate), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatCurrency(tender.estimatedValue)}
              </TableCell>
              <TableCell>
                <a
                  href={tender.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-tender-${tender.id}`}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
