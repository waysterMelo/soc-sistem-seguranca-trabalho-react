// EditarSetorModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    AlertCircle,
    Info,
    X
} from 'lucide-react';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import { setorService } from "../../api/services/cadastros/serviceSetores.js";

// Wrapper para seções do formulário
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {children}
        </div>
    </div>
);

// Wrapper para campos de formulário
const FormField = ({ label, required, children, className = '', error }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 flex items-center mt-1"><AlertCircle size={14} className="mr-1"/>{error}</p>}
    </div>
);

// Input com botões de ação
const InputWithActions = ({ placeholder, actions, value }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            readOnly
            className="w-full py-2 px-3 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

export default function EditarSetorModal({ isOpen, onClose, setor, onSave }) {
    const [empresa, setEmpresa] = useState(null);
    const [unidadeOperacional, setUnidadeOperacional] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showUnidadeModal, setShowUnidadeModal] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nome: '',
        descricao: '',
        tipoEmpresa: '',
        tipoDocumento: '',
        numeroDocumento: '',
        empresaId: null,
        unidadeOperacionalId: null,
        status: 'ATIVO'
    });

    // Carregar dados do setor quando o modal abrir
    useEffect(() => {
        if (isOpen && setor) {
            setFormData({
                id: setor.id || '',
                nome: setor.nome || '',
                descricao: setor.descricao || '',
                tipoEmpresa: setor.tipoEmpresa || '',
                tipoDocumento: setor.tipoDocumento || '',
                numeroDocumento: setor.numeroDocumento || '',
                empresaId: setor.empresa?.id || null,
                unidadeOperacionalId: setor.unidadeOperacional?.id || null,
                status: setor.status || 'ATIVO'
            });
            
            setEmpresa(setor.empresa || null);
            setUnidadeOperacional(setor.unidadeOperacional || null);
        }
    }, [isOpen, setor]);

    const handleSelectEmpresa = (selectedEmpresa) => {
        setEmpresa(selectedEmpresa);
        setFormData(prev => ({ ...prev, empresaId: selectedEmpresa.id }));
        setShowEmpresaModal(false);

        // Limpa o erro se houver
        if (errors.empresaId) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.empresaId;
                return newErrors;
            });
        }
    };

    const handleSelectUnidade = (selectedUnidade) => {
        setUnidadeOperacional(selectedUnidade);
        setFormData(prev => ({ ...prev, unidadeOperacionalId: selectedUnidade.id }));
        setShowUnidadeModal(false);
    };

    const handleStatusChange = (e) => {
        setFormData(prev => ({ ...prev, status: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Limpa erros anteriores
        setErrors({});
        
        const newErrors = {};
        
        if (!formData.nome.trim()) {
            newErrors.nome = 'O campo Nome é obrigatório';
        }
        
        if (!formData.empresaId) {
            newErrors.empresaId = 'O campo Selecione a Empresa ao qual o setor irá pertencer é obrigatório';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await setorService.update(formData.id, formData);
            onSave(response.data);
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar setor:", error);

            if (error.response && error.response.data) {
                const apiErrors = {};

                if (error.response.data.errors) {
                    error.response.data.errors.forEach(err => {
                        apiErrors[err.field] = err.message;
                    });
                } else if (error.response.data.message) {
                    alert(`Erro: ${error.response.data.message}`);
                }

                setErrors(apiErrors);
            } else {
                alert("Ocorreu um erro ao atualizar o setor. Tente novamente mais tarde.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-gray-50 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Editar Setor</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Seção Informações do Setor */}
                        <FormSection title="Informações do Setor">
                            <FormField label="Selecione a Empresa ao qual o setor irá pertencer" required className="lg:col-span-4" error={errors.empresaId}>
                                <InputWithActions
                                    placeholder="Nenhuma Empresa selecionada"
                                    value={empresa ? empresa.razaoSocial || empresa.nome : ''}
                                    actions={
                                        <>
                                            <button 
                                                onClick={() => setShowEmpresaModal(true)} 
                                                type="button" 
                                                className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            >
                                                <Search size={18}/>
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                                onClick={() => {
                                                    setEmpresa(null);
                                                    setFormData(prev => ({ ...prev, empresaId: null }));
                                                }}
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </>
                                    }
                                />
                            </FormField>
                            
                            <FormField label="Nome" required className="lg:col-span-4" error={errors.nome}>
                                <input
                                    type="text"
                                    placeholder="Digite o nome do setor"
                                    value={formData.nome}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, nome: e.target.value }));
                                        // Limpa o erro ao digitar
                                        if (errors.nome) {
                                            setErrors(prev => {
                                                const newErrors = {...prev};
                                                delete newErrors.nome;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                    className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                            </FormField>
                            
                            <FormField label="Descrição do Setor" className="lg:col-span-4">
                                <textarea
                                    placeholder="Digite a descrição do setor"
                                    rows="3"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>

                            <FormField label="Status" className="lg:col-span-4">
                                <select
                                    value={formData.status}
                                    onChange={handleStatusChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </FormField>
                        </FormSection>

                        {/* Seção Informações do Local */}
                        <FormSection title="Informações do Local">
                            <FormField label="Tipo de Empresa" className="lg:col-span-1">
                                <select 
                                    value={formData.tipoEmpresa}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, tipoEmpresa: e.target.value }))}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white
                                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Selecione</option>
                                    <option value="FISICA">Fisica</option>
                                    <option value="JURIDICA">Juridica</option>
                                </select>
                            </FormField>
                            
                            <FormField label="Tipo do Documento" required className="lg:col-span-1">
                                <select 
                                    value={formData.tipoDocumento}
                                    onChange={(e) => setFormData(prev =>
                                        ({ ...prev, tipoDocumento: e.target.value }))}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Selecione</option>
                                    <option value="CNPJ">CNPJ</option>
                                    <option value="CEI">CEI</option>
                                    <option value="CPF">CPF</option>
                                    <option value="CNO">CNO</option>
                                    <option value="CAEPF">CAEPF</option>
                                    <option value="NIT_PIS_PASEP">NIT/PIS/PASEP</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </FormField>
                            
                            <FormField label="Número do Documento" required className="lg:col-span-2">
                                <input 
                                    type="text" 
                                    placeholder="Digite o número do documento"
                                    value={formData.numeroDocumento}
                                    onChange={(e) => setFormData(prev => ({ ...prev, numeroDocumento: e.target.value }))}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </FormField>
                        </FormSection>

                        {/* Seção Unidade Operacional */}
                        <FormSection title="Unidade Operacional">
                            <FormField label="Vincular Unidade Operacional" className="lg:col-span-4">
                                <InputWithActions
                                    placeholder="Nenhuma Unidade Operacional selecionada"
                                    value={unidadeOperacional ? unidadeOperacional.nome : ''}
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                                onClick={() => setShowUnidadeModal(true)}
                                            >
                                                <Search size={18}/>
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                                onClick={() => {
                                                    setUnidadeOperacional(null);
                                                    setFormData(prev => ({ ...prev, unidadeOperacionalId: null }));
                                                }}
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </>
                                    }
                                />
                            </FormField>
                            
                            <div className="lg:col-span-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-r-lg">
                                <div className="flex">
                                    <Info size={20} className="mr-3 flex-shrink-0" />
                                    <p className="text-sm">
                                        {unidadeOperacional
                                            ? `Unidade Operacional vinculada: ${unidadeOperacional.nome}`
                                            : 'O setor ainda não possui vínculo com nenhuma unidade operacional.'}
                                    </p>
                                </div>
                            </div>
                        </FormSection>

                        {/* Botões de Ação */}
                        <div className="flex flex-wrap justify-end space-x-4 mt-8">
                            <button 
                                type="button" 
                                className="bg-red-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>

                <EmpresaSearchModal
                    isOpen={showEmpresaModal}
                    onClose={() => setShowEmpresaModal(false)}
                    onSelect={handleSelectEmpresa}
                />
                
                <UnidadesOperacionaisModal
                    isOpen={showUnidadeModal}
                    onClose={() => setShowUnidadeModal(false)}
                    onSelect={handleSelectUnidade}
                />
            </div>
        </div>
    );
}