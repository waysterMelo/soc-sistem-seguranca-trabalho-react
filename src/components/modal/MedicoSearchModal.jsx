import React, { useState, useEffect } from 'react';
import medicoService from "../../api/services/cadastros/serviceMedicos.js";
import { X, Search, Loader, ChevronLeft, ChevronRight } from 'lucide-react';


const ITEMS_PER_PAGE = 10;


export default function MedicoSearchModal({ isOpen, onClose, onMedicoSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (isOpen) {
            buscarMedicos();
        }
    }, [isOpen]);

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm]);

    const buscarMedicos = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await medicoService.getAll();

            const fetchedMedicos = response.data.content || [];

            // Verificar se fetchedMedicos é um array
            if (!Array.isArray(fetchedMedicos)) {
                console.error("Dados recebidos não são um array:", fetchedMedicos);
                setMedicos([]);
                setTotalPages(1);
                setLoading(false);
                return;
            }

            // Filtrar apenas se houver termo de busca
            const filteredMedicos = searchTerm ? fetchedMedicos.filter(medico => {
                const nome = medico.nome || '';
                const numeroConselho = medico.numeroConselho || '';
                const crm = medico.crm || '';
                const searchLower = searchTerm.toLowerCase();

                return nome.toLowerCase().includes(searchLower) ||
                    numeroConselho.toLowerCase().includes(searchLower) ||
                    crm.toLowerCase().includes(searchLower);
            }) : fetchedMedicos;

            setMedicos(filteredMedicos);
            setTotalPages(Math.ceil(filteredMedicos.length / ITEMS_PER_PAGE));
            setLoading(false);
        } catch (err) {
            console.error("Erro ao buscar médicos: ", err);
            setError('Erro ao buscar médicos. Tente novamente mais tarde.');
            setMedicos([]);
            setTotalPages(1);
            setLoading(false);
        }
    };

    const paginatedMedicos = medicos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
        );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Selecionar Médico Responsável</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="flex">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Buscar por nome ou CRM..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                        </div>
                        <button
                            onClick={buscarMedicos}
                            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                            Buscar
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader size={24} className="animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4">{error}</div>
                    ) : paginatedMedicos.length === 0 ? (
                        <div className="text-center text-gray-500 p-4">
                            {searchTerm
                                ? "Nenhum médico encontrado com os critérios informados."
                                : "Digite um termo para buscar médicos ou clique em Buscar para ver todos."}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {paginatedMedicos.map(medico => (
                                <div
                                    key={medico.id}
                                    onClick={() => onMedicoSelect(medico)}
                                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="font-medium text-gray-900">
                                        {`${medico.nome}${medico.sobrenome ? ` ${medico.sobrenome}` : ''}`}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        <span className="inline-block mr-3">
                                                CRM: {medico.numeroInscricaoConselho || medico.crm || 'Não informado'}
                                                {medico.estadoConselho && `-${medico.estadoConselho}`}
                                        </span>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé com Paginação */}
                {paginatedMedicos.length > 0 && (
                    <div className="p-4 border-t flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} className="mr-1" />
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próximo
                                <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes fade-in-scale {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}