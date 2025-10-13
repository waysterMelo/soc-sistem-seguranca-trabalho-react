import apiService from "../../apiService";

class PgrService {
    constructor() {
        this.api = apiService;
        this.endpoint = "/pgr";
    }

    async savePGR(pgrData, capaFile) {
        try {
            const formData = new FormData();

            formData.append('pgr', new Blob([JSON.stringify(pgrData)], { type: 'application/json' }));

            // Anexa o arquivo de imagem, se existir, como uma parte chamada 'capa'
            if (capaFile) {
                formData.append('capa', capaFile);
            }

            const response = await this.api.post(this.endpoint, formData,);
            return response.data;
        } catch (error) {
            console.error("Erro ao salvar o PGR:", error);
            throw error;
        }
    }

    async getPgrsByEmpresaId(empresaId, page = 0, size = 5, nome = '', status = 'ATIVO', sort, unidadeId = null) {
        try {
            const params = {
                page,
                size,
                sort: sort || 'id,desc',
                nome,
                status: status || undefined,
                unidadeId: unidadeId || undefined,
            };

            // Clean up undefined/null params to avoid sending them in the query
            Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

            const response = await this.api.get(`${this.endpoint}/empresa/${empresaId}`, { params });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar PGRs para a empresa ${empresaId}:`, error);
            throw error;
        }
    }

    async getPgrById(id) {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar PGR com ID ${id}:`, error);
            throw error;
        }
    }

    async updatePgr(id, pgrData, capaFile) {
        try {
            const formData = new FormData();
            formData.append('pgr', new Blob([JSON.stringify(pgrData)], { type: 'application/json' }));
            if (capaFile) {
                formData.append('capa', capaFile);
            }
            const response = await this.api.put(`${this.endpoint}/${id}`, formData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar o PGR ${id}:`, error);
            throw error;
        }
    }
    
    async inactivatePgr(id) {
        try {
            const response = await this.api.patch(`${this.endpoint}/${id}/inactivated`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao inativar o PGR ${id}:`, error);
            throw error;
        }
    }

    async gerarRelatorioHtml(pgrId) {
        try {
            // A resposta esperada é um texto (HTML)
            const response = await this.api.get(`/reports/pgr/html/${pgrId}`, {
                responseType: 'text'
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao gerar relatório HTML para o PGR ${pgrId}:`, error);
            throw error;
        }
    }

}

export default new PgrService();