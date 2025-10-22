import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAZILIAN_STATES, TENDER_MODALITIES, type Filter } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Filtros() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: filter } = useQuery<Filter>({
    queryKey: ["/api/filters/active"],
  });

  useEffect(() => {
    if (filter) {
      setKeywords(filter.keywords || "");
      setSelectedStates(filter.states ? filter.states.split(",") : []);
      setSelectedTypes(filter.tenderTypes ? filter.tenderTypes.split(",") : []);
      setMinValue(filter.minValue?.toString() || "");
      setMaxValue(filter.maxValue?.toString() || "");
    }
  }, [filter]);

  const addState = (stateCode: string) => {
    if (!selectedStates.includes(stateCode)) {
      setSelectedStates([...selectedStates, stateCode]);
    }
  };

  const removeState = (stateCode: string) => {
    setSelectedStates(selectedStates.filter((s) => s !== stateCode));
  };

  const addType = (type: string) => {
    if (!selectedTypes.includes(type)) {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const removeType = (type: string) => {
    setSelectedTypes(selectedTypes.filter((t) => t !== type));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiRequest("POST", "/api/filters", {
        keywords: keywords || undefined,
        states: selectedStates.length > 0 ? selectedStates.join(",") : undefined,
        tenderTypes: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        minValue: minValue ? parseInt(minValue) : undefined,
        maxValue: maxValue ? parseInt(maxValue) : undefined,
        isActive: true,
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/filters"] });

      toast({
        title: "Filtros salvos!",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar filtros",
        description: "Não foi possível salvar suas preferências.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setKeywords("");
    setSelectedStates([]);
    setSelectedTypes([]);
    setMinValue("");
    setMaxValue("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuração de Filtros</h1>
        <p className="text-muted-foreground">
          Personalize seus critérios de busca para receber alertas automáticos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Palavras-chave</CardTitle>
            <CardDescription>
              Termos que devem aparecer nos editais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Palavras-chave</Label>
              <Input
                id="keywords"
                placeholder="Ex: tecnologia, construção, equipamentos..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                data-testid="input-keywords"
              />
              <p className="text-xs text-muted-foreground">
                Separe múltiplos termos com vírgula
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados (UF)</CardTitle>
            <CardDescription>
              {selectedStates.length > 0
                ? `${selectedStates.length} estado${selectedStates.length > 1 ? "s" : ""} selecionado${selectedStates.length > 1 ? "s" : ""}`
                : "Selecione os estados de interesse"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedStates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedStates.map((stateCode) => {
                  const state = BRAZILIAN_STATES.find((s) => s.code === stateCode);
                  return (
                    <Badge
                      key={stateCode}
                      variant="secondary"
                      className="gap-1"
                      data-testid={`badge-state-${stateCode}`}
                    >
                      {state?.code}
                      <button
                        onClick={() => removeState(stateCode)}
                        className="ml-1 hover:text-destructive"
                        data-testid={`button-remove-state-${stateCode}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <Select
              onValueChange={(value) => addState(value)}
              data-testid="select-state"
            >
              <SelectTrigger>
                <SelectValue placeholder="Adicionar estado" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.filter((s) => !selectedStates.includes(s.code)).map(
                  (state) => (
                    <SelectItem
                      key={state.code}
                      value={state.code}
                      data-testid={`option-state-${state.code}`}
                    >
                      {state.name} ({state.code})
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modalidades</CardTitle>
            <CardDescription>
              {selectedTypes.length > 0
                ? `${selectedTypes.length} modalidade${selectedTypes.length > 1 ? "s" : ""} selecionada${selectedTypes.length > 1 ? "s" : ""}`
                : "Tipos de licitação"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="gap-1"
                    data-testid={`badge-type-${type}`}
                  >
                    {type}
                    <button
                      onClick={() => removeType(type)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`button-remove-type-${type}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Select
              onValueChange={(value) => addType(value)}
              data-testid="select-type"
            >
              <SelectTrigger>
                <SelectValue placeholder="Adicionar modalidade" />
              </SelectTrigger>
              <SelectContent>
                {TENDER_MODALITIES.filter((m) => !selectedTypes.includes(m)).map(
                  (modality) => (
                    <SelectItem
                      key={modality}
                      value={modality}
                      data-testid={`option-type-${modality}`}
                    >
                      {modality}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faixa de Valor</CardTitle>
            <CardDescription>
              Valor estimado do edital (R$)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minValue">Valor Mínimo</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  data-testid="input-min-value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">Valor Máximo</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="Sem limite"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  data-testid="input-max-value"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleClear}
          data-testid="button-clear-filters"
        >
          Limpar Tudo
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          data-testid="button-save-filters"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar Filtros"}
        </Button>
      </div>
    </div>
  );
}
