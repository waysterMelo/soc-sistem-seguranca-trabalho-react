import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import ltcatService from '../../api/services/ltcat/ltcatService';
import 'react-toastify/dist/ReactToastify.css';

export default function ListarLTCAT() {
    const navigate = useNavigate();
    const [ltcats, setLtcats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchLtcats = async (page) => {
        setLoading(true);
        try {
            const data = await ltcatService.getLtcats(page);
            setLtcats(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error("Erro ao carregar a lista de LTCATs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLtcats(currentPage);
    }, [currentPage]);

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este LTCAT?")) {
            try {
                await ltcatService.deleteLtcat(id);
                toast.success("LTCAT excluído com sucesso!");
                // Se for o último item de uma página, volte para a página anterior
                if (ltcats.length === 1 && currentPage > 0) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchLtcats(currentPage);
                }
            } catch (error) {
                toast.error("Erro ao excluir o LTCAT.");
            }
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Adiciona 1 dia para corrigir o fuso horário
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="container mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Gestão de LTCAT</h1>
                    <button
                        onClick={() => navigate('/seguranca/novo-ltcat')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Novo LTCAT
                    </button>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Empresa / Unidade</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Data Documento</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Data Vencimento</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase">Situação</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-10 text-gray-500">Carregando...</td></tr>
                                ) : ltcats.length > 0 ? (
                                    ltcats.map((ltcat) => (
                                        <tr key={ltcat.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">#{ltcat.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{ltcat.nomeEmpresa} - {ltcat.nomeUnidadeOperacional}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(ltcat.dataDocumento)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(ltcat.dataVencimento)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${ltcat.situacao === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {ltcat.situacao}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <button onClick={() => navigate(`/seguranca/ltcat/editar/${ltcat.id}`)} className="text-blue-600 hover:text-blue-800 p-2 transition-colors" title="Editar"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(ltcat.id)} className="text-red-600 hover:text-red-800 p-2 transition-colors" title="Excluir"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-10 text-gray-500">Nenhum LTCAT encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex justify-between items-center mt-4">
                        <button onClick={handlePrevPage} disabled={currentPage === 0 || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft size={16} /> Anterior
                        </button>
                        <span className="text-sm text-gray-700">Página {totalPages > 0 ? currentPage + 1 : 0} de {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1 || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Próxima <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
