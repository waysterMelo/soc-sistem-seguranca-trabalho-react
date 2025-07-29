import React, { useState } from 'react';
import {
    Search,
    Trash2,
    AlertCircle,
    Info, ArrowLeft
} from 'lucide-react';
import EmpresaSearchModal from '../../../components/modal/empresaSearchModal.jsx';
import {useNavigate} from "react-router-dom";
import UnidadesOperacionaisModal from '../../../components/modal/unidadesOperacionaisModal.jsx';



// --- Componentes Reutilizáveis ---

// Wrapper para seções do formulário
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {children}
        </div>
    </div>
);

// Wrapper para campos de formulário (label + input)
const FormField = ({ label, required, children, className = '', error }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 flex items-center mt-1"><AlertCircle size={14} className="mr-1"/>{error}</p>}
    </div>
);

// Input com botões de ação (como busca e exclusão)
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

// --- Componente Principal ---

export default function CadastrarSetor() {
    const [nome, setNome] = useState('');
    const [empresa, setEmpresa] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showUnidadeModal, setShowUnidadeModal] = useState(false);
    const [unidadeOperacional, setUnidadeOperacional] = useState(null);



    const handleSelectEmpresa = (selectedEmpresa) => {
        setEmpresa(selectedEmpresa);
        setShowEmpresaModal(false);

        // Limpa o erro se houver
        if (errors.empresa) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.empresa;
                return newErrors;
            });
        }
    };

    const handleSelectUnidade = (selectedUnidade) => {
        setUnidadeOperacional(selectedUnidade);
        setShowUnidadeModal(false);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!empresa) newErrors.empresa = 'O campo Selecione a Empresa ao qual o setor irá pertencer é obrigatório';
        if (!nome) newErrors.nome = 'O campo Nome é obrigatório';

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log('Formulário enviado');
            // Lógica de envio
        }
    };

    return (

        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <header className="mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Cadastrar Setor</h1>
                        <button
                            type="button"
                            onClick={() => navigate(-1)} // Volta para a página anterior
                            className="bg-gray-600 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Voltar
                        </button>
                    </div>
                </header>


                <form onSubmit={handleSubmit}>
                    {/* Seção Informações do Setor */}
                    <FormSection title="Informações do Setor">
                        <FormField label="Selecione a Empresa ao qual o setor irá pertencer" required className="lg:col-span-4" error={errors.empresa}>
                            <InputWithActions
                                placeholder="Nenhuma Empresa selecionada"
                                value={empresa ? empresa.razaoSocial : ''}
                                actions={
                                    <>
                                        <button onClick={() => setShowEmpresaModal(true)} type="button" className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"><Search size={18}/></button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={() => setEmpresa(null)}
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
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                            />
                        </FormField>
                        <FormField label="Descrição do Setor" className="lg:col-span-4">
                            <textarea
                                placeholder="Digite a descrição do setor"
                                rows="3"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </FormField>
                    </FormSection>

                    {/* Seção Informações do Local */}
                    <FormSection title="Informações do Local">
                        <FormField label="Tipo de Empresa" className="lg:col-span-1">
                            <select className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Selecione</option>
                                <option value="matriz">Matriz</option>
                                <option value="filial">Filial</option>
                            </select>
                        </FormField>
                        <FormField label="Tipo do Documento" required className="lg:col-span-1">
                            <select className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Selecione</option>
                                <option value="cnpj">CNPJ</option>
                                <option value="cei">CEI</option>
                                <option value="cpf">CPF</option>
                                <option value="cno">CNO</option>
                                <option value="caepf">CAEPF</option>
                                <option value="nit">NIT/PIS/PASEP</option>
                                <option value="outros">Outros</option>

                            </select>
                        </FormField>
                        <FormField label="Número do Documento" required className="lg:col-span-2">
                            <input type="text" placeholder="Digite o número do documento" className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </FormField></FormSection>

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
                                            onClick={() => setUnidadeOperacional(null)}
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
                        <button type="button" className="bg-red-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors">
                            Salvar e Sair
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

    );
}
