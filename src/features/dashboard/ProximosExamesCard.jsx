import React, { useState, useEffect } from 'react';
import dashboardService from '../../api/services/dashboardService';
import { toast } from 'react-toastify';
import { Calendar, User, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

// Componente de Card Genérico do Dashboard
const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

export default function ProximosExamesCard() {
    const [exames, setExames] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // NOVOS estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 2;

    useEffect(() => {
        const fetchExames = async () => {
            try {
                const response = await dashboardService.getAsoProximosVencimentos();
                if (response.data && Array.isArray(response.data)) {
                    // NOVA lógica: calcular paginação dos dados
                    const allExames = response.data;
                    const totalPages = Math.ceil(allExames.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedExames = allExames.slice(startIndex, startIndex + itemsPerPage);
                    
                    setExames(paginatedExames);
                    setTotalPages(totalPages);
                }
            } catch (error) {
                toast.error('Não foi possível carregar os próximos exames.');
            } finally {
                setLoading(false);
            }
        };
        fetchExames();
    }, [currentPage]); // NOVO: recarrega quando muda a página

    // NOVA função: mudança de página
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    return (
        <DashboardCard title="Próximos Exames Periódicos (ASO)">
            {loading ? (
                <div className="text-center text-gray-500 py-10">Carregando...</div>
            ) : exames.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Nenhum exame vencendo nos próximos 30 dias.</div>
            ) : (
                <div className="space-y-4">
                    {exames.map(exame => (
                        <div key={exame.id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium flex items-center gap-2"><User size={14} /> {exame.funcionarioNome}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={14} /> Vence em: {formatDate(exame.dataVencimento)}</p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Atenção
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* NOVA seção: Controles de Paginação */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            currentPage === 1
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
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
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-indigo-600 hover:bg-indigo-50'
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
                                : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                        }`}
                    >
                        Próxima
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}


        </DashboardCard>
    );
}
