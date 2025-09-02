import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Pencil,
    Trash2,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown
} from 'lucide-react';
import aparelhoService from '../../../api/services/aparelhos/aparelhoService';

// --- Modal de Adicionar Aparelho (Funcional) ---
const AdicionarAparelhoModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        descricao: '',
        modelo: '',
        marca: '',
        calibracao: '',
        dataCalibracao: '',
        validadeCalibracao: '',
        criteriosAvaliacao: '',
        status: 'ATIVO'
    });
    const [certificadoFile, setCertificadoFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setCertificadoFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await aparelhoService.create(formData, certificadoFile);
            toast.success("Aparelho cadastrado com sucesso!");
            onSave();
        } catch (error) {
            toast.error("Erro ao cadastrar aparelho.", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl m-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Adicionar Aparelho</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Campos do formulário */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição *</label>
                            <input type="text" name="descricao" value={formData.descricao} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Modelo *</label>
                            <input type="text" name="modelo" value={formData.modelo} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marca *</label>
                            <input type="text" name="marca" value={formData.marca} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Calibração</label>
                            <input type="text" name="calibracao" value={formData.calibracao} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data da Calibração *</label>
                            <input type="date" name="dataCalibracao" value={formData.dataCalibracao} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Validade da Calibração</label>
                            <input type="date" name="validadeCalibracao" value={formData.validadeCalibracao} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Critérios de avaliação</label>
                            <textarea name="criteriosAvaliacao" value={formData.criteriosAvaliacao} onChange={handleChange}
                                rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                                <option value="ATIVO">Ativo</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Upload do Certificado</label>
                            <input type="file" onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Salvando...' : 'Salvar Aparelho'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componentes Reutilizáveis ---
const TableHeader = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

const StatusBadge = ({ status }) => {
    const statusClasses = {
        'ATIVO': 'bg-green-100 text-green-700',
        'INATIVO': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// --- Componente Principal ---
export default function ListarAparelhos() {
    const [aparelhos, setAparelhos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState({ content: [], number: 0, size: 5, totalPages: 1, totalElements: 0 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);


    const fetchAparelhos = async (currentPage = 0, currentSize = 5, search = '') => {
        try {
            const pageable = { page: currentPage, size: currentSize, sort: 'descricao' };
            const data = await aparelhoService.getAll(pageable, search);
            setAparelhos(data.content || []);
            setPage(data);
        } catch (error) {
            toast.error("Erro ao carregar aparelhos.");
        }
    };

    useEffect(() => {
        fetchAparelhos(page.number, page.size, searchTerm);
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        fetchAparelhos(newPage, page.size, searchTerm);
    };

    const handleSaveSuccess = () => {
        setIsModalOpen(false);
        fetchAparelhos(page.number, page.size, searchTerm);
    };

     const askDelete = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  // executa a exclusão
  const confirmDelete = async () => {
    try {
      await aparelhoService.delete(idToDelete);
      toast.success("Aparelho excluído com sucesso!");
      fetchAparelhos(page.number, page.size, searchTerm);
    } catch {
      null
    } finally {
      setShowDeleteModal(false);
      setIdToDelete(null);
    }
  };

    const indexOfLastEntry = (page.number + 1) * page.size;
    const indexOfFirstEntry = indexOfLastEntry - page.size;

    return (
        <>
            <AdicionarAparelhoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveSuccess} />
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
                <div className="container mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Aparelhos</h1>
                        <button onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                            <Plus size={16} />
                            <span>Adicionar Aparelho</span>
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                            <input
                                type="text"
                                placeholder="Buscar por descrição ou modelo..."
                                className="w-full sm:flex-grow pl-4 pr-4 py-2 border border-gray-300 rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <TableHeader>Descrição</TableHeader>
                                        <TableHeader>Modelo</TableHeader>
                                        <TableHeader>Data da Calibração</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <th className="px-6 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {aparelhos.map((aparelho) => (
                                        <tr key={aparelho.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{aparelho.descricao}</td>
                                            <td className="px-6 py-4">{aparelho.modelo}</td>
                                            <td className="px-6 py-4">{aparelho.dataCalibracao}</td>
                                            <td className="px-6 py-4"><StatusBadge status={aparelho.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <Link to={`/cadastros/editar-aparelho/${aparelho.id}`} className="text-blue-600 hover:text-blue-800">
                                                        <Pencil size={18} />
                                                    </Link>
                                                    <button onClick={() => askDelete(aparelho.id)} className="text-red-600 hover:text-red-800">
                                                        <Trash2 size={18} />
                                                    </button>
                                                    
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                          
                                </tbody>
                            </table>
                            
                        </div>

                        {/* --- SEÇÃO DE PAGINAÇÃO COMPLETA --- */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{indexOfFirstEntry + 1}</span> até <span className="font-medium">{Math.min(indexOfLastEntry, page.totalElements)}</span> de <span className="font-medium">{page.totalElements}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => handlePageChange(0)} disabled={page.number === 0} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50">
                                    <ChevronsLeft size={18} />
                                </button>
                                <button onClick={() => handlePageChange(page.number - 1)} disabled={page.number === 0} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50">
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                                    {page.number + 1}
                                </span>
                                <button onClick={() => handlePageChange(page.number + 1)} disabled={page.number >= page.totalPages - 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50">
                                    <ChevronRight size={18} />
                                </button>
                                <button onClick={() => handlePageChange(page.totalPages - 1)} disabled={page.number >= page.totalPages - 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50">
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        
                        
                        {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirmação
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja excluir este aparelho? Esta ação não pode
                            ser desfeita.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
                     )}
                       
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}