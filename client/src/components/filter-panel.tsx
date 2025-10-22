import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAZILIAN_STATES, TENDER_MODALITIES } from "@shared/schema";

export interface FilterValues {
  keywords: string;
  states: string[];
  tenderTypes: string[];
  minValue: string;
  maxValue: string;
}

interface FilterPanelProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onSearch: () => void;
  onClear: () => void;
  isSearching?: boolean;
}

export function FilterPanel({
  values,
  onChange,
  onSearch,
  onClear,
  isSearching = false,
}: FilterPanelProps) {
  const [stateSearch, setStateSearch] = useState("");

  const addState = (stateCode: string) => {
    if (!values.states.includes(stateCode)) {
      onChange({ ...values, states: [...values.states, stateCode] });
    }
  };

  const removeState = (stateCode: string) => {
    onChange({ ...values, states: values.states.filter((s) => s !== stateCode) });
  };

  const addTenderType = (type: string) => {
    if (!values.tenderTypes.includes(type)) {
      onChange({ ...values, tenderTypes: [...values.tenderTypes, type] });
    }
  };

  const removeTenderType = (type: string) => {
    onChange({ ...values, tenderTypes: values.tenderTypes.filter((t) => t !== type) });
  };

  const filteredStates = BRAZILIAN_STATES.filter(
    (state) =>
      state.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      state.code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const hasFilters =
    values.keywords ||
    values.states.length > 0 ||
    values.tenderTypes.length > 0 ||
    values.minValue ||
    values.maxValue;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Filtros de Busca</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            data-testid="button-clear-filters"
            className="text-muted-foreground hover-elevate"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["keywords", "states", "types", "value"]}>
        <AccordionItem value="keywords">
          <AccordionTrigger className="text-sm font-medium">
            Palavras-chave
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Label htmlFor="keywords" className="text-sm">
                Pesquisar por termos específicos
              </Label>
              <Input
                id="keywords"
                placeholder="Ex: equipamentos, tecnologia, construção..."
                value={values.keywords}
                onChange={(e) => onChange({ ...values, keywords: e.target.value })}
                data-testid="input-keywords"
              />
              <p className="text-xs text-muted-foreground">
                Separe múltiplos termos com vírgula
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="states">
          <AccordionTrigger className="text-sm font-medium">
            Estados (UF) {values.states.length > 0 && `(${values.states.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Buscar estado..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                data-testid="input-state-search"
              />
              {values.states.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {values.states.map((stateCode) => {
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
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {filteredStates.map((state) => (
                  <button
                    key={state.code}
                    onClick={() => addState(state.code)}
                    disabled={values.states.includes(state.code)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover-elevate active-elevate-2 disabled:opacity-50"
                    data-testid={`button-add-state-${state.code}`}
                  >
                    <span>{state.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {state.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="types">
          <AccordionTrigger className="text-sm font-medium">
            Modalidades {values.tenderTypes.length > 0 && `(${values.tenderTypes.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {values.tenderTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {values.tenderTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="gap-1"
                      data-testid={`badge-type-${type}`}
                    >
                      {type}
                      <button
                        onClick={() => removeTenderType(type)}
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
                onValueChange={(value) => addTenderType(value)}
                data-testid="select-tender-type"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {TENDER_MODALITIES.filter((m) => !values.tenderTypes.includes(m)).map(
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
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="value">
          <AccordionTrigger className="text-sm font-medium">
            Faixa de Valor Estimado
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 pt-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minValue" className="text-sm">
                  Valor Mínimo (R$)
                </Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={values.minValue}
                  onChange={(e) => onChange({ ...values, minValue: e.target.value })}
                  data-testid="input-min-value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue" className="text-sm">
                  Valor Máximo (R$)
                </Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="Sem limite"
                  value={values.maxValue}
                  onChange={(e) => onChange({ ...values, maxValue: e.target.value })}
                  data-testid="input-max-value"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6">
        <Button
          onClick={onSearch}
          disabled={isSearching}
          className="w-full"
          data-testid="button-search-tenders"
        >
          <Search className="mr-2 h-4 w-4" />
          {isSearching ? "Buscando..." : "Buscar Editais"}
        </Button>
      </div>
    </div>
  );
}
