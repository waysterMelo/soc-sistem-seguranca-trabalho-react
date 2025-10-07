import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronsUpDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { setorService } from '../../api/services/cadastros/serviceSetores.js';

const SetorSearchModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  onSelectMultiple, 
  empresaId, 
  unidadeOperacionalId,
  multiSelect = false 
}) => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSetores, setSelectedSetores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const buscarSetores = useCallback(async () => {
    if (!empresaId) {
      console.warn('SetorSearchModal: Nenhuma empresa selecionada');
      setSetores([]);
      setError("É necessário selecionar uma empresa para buscar setores");
      setTotalElements(0);
      setTotalPages(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parâmetros para a requisição
      const params = {
        empresaId: empresaId,
        unidadeOperacionalId: unidadeOperacionalId,
        page: currentPage - 1,
        size: entriesPerPage
      };

      // Só adiciona nome se houver termo de busca
      if (searchTerm && searchTerm.trim() !== '') {
        params.nome = searchTerm.trim();
      }
      
      // Limpa parâmetros nulos
      Object.keys(params).forEach(key => params[key] == null && delete params[key]);

      // Fazer a requisição
      const response = await setorService.buscarComFiltros(params);

      if (response && response.data && Array.isArray(response.data.content)) {
        setSetores(response.data.content);
        setTotalElements(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);

        if (response.data.content.length === 0) {
          setError("Nenhum setor encontrado para os filtros aplicados.");
        }
      } else {
        console.error('Formato de resposta inesperado ou vazio:', response);
        setSetores([]);
        setTotalElements(0);
        setTotalPages(0);
        setError("Nenhum setor encontrado ou formato de resposta inesperado.");
      }
    } catch (err) {
      console.error('Erro ao buscar setores:', err);
      console.error('Detalhes do erro:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      setError(`Erro ao carregar setores: ${err.message || 'Falha na requisição'}`);
      setSetores([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [empresaId, unidadeOperacionalId, currentPage, entriesPerPage, searchTerm]);

  useEffect(() => {
    if (isOpen && empresaId) {
      buscarSetores();
    } else if (isOpen && !empresaId) {
      setSetores([]);
      setError("Selecione uma empresa antes de buscar setores");
    }
  }, [isOpen, buscarSetores]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setCurrentPage(1);
      setSelectedSetores([]);
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleSelectSetor = useCallback((setor) => {
    if (!multiSelect) {
      onSelect?.(setor);
      onClose();
      return;
    }

    setSelectedSetores(prev => {
      const isSelected = prev.some(s => s.id === setor.id);
      if (isSelected) {
        return prev.filter(s => s.id !== setor.id);
      } else {
        return [...prev, setor];
      }
    });
  }, [multiSelect, onSelect, onClose]);

  const handleConfirmSelection = useCallback(() => {
    onSelectMultiple?.(selectedSetores);
    onClose();
  }, [selectedSetores, onSelectMultiple, onClose]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const handleEntriesPerPageChange = useCallback((e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  if (!isOpen) return null;

  const indexOfFirstEntry = (currentPage - 1) * entriesPerPage + 1;
  const indexOfLastEntry = Math.min(currentPage * entriesPerPage, totalElements);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {multiSelect ? 'Selecionar Setores' : 'Selecionar Setor'}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {empresaId ? `Empresa ID: ${empresaId}` : 'Selecione uma empresa primeiro'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          {/* Barra de pesquisa */}
          <div className="mb-5">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Digite o nome do setor..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                value={searchTerm}
                onChange={handleSearch}
                autoFocus
                aria-label="Buscar setor"
              />
            </div>
            {totalElements > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {totalElements} setor(es) encontrado(s)
                </div>
              </div>
            )}
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Tabela de setores */}
          <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-y-auto max-h-[400px]">
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    {multiSelect && (
                      <th className="w-12 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        <div className="flex items-center justify-center">
                          <Check size={16} className="text-gray-500" />
                        </div>
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Nome do Setor</span>
                        <ChevronsUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Descrição</span>
                        <ChevronsUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 w-32">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={multiSelect ? 4 : 3} className="py-16">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                          <p className="text-gray-600 font-medium">Carregando setores...</p>
                          <p className="text-gray-500 text-sm mt-1">Aguarde um momento</p>
                        </div>
                      </td>
                    </tr>
                  ) : setores.length > 0 ? (
                    setores.map((setor) => {
                      const isSelected = selectedSetores.some(s => s.id === setor.id);
                      return (
                        <tr
                          key={setor.id}
                          className={`hover:bg-blue-50 cursor-pointer transition-colors duration-150 group ${isSelected ? 'bg-blue-50' : ''}`}
                          onClick={() => handleSelectSetor(setor)}
                        >
                          {multiSelect && (
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <div className={`h-5 w-5 border-2 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} rounded flex items-center justify-center transition-all`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Briefcase size={16} className="text-blue-600" />
                              {setor.nome || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {setor.descricao || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {!multiSelect && (
                              <button
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md group-hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSetor(setor);
                                }}
                              >
                                Selecionar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={multiSelect ? 4 : 3} className="py-16">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <Briefcase size={32} className="text-gray-400" />
                          </div>
                          <p className="font-semibold text-lg text-gray-700">
                            {searchTerm ? 'Nenhum setor encontrado' : 'Nenhum setor disponível'}
                          </p>
                          <p className="text-sm mt-2">
                            {searchTerm
                              ? `Não encontramos resultados para "${searchTerm}"`
                              : 'Nenhum setor cadastrado para esta empresa'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginação */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-5 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 font-medium">
                Mostrando <span className="text-blue-600 font-bold">{totalElements > 0 ? indexOfFirstEntry : 0}</span> a <span className="text-blue-600 font-bold">{indexOfLastEntry}</span> de <span className="text-blue-600 font-bold">{totalElements}</span> resultados
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={entriesPerPage}
                  onChange={handleEntriesPerPageChange}
                  aria-label="Itens por página"
                >
                  <option value="5">5 por página</option>
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                </select>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    title="Primeira página"
                  >
                    <ChevronsLeft size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    title="Página anterior"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm min-w-[80px] text-center shadow-md">
                    {currentPage} / {totalPages || 1}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    title="Próxima página"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    title="Última página"
                  >
                    <ChevronsRight size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões de ação para seleção múltipla */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors shadow-sm"
          >
            Cancelar
          </button>
          {multiSelect && (
            <button
              onClick={handleConfirmSelection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedSetores.length === 0}
            >
              Confirmar ({selectedSetores.length} selecionado{selectedSetores.length !== 1 ? 's' : ''})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetorSearchModal;
