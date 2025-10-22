import type { InsertTender } from "@shared/schema";

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

export class PNCPService {
  private baseUrl = "https://pncp.gov.br/api/consulta/v1/contratacoes";

  async fetchTenders(params: {
    startDate: string; // ISO date string
    endDate: string;
    state?: string;
    keywords?: string;
  }): Promise<InsertTender[]> {
    try {
      const queryParams = new URLSearchParams({
        dataInicial: params.startDate,
        dataFinal: params.endDate,
        pagina: "1",
        tamanhoPagina: "500",
      });

      if (params.state) {
        queryParams.append("uf", params.state);
      }

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`PNCP API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const items: PNCPContractResponse[] = data.data || [];

      return items.map((item) => this.transformPNCPToTender(item));
    } catch (error) {
      console.error("Error fetching tenders from PNCP:", error);
      return [];
    }
  }

  async fetchTendersD1(): Promise<InsertTender[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startDate = yesterday.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    return this.fetchTenders({ startDate, endDate });
  }

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
      description: item.objetoCompra?.substring(0, 200),
    };
  }

  // Generate mock tenders for testing
  generateMockTenders(count: number = 10): InsertTender[] {
    const states = ["SP", "RJ", "MG", "BA", "RS", "PR", "SC", "PE", "CE", "PA"];
    const modalities = [
      "Pregão Eletrônico",
      "Pregão Presencial",
      "Concorrência",
      "Dispensa de Licitação",
      "Inexigibilidade",
    ];
    const keywords = [
      "equipamentos de informática",
      "serviços de limpeza e conservação",
      "material de escritório",
      "serviços de tecnologia da informação",
      "obras de engenharia civil",
      "aquisição de veículos",
      "serviços de segurança patrimonial",
      "material hospitalar",
      "serviços de telefonia",
      "mobiliário em geral",
    ];
    const agencies = [
      "Ministério da Saúde",
      "Ministério da Educação",
      "Prefeitura Municipal",
      "Governo do Estado",
      "Tribunal de Justiça",
      "Universidade Federal",
      "Instituto Federal",
      "Secretaria de Administração",
      "DETRAN",
      "Polícia Militar",
    ];

    const tenders: InsertTender[] = [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    for (let i = 0; i < count; i++) {
      const id = `MOCK-${Date.now()}-${i}`;
      const state = states[Math.floor(Math.random() * states.length)];
      const modality = modalities[Math.floor(Math.random() * modalities.length)];
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      const agency = agencies[Math.floor(Math.random() * agencies.length)];
      const value = Math.floor(Math.random() * 1000000) + 10000;

      tenders.push({
        id,
        title: `Edital ${i + 1}/2025 - ${keyword}`,
        agency,
        uf: state,
        modality,
        publicationDate: yesterday,
        estimatedValue: value,
        link: `https://pncp.gov.br/app/editais/${id}`,
        description: `Processo de ${modality.toLowerCase()} para ${keyword.toLowerCase()} no estado de ${state}.`,
      });
    }

    return tenders;
  }
}

export const pncpService = new PNCPService();
