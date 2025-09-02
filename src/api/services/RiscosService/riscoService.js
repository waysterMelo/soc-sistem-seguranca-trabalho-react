import apiService from "../../apiService";

class RiscoService {
    constructor() {
        this.api = apiService;
        this.endpoint = "/riscos-catalogo";
    }

    // Busca riscos filtrando por ID do setor
    async getBySetorId(setorId) {
        try {
            const params = { setorId: setorId };
            const response = await this.api.get(this.endpoint, { params });
            // A API pode retornar a lista dentro de 'content' ou diretamente
            return response.data.content || response.data;
        } catch (error)
        {
            console.error(`Erro ao buscar riscos para o setor ${setorId}:`, error);
            throw error;
        }
    }
}

export default new RiscoService();