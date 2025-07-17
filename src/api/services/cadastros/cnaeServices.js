import api from "../../apiService.js";


const getAllCnaes = () => {
    return api.get("/cnaes");
}

export const cnaeService = {
    getAll: getAllCnaes,
}

export default cnaeService;