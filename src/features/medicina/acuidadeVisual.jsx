import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    User, Building, Calendar, ClipboardList, ArrowLeft, Save, X, Check, Home
} from 'lucide-react';

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Principal
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export default function AcuidadeVisualApp() {
    const [view, setView] = useState('list'); // 'list' ou 'form'
    const [selectedAvaliacao, setSelectedAvaliacao] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, id: Date.now() });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateNew = () => {
        setSelectedAvaliacao(null);
        setView('form');
    };

    const handleEdit = (avaliacao) => {
        setSelectedAvaliacao(avaliacao);
        setView('form');
    };

    const handleBackToList = (message) => {
        setView('list');
        if (message) showNotification(message, 'success');
    };

    const handleDelete = (id) => {
        showNotification('Avaliação de Acuidade Visual excluída com sucesso.', 'warning');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Notification notification={notification} />
            {view === 'list' ? (
                <AcuidadeVisualList
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <AcuidadeVisualForm
                    avaliacaoData={selectedAvaliacao}
                    onBack={handleBackToList}
                />
            )}
        </div>
    );
}

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componentes de UI Genéricos
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const Notification = ({ notification }) => {
    if (!notification) return null;
    const { message, type } = notification;
    const typeClasses = { success: 'bg-green-600', error: 'bg-red-600', warning: 'bg-yellow-500' };
    return (
        <div className={`fixed top-5 right-5 z-50 ${typeClasses[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn`}>
            {type === 'success' ? <Check size={20} /> : <X size={20} />}
            <span>{message}</span>
        </div>
    );
};

const SearchableSelect = ({ label, options, placeholder, value, onAdd }) => (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            <input
                type="text"
                readOnly
                defaultValue={value ? value.nome : ''}
                placeholder={placeholder}
                className="w-full appearance-none bg-white pl-3 pr-16 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-1">
                <button className="p-1.5 rounded text-green-600 hover:bg-green-100" title="Buscar"><Search size={16} /></button>
                <div className="w-px h-5 bg-gray-200"></div>
                <button className="p-1.5 rounded text-red-600 hover:bg-red-100" title="Limpar/Home"><Home size={16} /></button>
            </div>
        </div>
    </div>
);

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Dados Mockados
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const mockAvaliacoesList = [
    { id: 1, data: '2025-07-15', empresa: 'WAYSTER HENRIQUE CRUZ DE MELO', funcionario: 'MARINA GARCIA LOPES', medico: 'Dr. Carlos Andrade' },
];
const mockRegistros = [{ id: 1, nome: 'MARINA GARCIA LOPES CONS EM TEC DA INFOR LTDA - Comercial e Projetos - Gerente Comercial e de Projetos' }];
const mockFuncionarioData = { nome: 'Marina Garcia Lopes', matricula: '44008207000188', funcao: 'Gerente Comercial e de Projetos', idade: '0 ano(s)', empresa: 'MARINA GARCIA LOPES CONS EM TEC DA INFOR LTDA', cnpj: '44.008.207/0001-88' };
const mockMedicos = [{ id: 1, nome: 'Dr. Carlos Andrade' }];
const tipoAvaliacaoOptions = { 'PRIMEIRO_TESTE': '1º Teste', 'NAO_INFORMADO': 'Não Informado', 'ACOMPANHAMENTO': 'Acompanhamento' };
const tipoExameOptions = ['Admissional', 'Periódico', 'Demissional', 'Retorno ao Trabalho', 'Mudança de Risco'];
const diagnosticoOptions = { 'ESTAVEL': 'Estável', 'MELHORA': 'Melhora', 'PIORA': 'Piora', 'NAO_APLICAVEL': 'Não Aplicável' };
const reavaliacaoOptions = { 'ANUAL': 'Anual', 'SEMESTRAL': 'Semestral', 'TRIMESTRAL': 'Trimestral', 'A_CRITERIO_MEDICO': 'A Critério Médico', 'NAO_APLICAVEL': 'Não Aplicável' };

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Listagem
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const AcuidadeVisualList = ({ onCreateNew, onEdit, onDelete }) => (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-full mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Avaliações De Acuidades Visuais</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <SearchableSelect label="Filtrar por Empresa" options={[]} placeholder="Selecione uma empresa para filtrar" />
                    <div className="flex items-end">
                        <button onClick={onCreateNew} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Plus size={18} /> + Nova Avaliação
                        </button>
                    </div>
                </div>
                <div className="relative w-full mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Procure por algum registro..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                        <tr>{['Data', 'Empresa', 'Funcionário', 'Médico Responsável', 'Ações'].map(h => <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                        <tr><td colSpan="5" className="text-center py-10 text-gray-500">Nenhum registro encontrado!</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Cadastro
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const AcuidadeVisualForm = ({ avaliacaoData, onBack }) => {
    const [resultadoOD, setResultadoOD] = useState({ p1: 20, p2: 0, perc: 0 });
    const [resultadoOE, setResultadoOE] = useState({ p1: 20, p2: 0, perc: 0 });
    const [resultadoAO, setResultadoAO] = useState({ p1: 20, p2: 0, perc: 0 });

    const calcularPercentual = (p1, p2) => p2 > 0 ? ((p1 / p2) * 100).toFixed(0) : 0;

    useEffect(() => {
        setResultadoOD(prev => ({ ...prev, perc: calcularPercentual(prev.p1, prev.p2) }));
    }, [resultadoOD.p1, resultadoOD.p2]);
    useEffect(() => {
        setResultadoOE(prev => ({ ...prev, perc: calcularPercentual(prev.p1, prev.p2) }));
    }, [resultadoOE.p1, resultadoOE.p2]);
    useEffect(() => {
        setResultadoAO(prev => ({ ...prev, perc: calcularPercentual(prev.p1, prev.p2) }));
    }, [resultadoAO.p1, resultadoAO.p2]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Cadastrar Acuidade Visual</h1>
                <div className="space-y-6">
                    <FormSection><SearchableSelect label="Registro Profissional *" options={mockRegistros} value={mockRegistros[0]} /></FormSection>
                    <FormSection title="Informações">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <InfoField label="Nome do Funcionário" value={mockFuncionarioData.nome} />
                            <InfoField label="Matrícula" value={mockFuncionarioData.matricula} />
                            <InfoField label="Função" value={mockFuncionarioData.funcao} />
                            <InfoField label="Idade" value={mockFuncionarioData.idade} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InfoField label="Empresa" value={mockFuncionarioData.empresa} />
                            <InfoField label="CNPJ" value={mockFuncionarioData.cnpj} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
                            <InputField label="Data *" type="date" />
                            <SelectField label="Tipo de Avaliação *" options={tipoAvaliacaoOptions} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Com Lentes de Contato/Óculos *</label>
                                <div className="flex gap-4 pt-2"><RadioOption name="lentes" label="Sim" /><RadioOption name="lentes" label="Não" defaultChecked /></div>
                            </div>
                        </div>
                    </FormSection>
                    <FormSection title="Responsável e Tipo de Exame">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect label="Médico Responsável *" options={mockMedicos} />
                            <SelectField label="Tipo De Exame *" options={tipoExameOptions} />
                        </div>
                    </FormSection>
                    <FormSection title="Resultado do Teste">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ResultadoTesteItem label="O.D.*" value={resultadoOD} setValue={setResultadoOD} />
                            <ResultadoTesteItem label="O.E.*" value={resultadoOE} setValue={setResultadoOE} />
                            <ResultadoTesteItem label="A.O.*" value={resultadoAO} setValue={setResultadoAO} />
                        </div>
                    </FormSection>
                    <FormSection title="Observações">
                        <textarea placeholder="Digite observações sobre o resultado do exame" className="w-full p-2 border border-gray-300 rounded-md" rows="4"></textarea>
                    </FormSection>
                    <FormSection>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <SelectField label="Diagnóstico Comparativo *" options={diagnosticoOptions} />
                            <SelectField label="Reavaliação *" options={reavaliacaoOptions} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Encaminhamento com Afastamento *</label>
                                <div className="flex gap-4 pt-2"><RadioOption name="afastamento" label="Sim" /><RadioOption name="afastamento" label="Não" defaultChecked /></div>
                            </div>
                        </div>
                    </FormSection>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => onBack()} className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700">Cancelar</button>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 flex items-center gap-2"><Save size={18} /> Salvar</button>
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Sub-componentes
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const FormSection = ({ title, children }) => (<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">{title && <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>}{children}</div>);
const InfoField = ({ label, value }) => (<div><label className="block text-sm font-medium text-gray-500">{label}</label><p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md h-9 flex items-center">{value}</p></div>);
const InputField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" /></div>);
const SelectField = ({ label, options, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">{Object.entries(options).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></div>);
const RadioOption = (props) => (<label className="flex items-center space-x-2 cursor-pointer"><input type="radio" {...props} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" /><span className="text-sm text-gray-700">{props.label}</span></label>);
const ResultadoTesteItem = ({ label, value, setValue }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <input type="number" value={value.p1} onChange={e => setValue(v => ({ ...v, p1: Number(e.target.value) }))} className="w-1/4 px-2 py-2 border border-gray-300 rounded-md text-center" />
            <span>/</span>
            <input type="number" value={value.p2} onChange={e => setValue(v => ({ ...v, p2: Number(e.target.value) }))} className="w-1/3 px-2 py-2 border border-gray-300 rounded-md text-center" />
            <span>=</span>
            <input type="text" value={`${value.perc}%`} disabled className="w-1/3 px-2 py-2 border border-gray-300 rounded-md text-center bg-gray-100" />
        </div>
    </div>
);
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => { if (totalPages <= 1) return null; const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0; const endItem = Math.min(currentPage * itemsPerPage, totalItems); return (<div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600"><p className="mb-3 sm:mb-0">Mostrando {startItem} a {endItem} de {totalItems} registros</p><div className="flex items-center gap-1"><button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsLeft size={16} /></button><button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronLeft size={16} /></button><span className="px-3 py-1 font-semibold text-gray-800">Página {currentPage} de {totalPages}</span><button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronRight size={16} /></button><button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsRight size={16} /></button></div></div>);};
