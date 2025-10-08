// src/api/services/dashboardService.js
import apiService from '../apiService';

const dashboardService = {
    getDocumentosStatus: (params) => {
        return apiService.get('/dashboard/documentos-status', { params });
    },
    getEmpresasSummary: () => {
        return apiService.get('/dashboard/empresas-summary');
    },
    getAsosEmitidosSummary: (params) => {
        return apiService.get('/dashboard/asos-emitidos-summary', { params });
    },
    getRiscosSummary: () => {
        return apiService.get('/dashboard/riscos-summary');
    },
     getDocumentosVencidos: (params) => {
        return apiService.get('/dashboard/documentos-vencidos', { params });
    },
};

export default dashboardService;
