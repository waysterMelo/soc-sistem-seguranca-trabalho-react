import apiService from "../../apiService";

class CboService {
    constructor() {
        this.api = apiService;
    }


    async getAll() {
        try {
            const response = await this.api.get("/cbo");
            // A API pode retornar os dados diretamente ou dentro de uma propriedade 'content'
            return Array.isArray(response.data) ? response.data : response.data.content;
        } catch (error) {
            console.error("Erro ao buscar CBOs:", error);
            throw error;
        }
    }


    async getById(id) {
        try {
            const response = await this.api.get(`/cbo/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar CBO com ID ${id}:`, error);
            throw error;
        }
    }
}

export default new CboService();