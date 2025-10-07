import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  AlertCircle,
  ChevronsUpDown,
  RefreshCw,
  User,
  CheckCircle,
  Calendar,
  FileText,
} from "lucide-react";

import afastamentoService from "../../api/services/medicina/afastamentoService";
import funcionarioService from "../../api/services/cadastros/funcionariosServices.js";
import EmpresaSearchModal from "../../components/modal/empresaSearchModal";
import UnidadesOperacionaisModal from "../../components/modal/unidadesOperacionaisModal";
import SetorSearchModal from "../../components/modal/SetorSearchModal";

// --- Reusable Components ---

const TableHeader = ({ children, sortable = true }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
    <div
      className={`flex items-center space-x-1 ${
        sortable ? "cursor-pointer hover:text-gray-700" : ""
      }`}
    >
      <span>{children}</span>
      {sortable && <ChevronsUpDown size={14} className="text-gray-400" />}
    </div>
  </th>
);

const InputWithActions = ({
  placeholder,
  value,
  actions,
  disabled = false,
  onClick,
}) => (
  <div className="relative flex items-center">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      readOnly
      disabled={disabled}
      onClick={onClick}
      className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
    />
    <div className="absolute right-0 flex">{actions}</div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Carregando afastamentos...</span>
  </div>
);

const EmptyState = ({
  message = "Nenhum afastamento encontrado",
  showIcon = true,
}) => (
  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
    {showIcon && <Calendar size={48} className="text-gray-400 mb-4" />}
    <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
    <p className="text-gray-500 text-center text-sm">
      {!showIcon
        ? "Selecione empresa, unidade, setor e funcionários para visualizar os afastamentos."
        : "Nenhum registro encontrado com os filtros aplicados."}
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
    <AlertCircle size={48} className="text-red-500 mb-4" />
    <h3 className="text-lg font-medium text-red-700 mb-2">
      Erro ao carregar afastamentos
    </h3>
    <p className="text-red-600 text-center mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      <RefreshCw size={16} />
      Tentar novamente
    </button>
  </div>
);

const FuncionariosList = ({
  funcionarios,
  loading,
  selectedFuncionarios,
  onToggleFuncionario,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Carregando funcionários...</span>
      </div>
    );
  }

  if (funcionarios.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-md">
        <User size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">
          Nenhum funcionário encontrado neste setor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {funcionarios.map((func) => {
        const isSelected = selectedFuncionarios.some((f) => f.id === func.id);
        return (
          <div
            key={func.id}
            onClick={() => onToggleFuncionario(func)}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`}
            >
              {isSelected && <CheckCircle size={14} className="text-white" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {func.nome} {func.sobrenome}
              </div>
              <div className="text-sm text-gray-500">CPF: {func.cpf}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function ListarAfastamento() {
  const navigate = useNavigate();

  // Data states
  const [allAfastamentos, setAllAfastamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [selectedUnidade, setSelectedUnidade] = useState(null);
  const [selectedSetor, setSelectedSetor] = useState(null);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState([]);

  // Employee list states
  const [funcionarios, setFuncionarios] = useState([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);

  // Modal states
  const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
  const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
  const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [afastamentoToDelete, setAfastamentoToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchFuncionarios = useCallback(async (setorId) => {
    if (!setorId) {
      setFuncionarios([]);
      return;
    }
    setLoadingFuncionarios(true);
    try {
      const response = await funcionarioService.buscarFuncionariosPorSetor(
        setorId,
        { page: 0, size: 100 }
      );
      setFuncionarios(response.data.content || []);
    } catch (err) {
      toast.error("Erro ao carregar funcionários do setor.");
      setFuncionarios([]);
    } finally {
      setLoadingFuncionarios(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSetor) {
      fetchFuncionarios(selectedSetor.id);
    } else {
      setFuncionarios([]);
    }
  }, [selectedSetor, fetchFuncionarios]);

  const fetchAfastamentos = useCallback(async () => {
    if (selectedFuncionarios.length === 0) {
      setAllAfastamentos([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const promises = selectedFuncionarios.map((func) => {
        if (!func || typeof func.id === "undefined") {
          console.error("Objeto de funcionário inválido encontrado:", func);
          return Promise.resolve({ content: [] }); // Retorna um resultado vazio para não quebrar o Promise.all
        }
        return afastamentoService.getAfastamentosByFuncionario(func.id);
      });

      const results = await Promise.all(promises);
      const allData = results.flatMap((res) => res.content || []);
      const uniqueData = Array.from(
        new Map(allData.map((item) => [item.id, item])).values()
      );
      uniqueData.sort((a, b) => b.id - a.id); // Ordenar por ID decrescente
      setAllAfastamentos(uniqueData);
    } catch (err) {
      setError("Não foi possível carregar os afastamentos.");
      setAllAfastamentos([]);
      console.error("Erro ao buscar afastamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedFuncionarios]);

  useEffect(() => {
    fetchAfastamentos();
    setCurrentPage(0);
  }, [fetchAfastamentos]);

  const totalPages = Math.ceil(allAfastamentos.length / pageSize);
  const paginatedAfastamentos = allAfastamentos.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleClearFilters = () => {
    setSelectedEmpresa(null);
    setSelectedUnidade(null);
    setSelectedSetor(null);
    setSelectedFuncionarios([]);
    setAllAfastamentos([]);
  };

  const handleToggleFuncionario = (funcionario) => {
    setSelectedFuncionarios((prev) => {
      const isSelected = prev.some((f) => f.id === funcionario.id);
      return isSelected
        ? prev.filter((f) => f.id !== funcionario.id)
        : [...prev, funcionario];
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const handleEdit = (afastamento) => {
    navigate(`/medicina/editar-afastamento/${afastamento.id}`);
  };

  const handleDelete = (id) => {
    setAfastamentoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (afastamentoToDelete) {
      try {
        await afastamentoService.deleteAfastamento(afastamentoToDelete);
        setIsDeleteModalOpen(false);
        toast.success("Afastamento excluído com sucesso!");
        fetchAfastamentos();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Erro ao excluir o afastamento.";
        toast.error(errorMessage);
      } finally {
        setAfastamentoToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAfastamentoToDelete(null);
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "N/A";

  const renderContent = () => {
    if (!selectedEmpresa || !selectedUnidade || !selectedSetor) {
      return (
        <EmptyState
          message="Selecione empresa, unidade e setor"
          showIcon={false}
        />
      );
    }
    if (selectedFuncionarios.length === 0 && funcionarios.length > 0) {
      return (
        <EmptyState
          message="Selecione pelo menos um funcionário"
          showIcon={false}
        />
      );
    }
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorState message={error} onRetry={fetchAfastamentos} />;
    }
    if (allAfastamentos.length === 0 && selectedFuncionarios.length > 0) {
      return <EmptyState message="Nenhum afastamento encontrado" />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader sortable={false}>ID</TableHeader>
              <TableHeader>Médico (Responsável)</TableHeader>
              <TableHeader>Motivo</TableHeader>
              <TableHeader>Empresa</TableHeader>
              <TableHeader>Data Início</TableHeader>
              <TableHeader>Data Fim</TableHeader>
              <TableHeader sortable={false}>Ações</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAfastamentos.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.nomeResponsavel || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.motivoAfastamento || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.nomeEmpresa || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.dataInicio)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.dataFim)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Atestados de Afastamento
              </h1>
              <p className="text-gray-600">
                Gerencie todos os afastamentos dos funcionários
              </p>
            </div>
            <button
              onClick={() => navigate("/medicina/cadastrar-afastamento")}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm mt-4 sm:mt-0"
            >
              <Plus size={16} />
              <span>Novo Afastamento</span>
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Filtros
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Empresa *
                  </label>
                  <InputWithActions
                    placeholder="Clique para selecionar empresa..."
                    value={selectedEmpresa?.razaoSocial || ""}
                    onClick={() => setIsEmpresaModalOpen(true)}
                    actions={
                      <>
                        <button
                          onClick={() => setIsEmpresaModalOpen(true)}
                          className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          onClick={handleClearFilters}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <X size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. Unidade Operacional *
                  </label>
                  <InputWithActions
                    placeholder={
                      !selectedEmpresa
                        ? "Primeiro selecione uma empresa..."
                        : "Clique para selecionar unidade..."
                    }
                    value={selectedUnidade?.nome || ""}
                    disabled={!selectedEmpresa}
                    onClick={() =>
                      selectedEmpresa && setIsUnidadeModalOpen(true)
                    }
                    actions={
                      <>
                        <button
                          onClick={() =>
                            selectedEmpresa && setIsUnidadeModalOpen(true)
                          }
                          disabled={!selectedEmpresa}
                          className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md disabled:bg-gray-400"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUnidade(null);
                            setSelectedSetor(null);
                            setSelectedFuncionarios([]);
                          }}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <X size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Setor *
                  </label>
                  <InputWithActions
                    placeholder={
                      !selectedUnidade
                        ? "Primeiro selecione uma unidade..."
                        : "Clique para selecionar setor..."
                    }
                    value={selectedSetor?.nome || ""}
                    disabled={!selectedUnidade}
                    onClick={() => selectedUnidade && setIsSetorModalOpen(true)}
                    actions={
                      <>
                        <button
                          onClick={() =>
                            selectedUnidade && setIsSetorModalOpen(true)
                          }
                          disabled={!selectedUnidade}
                          className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md disabled:bg-gray-400"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSetor(null);
                            setSelectedFuncionarios([]);
                          }}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <X size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
              </div>
              {selectedSetor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    4. Funcionários do Setor * (Selecione um ou mais)
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <FuncionariosList
                      funcionarios={funcionarios}
                      loading={loadingFuncionarios}
                      selectedFuncionarios={selectedFuncionarios}
                      onToggleFuncionario={handleToggleFuncionario}
                    />
                    {selectedFuncionarios.length > 0 && (
                      <div className="mt-3 text-sm text-blue-600 font-medium">
                        {selectedFuncionarios.length} funcionário(s)
                        selecionado(s)
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!selectedEmpresa && (
                <div className="flex items-center p-4 bg-blue-50 border-blue-200 rounded-lg">
                  <AlertCircle size={20} className="text-blue-600 mr-3" />
                  <p className="text-blue-800 text-sm">
                    <strong>Importante:</strong> Selecione empresa, unidade,
                    setor e pelo menos um funcionário para visualizar os
                    afastamentos.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <div className="text-sm text-gray-600">
                {allAfastamentos.length > 0 &&
                  `Total de ${allAfastamentos.length} registro(s)`}
              </div>
              <select
                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
              </select>
            </div>
            {renderContent()}
            {allAfastamentos.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                  Mostrando de{" "}
                  <span className="font-medium">
                    {currentPage * pageSize + 1}
                  </span>{" "}
                  até{" "}
                  <span className="font-medium">
                    {Math.min(
                      (currentPage + 1) * pageSize,
                      allAfastamentos.length
                    )}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium">{allAfastamentos.length}</span>{" "}
                  registros
                </p>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                    {currentPage + 1}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <EmpresaSearchModal
          isOpen={isEmpresaModalOpen}
          onClose={() => setIsEmpresaModalOpen(false)}
          onSelect={(empresa) => {
            setSelectedEmpresa(empresa);
            setSelectedUnidade(null);
            setSelectedSetor(null);
            setSelectedFuncionarios([]);
            setIsEmpresaModalOpen(false);
          }}
        />
        {selectedEmpresa && (
          <UnidadesOperacionaisModal
            isOpen={isUnidadeModalOpen}
            onClose={() => setIsUnidadeModalOpen(false)}
            onSelect={(unidade) => {
              setSelectedUnidade(unidade);
              setSelectedSetor(null);
              setSelectedFuncionarios([]);
              setIsUnidadeModalOpen(false);
            }}
            empresaId={selectedEmpresa.id}
          />
        )}
        {selectedUnidade && (
          <SetorSearchModal
            isOpen={isSetorModalOpen}
            onClose={() => setIsSetorModalOpen(false)}
            onSelect={(setor) => {
              setSelectedSetor(setor);
              setSelectedFuncionarios([]);
              setIsSetorModalOpen(false);
            }}
            empresaId={selectedEmpresa.id}
            unidadeOperacionalId={selectedUnidade.id}
          />
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-gray-600 mb-2">
                  Deseja realmente excluir o afastamento de ID:{" "}
                  <strong className="text-red-600 font-bold text-lg">
                    #{afastamentoToDelete}
                  </strong>
                  ?
                </p>
                <p className="text-sm text-red-600 mb-6">
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={cancelDelete}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
