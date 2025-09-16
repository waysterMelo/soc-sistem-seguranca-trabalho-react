import apiService from "../../apiService";

class AparelhoService {
    constructor() {
        this.api = apiService;
        this.endpoint = "/aparelhos";
    }

    async getAll(pageable, search = "") {
        try {
            const params = {
                page: pageable.page,
                size: pageable.size,
                sort: pageable.sort,
                search: search,
            };
            const response = await this.api.get(this.endpoint, { params });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar aparelhos:", error);
            throw error;
        }
    }

    async getAparelhosModal (search = "", page =0, size = 10){
        try {
            const params = {
                page,
                size,
                sorte: 'descricao,asc',
                search
            };
         const response = await this.api.get(this.endpoint, { params });   
         return response.data;
        }catch (error) {
        console.error("Erro ao buscar aparelhos:", error);
        throw error;
        }
    }

    async getById(id) {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar aparelho com ID ${id}:`, error);
            throw error;
        }
    }

    async create(aparelhoData, certificadoFile) {
        // O backend espera 'multipart/form-data', então criamos um FormData
        const formData = new FormData();

        // 1. Adiciona os dados do aparelho como um JSON Blob
        formData.append('aparelho', new Blob([JSON.stringify(aparelhoData)], {
            type: 'application/json'
        }));

        // 2. Adiciona o arquivo do certificado, se ele existir
        if (certificadoFile) {
            formData.append('certificado', certificadoFile);
        }

        try {
            const response = await this.api.post(this.endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao criar aparelho:", error);
            throw error;
        }
    }

    async update(id, aparelhoData, certificadoFile) {
        const formData = new FormData();

        formData.append('aparelho', new Blob([JSON.stringify(aparelhoData)], {
            type: 'application/json'
        }));

        if (certificadoFile) {
            formData.append('certificado', certificadoFile);
        }

        try {
            const response = await this.api.put(`${this.endpoint}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar aparelho com ID ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.api.delete(`${this.endpoint}/${id}`);
        } catch (error) {
            console.error(`Erro ao deletar aparelho com ID ${id}:`, error);
            throw error;
        }
    }
}

export default new AparelhoService();