import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronsUpDown, Check } from 'lucide-react';
import { setorService } from '../../api/services/cadastros/serviceSetores.js';

const SetorSearchModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  onSelectMultiple, 
  empresaId, 
  multiSelect = false 
}) => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSetores, setSelectedSetores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
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
        page: currentPage - 1,
        size: entriesPerPage
      };

      // Só adiciona nome se houver termo de busca
      if (searchTerm && searchTerm.trim() !== '') {
        params.nome = searchTerm.trim();
      }

      // Fazer a requisição
      const response = await setorService.buscarComFiltros(params);


      if (response && response.data) {
        if (response.data.content && Array.isArray(response.data.content)) {
          setSetores(response.data.content);
          setTotalElements(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 0);

          if (response.data.content.length === 0) {
            setError("Nenhum setor encontrado para esta empresa");
          }
        } else if (Array.isArray(response.data)) {

          // Aplicar paginação manual
          const start = (currentPage - 1) * entriesPerPage;
          const end = start + entriesPerPage;
          const paginatedData = response.data.slice(start, end);
          
          setSetores(paginatedData);
          setTotalElements(response.data.length);
          setTotalPages(Math.ceil(response.data.length / entriesPerPage));

          if (response.data.length === 0) {
            setError("Nenhum setor encontrado para esta empresa");
          }
        } else {
          console.error('Formato de resposta inesperado:', typeof response.data, response.data);
          setSetores([]);
          setTotalElements(0);
          setTotalPages(0);
          setError("Formato de resposta inesperado da API");
        }
      } else {
        console.error('Resposta vazia ou inválida:', response);
        setSetores([]);
        setTotalElements(0);
        setTotalPages(0);
        setError("Resposta vazia do servidor");
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
  }, [empresaId, currentPage, entriesPerPage, searchTerm]);

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
    setCurrentPage(1); // Reset para primeira página
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Selecionar Setores</h3>
            {empresaId && (
              <p className="text-sm text-gray-500 mt-1">
                Empresa ID: {empresaId}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de pesquisa */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar setor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Buscar setor"
            />
          </div>
        </div>


        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}


        {/* Tabela de setores */}
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {multiSelect && <th className="w-12 px-6 py-3"></th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Nome do Setor</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Descrição</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={multiSelect ? 4 : 3} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : setores.length > 0 ? (
                setores.map((setor) => {
                  const isSelected = selectedSetores.some(s => s.id === setor.id);
                  return (
                    <tr
                      key={setor.id}
                      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectSetor(setor)}
                    >
                      {multiSelect && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-5 w-5 border ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} rounded flex items-center justify-center`}>
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {setor.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {setor.descricao || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSetor(setor);
                          }}
                        >
                          Selecionar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={multiSelect ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm
                      ? 'Nenhum setor encontrado com este termo de busca.'
                      : 'Nenhum setor cadastrado para esta empresa.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-700 mb-2 sm:mb-0">
            Mostrando <span className="font-medium">{totalElements > 0 ? indexOfFirstEntry : 0}</span> a <span className="font-medium">{indexOfLastEntry}</span> de <span className="font-medium">{totalElements}</span> resultados
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
              aria-label="Itens por página"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Página anterior"
            >
              Anterior
            </button>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm">
              {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Próxima página"
            >
              Próximo
            </button>
          </div>
        </div>

        {/* Botões de ação para seleção múltipla */}
        {multiSelect && (
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={selectedSetores.length === 0}
            >
              Confirmar ({selectedSetores.length} selecionados)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetorSearchModal;