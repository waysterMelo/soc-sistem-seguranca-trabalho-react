import api from "../../apiService.js";


const getAllMedicos = () => {
    return api.get("/prestadores");
};

/**
 * Busca médicos com filtro
 * @param {string} searchTerm - Termo para filtrar os médicos (nome, CRM, etc)
 * @returns {Promise<AxiosResponse<any>>}
 */

const searchMedicos = (searchTerm) => {
    return api.get(`/prestadores/search?termo=${encodeURIComponent(searchTerm)}`);
};

/**
 * Busca médicos específicos para o PCMSO
 * @param {string} searchTerm - Termo para filtrar os médicos (nome, CRM, etc)
 * @returns {Promise<AxiosResponse<any>>}
 */

const searchMedicosPcmso = (searchTerm) => {
    return api.get(`/prestadores/pcmso?termo=${encodeURIComponent(searchTerm)}`);
};


const getMedicoById = (id) => {
    return api.get(`/prestadores/${id}`);
};

export const medicoService = {
    getAll: getAllMedicos,
    search: searchMedicos,
    searchPcmso: searchMedicosPcmso,
    getById: getMedicoById
};

export default medicoService;