import React, { useState, useEffect } from 'react';
import afastamentoService from '../../api/services/medicina/afastamentoService';
import { toast } from 'react-toastify';
import { User, Calendar, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';

// Componente de Card Genérico do Dashboard
const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

export default function AfastamentosRecentesCard() {
    const [afastamentos, setAfastamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para paginação (IGUAL ao ProximosExamesCard)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 2;

    useEffect(() => {
        const fetchAfastamentos = async () => {
            try {
                const response = await afastamentoService.getRecentes();
                if (Array.isArray(response)) {
                    // LÓGICA IGUAL ao ProximosExamesCard
                    const allAfastamentos = response;
                    const totalPages = Math.ceil(allAfastamentos.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedAfastamentos = allAfastamentos.slice(startIndex, startIndex + itemsPerPage);
                    
                    setAfastamentos(paginatedAfastamentos);
                    setTotalPages(totalPages);
                }
            } catch (error) {
                toast.error('Não foi possível carregar os afastamentos recentes.');
            } finally {
                setLoading(false);
            }
        };
        fetchAfastamentos();
    }, [currentPage]); // IGUAL ao ProximosExamesCard

    // Função IGUAL ao ProximosExamesCard
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    return (
        <DashboardCard title="Afastamentos Recentes">
            {loading ? (
                <div className="text-center text-gray-500 py-10">Carregando...</div>
            ) : afastamentos.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Nenhum afastamento recente registrado.</div>
            ) : (
                <div className="space-y-4">
                    {afastamentos.map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                            <div>
                                <p className="font-medium flex items-center gap-2"><User size={14} /> {item.funcionarioNome}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-2"><Briefcase size={14} /> Motivo: {item.motivo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold">{item.totalDias} dia(s)</p>
                                <p className="text-xs text-gray-500">{formatDate(item.dataInicio)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CONTROLES DE PAGINAÇÃO - IGUAL ao ProximosExamesCard */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            currentPage === 1
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-teal-600 bg-teal-50 hover:bg-teal-100'
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
                                        ? 'bg-teal-600 text-white'
                                        : 'text-teal-600 hover:bg-teal-50'
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
                                : 'text-teal-600 bg-teal-50 hover:bg-teal-100'
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
