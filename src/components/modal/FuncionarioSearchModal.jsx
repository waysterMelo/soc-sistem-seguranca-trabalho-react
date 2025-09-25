import React, { useState, useEffect } from 'react';
import { X, Search, User, Building, Briefcase, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import funcionariosService from '../../api/services/cadastros/funcionariosServices.js';

const FuncionarioSearchModal = ({ isOpen, onClose, onSelect, empresaId, setorId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    // Função para buscar funcionários
    const searchFuncionarios = async (page = 0, search = '') => {
        setLoading(true);
        setError('');

        try {
            let response;

            // Se temos setorId, usar o endpoint específico
            if (setorId) {
                const params = {
                    page,
                    size: 10,
                    sort: 'nome,asc'
                };

                // Adicionar termo de busca se fornecido
                if (search.trim()) {
                    params.search = search.trim();
                }

                // Usar endpoint específico do setor: /api/funcionarios/setor/{setorId}
                response = await funcionariosService.buscarFuncionariosPorSetor(setorId, params);
            } else {
                // Usar busca geral como fallback
                const params = {
                    page,
                    size: 10,
                    sort: 'nome,asc'
                };

                if (search.trim()) {
                    params.search = search.trim();
                }

                if (empresaId) {
                    params.empresaId = empresaId;
                }

                response = await funcionariosService.buscarFuncionarios(params);
            }

            // Verificar se a resposta tem a estrutura esperada
            if (response && response.content) {
                setFuncionarios(response.content);
                setCurrentPage(response.number || 0);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            } else if (Array.isArray(response)) {
                // Caso a API retorne array direto
                setFuncionarios(response);
                setTotalPages(1);
                setTotalElements(response.length);
            } else {
                setFuncionarios([]);
                setTotalPages(0);
                setTotalElements(0);
            }

            setHasSearched(true);
        } catch (err) {
            console.error('Erro ao buscar funcionários:', err);
            setError('Erro ao buscar funcionários. Tente novamente.');
            setFuncionarios([]);
        } finally {
            setLoading(false);
        }
    };

    // Busca inicial quando o modal é aberto
    useEffect(() => {
        if (isOpen && setorId) {
            searchFuncionarios(0, '');
            setSearchTerm('');
            setHasSearched(false);
        }
    }, [isOpen, setorId]);

    // Função para buscar com termo
    const handleSearch = () => {
        setCurrentPage(0);
        searchFuncionarios(0, searchTerm);
    };

    // Função para mudança de página
    const handlePageChange = (newPage) => {
        searchFuncionarios(newPage, searchTerm);
    };

    // Função para selecionar funcionário
    const handleSelect = (funcionario) => {
        onSelect(funcionario);
        onClose();
    };

    // Função para formatar CPF
    const formatCPF = (cpf) => {
        if (!cpf) return '';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    // Função para formatar data
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Função para formatar telefone
    const formatPhone = (phone) => {
        if (!phone) return '';
        return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <User className="text-blue-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Selecionar Funcionário {setorId ? '- Setor Filtrado' : ''}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por nome, CPF, matrícula ou função..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Search size={18} />
                            Buscar
                        </button>
                    </div>
                    
                    {hasSearched && (
                        <p className="text-sm text-gray-600 mt-2">
                            {totalElements > 0 
                                ? `${totalElements} funcionário(s) encontrado(s)`
                                : 'Nenhum funcionário encontrado'
                            }
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Carregando funcionários...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="text-red-500 text-4xl mb-4">⚠️</div>
                            <p className="text-red-600 font-medium">{error}</p>
                            <button
                                onClick={() => searchFuncionarios(currentPage, searchTerm)}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    ) : funcionarios.length === 0 && hasSearched ? (
                        <div className="text-center py-8">
                            <User className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                Nenhum funcionário encontrado
                            </h3>
                            <p className="text-gray-500">
                                Tente ajustar os termos de busca ou verifique se há funcionários cadastrados.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {funcionarios.map((funcionario) => (
                                <div
                                    key={funcionario.id}
                                    onClick={() => handleSelect(funcionario)}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between">
                                        {/* Informações principais */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="text-blue-600" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {funcionario.nome} {funcionario.sobrenome}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        CPF: {formatCPF(funcionario.cpf)} | Matrícula: {funcionario.matricula}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Grid de informações */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {/* Empresa */}
                                                {funcionario.empresa && (
                                                    <div className="flex items-center gap-2">
                                                        <Building className="text-gray-400" size={16} />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Empresa</p>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {funcionario.empresa.nomeFantasia || funcionario.empresa.razaoSocial}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Função */}
                                                {funcionario.funcao && (
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="text-gray-400" size={16} />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Função</p>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {funcionario.funcao.nome}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Data de Admissão */}
                                                {funcionario.dataAdmissao && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="text-gray-400" size={16} />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Admissão</p>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {formatDate(funcionario.dataAdmissao)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Setor */}
                                                {funcionario.setor && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="text-gray-400" size={16} />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Setor</p>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {funcionario.setor.nome}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Telefone */}
                                                {funcionario.telefone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="text-gray-400" size={16} />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Telefone</p>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {formatPhone(funcionario.telefone)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Email */}
                                                {funcionario.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="text-gray-400" size={16} />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Email</p>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {funcionario.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="ml-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                funcionario.status === 'ATIVO' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {funcionario.status || 'ATIVO'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Página {currentPage + 1} de {totalPages} ({totalElements} total)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            
                            {/* Números das páginas */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = Math.max(0, Math.min(currentPage - 2 + i, totalPages - 1));
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm border rounded-md ${
                                            page === currentPage
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page + 1}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FuncionarioSearchModal;