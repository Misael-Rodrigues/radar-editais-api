import type { InsertTender } from "@shared/schema";

/**
 * Interface dos dados retornados pela API do PNCP
 */
interface PNCPContractResponse {
  numeroControlePNCP: string;
  anoCompra: number;
  sequencialCompra: number;
  orgaoEntidade: {
    razaoSocial: string;
  };
  ufSigla: string;
  modalidadeNome: string;
  dataPublicacaoPncp: string;
  valorEstimadoTotal?: number;
  objetoCompra: string;
  linkSistemaOrigem: string;
}

/**
 * Serviço responsável por buscar e transformar os dados do PNCP
 */
export class PNCPService {
  // ✅ Endpoint oficial da API pública do PNCP (retorna JSON)
  private baseUrl = "https://pncp.gov.br/api/pncp/v1/consulta/contratacoes/publicacao";

  /**
   * Busca editais do PNCP com filtros opcionais
   */
  async fetchTenders(params: {
    startDate?: string; // Data inicial (YYYY-MM-DD)
    endDate?: string; // Data final (YYYY-MM-DD)
    state?: string; // UF, ex: "GO"
    keywords?: string; // Palavra-chave, ex: "Topografia"
    status?: string; // Status, ex: "recebendo_proposta"
  }): Promise<InsertTender[]> {
    try {
      const queryParams = new URLSearchParams({
        pagina: "1",
        tamanhoPagina: "20", // Limite de resultados por requisição
      });

      // Adiciona filtros somente se existirem
      if (params.startDate) queryParams.append("dataInicial", params.startDate);
      if (params.endDate) queryParams.append("dataFinal", params.endDate);
      if (params.state) queryParams.append("uf", params.state);
      if (params.keywords) queryParams.append("palavraChave", params.keywords);
      if (params.status) queryParams.append("status", params.status);

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      console.log("🔎 Consultando PNCP:", url);

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        console.error(
          `Erro na API do PNCP: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = await response.json();
      const items: PNCPContractResponse[] = data.data || [];

      return items.map((item) => this.transformPNCPToTender(item));
    } catch (error) {
      console.error("Erro ao buscar dados do PNCP:", error);
      return [];
    }
  }

  /**
   * Converte o formato do PNCP para o formato interno da aplicação
   */
  private transformPNCPToTender(item: PNCPContractResponse): InsertTender {
    const id = `${item.anoCompra}-${item.sequencialCompra}-${item.numeroControlePNCP}`;

    return {
      id,
      title: item.objetoCompra || "Sem título",
      agency: item.orgaoEntidade?.razaoSocial || "Órgão não especificado",
      uf: item.ufSigla || "BR",
      modality: item.modalidadeNome || "Não especificada",
      publicationDate: new Date(item.dataPublicacaoPncp),
      estimatedValue: item.valorEstimadoTotal || null,
      link: item.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${id}`,
      description:
        item.objetoCompra?.substring(0, 200) || "Sem descrição disponível",
    };
  }
}

// Exporta instância pronta para uso no backend
export const pncpService = new PNCPService();
