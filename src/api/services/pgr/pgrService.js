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

    async getPgrsByEmpresaId(empresaId, page = 0, size = 5, nome = '') { 
        try {
            const params = { 
                page,
                size,
                sort: 'dataDocumento,desc',
                nome,
            };
            const response = await this.api.get(`${this.endpoint}/empresa/${empresaId}`, { params });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar PGRs para a empresa ${empresaId}:`, error);
            throw error;
        }
    }
}

export default new PgrService();