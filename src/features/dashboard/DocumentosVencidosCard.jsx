// src/features/dashboard/DocumentosVencidosCard.jsx
import React, { useState, useEffect } from 'react';
import dashboardService from '../../api/services/dashboardService';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // ✅ ADICIONAR

const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        'Válido': 'bg-green-100 text-green-700',
        'Atenção': 'bg-yellow-100 text-yellow-700',
        'Vencido': 'bg-red-100 text-red-700',
    };
    return <span className={`${styles[status] || 'bg-gray-100 text-gray-700'} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>{status}</span>;
};

export default function DocumentosVencidosCard() {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ✅ ADICIONAR Estados de Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 2;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ MUDANÇA: Buscar mais documentos e paginar
                const response = await dashboardService.getDocumentosVencidos({ limit: 20 }); // Buscar mais
                if (Array.isArray(response.data)) {
                    const allDocumentos = response.data;
                    const totalPagesCalc = Math.ceil(allDocumentos.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedDocumentos = allDocumentos.slice(startIndex, startIndex + itemsPerPage);
                    
                    setDocumentos(paginatedDocumentos);
                    setTotalPages(totalPagesCalc);
                }
            } catch (error) {
                toast.error('Não foi possível carregar os documentos vencidos.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage]); // ✅ MUDANÇA: Adicionar dependência

    // ✅ ADICIONAR Função de mudança de página
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <DashboardCard title="Documentos Vencidos">
            {loading ? (
                <div className="text-center text-gray-500 py-10">Carregando...</div>
            ) : (
                <>
                    <div className="space-y-4">
                        {documentos.length > 0 ? documentos.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{doc.tipo}</p>
                                    <p className="text-sm text-gray-500">{doc.responsavel}</p>
                                    <p className="text-xs text-gray-400">
                                        Vencido em: {new Date(doc.dataVencimento).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <StatusBadge status={doc.status} />
                            </div>
                        )) : (
                            <div className="text-center text-green-500 py-10">
                                <span className="text-2xl">🎉</span>
                                <p className="mt-2">Nenhum documento vencido!</p>
                            </div>
                        )}
                    </div>

                    {/* ✅ ADICIONAR Controles de Paginação */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    currentPage === 1
                                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'text-red-600 bg-red-50 hover:bg-red-100'
                                }`}
                            >
                                <ChevronLeft size={14} />
                                Anterior
                            </button>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                                            currentPage === i + 1
                                                ? 'bg-red-600 text-white'
                                                : 'text-red-600 hover:bg-red-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'text-red-600 bg-red-50 hover:bg-red-100'
                                }`}
                            >
                                Próxima
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </DashboardCard>
    );
}
