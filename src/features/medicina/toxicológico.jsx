import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Save, X, Check, Home, UploadCloud
} from 'lucide-react';

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Principal
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export default function ExameToxicologicoApp() {
    const [view, setView] = useState('list'); // 'list' ou 'form'
    const [selectedExame, setSelectedExame] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, id: Date.now() });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateNew = () => {
        setSelectedExame(null);
        setView('form');
    };

    const handleEdit = (exame) => {
        setSelectedExame(exame);
        setView('form');
    };

    const handleBackToList = (message) => {
        setView('list');
        if (message) showNotification(message, 'success');
    };

    const handleDelete = (id) => {
        showNotification('Exame Toxicológico excluído com sucesso.', 'warning');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Notification notification={notification} />
            {view === 'list' ? (
                <ExameToxicologicoList
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <ExameToxicologicoForm
                    exameData={selectedExame}
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

const SearchableSelect = ({ label, options, placeholder, value, onSelect, onAdd }) => (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            <input
                type="text"
                readOnly
                value={value ? value.nome : ''}
                placeholder={placeholder}
                className="w-full appearance-none bg-white pl-3 pr-20 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-1">
                <button className="p-1.5 rounded text-green-600 hover:bg-green-100" title="Buscar"><Search size={16} /></button>
                <div className="w-px h-5 bg-gray-200"></div>
                <button onClick={onAdd} className="p-1.5 rounded text-blue-600 hover:bg-blue-100" title="Adicionar Novo"><Plus size={16} /></button>
                <div className="w-px h-5 bg-gray-200"></div>
                <button className="p-1.5 rounded text-red-600 hover:bg-red-100" title="Limpar"><Home size={16} /></button>
            </div>
        </div>
    </div>
);

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Dados Mockados
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const mockExamesList = [
    { id: 1, nomeFuncionario: 'MARINA GARCIA LOPES', dataExame: '2025-07-15', laboratorio: 'BioVida Labs', medico: 'Dr. Carlos Andrade', status: 'Pendente de Envio' },
    { id: 2, nomeFuncionario: 'JOÃO DA SILVA', dataExame: '2025-07-14', laboratorio: 'Laboratório Central', medico: 'Dra. Ana Paula Faria', status: 'Enviado' },
];
const mockRegistros = [{ id: 1, nome: 'MARINA GARCIA LOPES - Gerente Comercial e de Projetos' }];
const mockFuncionarioData = { nome: 'MARINA GARCIA LOPES', empresa: 'WAYSTER HENRIQUE CRUZ DE MELO', setor: 'Comercial e Projetos', funcao: 'Gerente Comercial e de Projetos', dataAdmissao: '10/10/2022', dataEntradaCargo: '10/10/2022' };
const mockLaboratorios = [{ id: 1, nome: 'BioVida Labs' }];
const mockMedicos = [{ id: 1, nome: 'MÉDICO TESTE WAYSTER', crm: '123456', estadoCrm: 'AM' }];
const ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Listagem
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const ExameToxicologicoList = ({ onCreateNew, onEdit, onDelete }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'Pendente de Envio': return 'bg-yellow-100 text-yellow-800';
            case 'Enviado': return 'bg-blue-100 text-blue-800';
            case 'Concluído': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Exame Toxicológico do Motorista Profissional Empregado</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <SearchableSelect label="Filtrar por Empresa" options={[]} placeholder="Selecione uma empresa para filtrar" />
                        <SearchableSelect label="Filtrar por Unidade Operacional" options={[]} placeholder="Nenhuma Unidade Operacional selecionada" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="relative w-full md:w-2/5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder="Procure por algum registro..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                            <button className="w-full md:w-auto bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md font-semibold hover:bg-yellow-500 flex items-center justify-center gap-2">
                                <UploadCloud size={18} /> Eventos S-2221
                            </button>
                            <button onClick={onCreateNew} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Plus size={18} /> Novo Exame Toxicológico
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                {['Nome do Funcionário', 'Data do Exame', 'Laboratório Responsável', 'Médico Responsável', 'Status', 'Ações'].map(h => <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{h}</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {mockExamesList.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Nenhum registro encontrado!</td></tr>
                            ) : (
                                mockExamesList.map(exame => (
                                    <tr key={exame.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm">{exame.nomeFuncionario}</td>
                                        <td className="py-3 px-4 text-sm">{new Date(exame.dataExame).toLocaleDateString('pt-BR')}</td>
                                        <td className="py-3 px-4 text-sm">{exame.laboratorio}</td>
                                        <td className="py-3 px-4 text-sm">{exame.medico}</td>
                                        <td className="py-3 px-4 text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(exame.status)}`}>{exame.status}</span></td>
                                        <td className="py-3 px-4"><div className="flex gap-4"><button onClick={() => onEdit(exame)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button><button onClick={() => onDelete(exame.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button></div></td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Cadastro
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const ExameToxicologicoForm = ({ exameData, onBack }) => {
    const [selectedMedico, setSelectedMedico] = useState(mockMedicos[0]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Cadastrar Exame Toxicológico do Motorista Profissional Empregado</h1>
                <div className="space-y-6">
                    <FormSection title="Registro Profissional *">
                        <SearchableSelect options={mockRegistros} value={mockRegistros[0]} />
                    </FormSection>
                    <FormSection title="Dados do Funcionário">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoField label="Nome do Funcionário" value={mockFuncionarioData.nome} />
                            <InfoField label="Empresa" value={mockFuncionarioData.empresa} />
                            <InfoField label="Setor" value={mockFuncionarioData.setor} />
                            <InfoField label="Função" value={mockFuncionarioData.funcao} />
                            <InfoField label="Data de Admissão" value={mockFuncionarioData.dataAdmissao} />
                            <InfoField label="Data de Entrada no Cargo" value={mockFuncionarioData.dataEntradaCargo} />
                        </div>
                    </FormSection>
                    <FormSection title="Dados do Exame">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField label="Data do Exame *" type="date" />
                            <InputField label="Código do Exame Toxicológico *" placeholder="Ex: AA00000000" />
                            <SearchableSelect label="Laboratório Responsável *" options={mockLaboratorios} onAdd={() => alert('Abrir modal de cadastro de laboratório')} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            <SearchableSelect label="Médico Responsável *" options={mockMedicos} value={selectedMedico} onSelect={setSelectedMedico} onAdd={() => alert('Abrir modal de cadastro de médico')} />
                            <InfoField label="CRM do Médico Responsável *" value={selectedMedico ? `${selectedMedico.crm}/${selectedMedico.estadoCrm}` : ''} />
                            <SelectField label="Estado *" options={ufs} />
                        </div>
                    </FormSection>
                    <FormSection title="Retificação">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Retificação *</label>
                                <div className="flex gap-6"><RadioOption name="retificacao" label="Original" defaultChecked /><RadioOption name="retificacao" label="Retificação" /></div>
                            </div>
                            <InputField label="Número do Recibo do evento no eSocial do Exame Toxicológico para caso de Retificação" />
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
// Sub-componentes do Formulário
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const FormSection = ({ title, children }) => (<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">{title && <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>}{children}</div>);
const InfoField = ({ label, value }) => (<div><label className="block text-sm font-medium text-gray-500">{label}</label><p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md h-9 flex items-center">{value}</p></div>);
const InputField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" /></div>);
const SelectField = ({ label, options, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>);
const RadioOption = (props) => (<label className="flex items-center space-x-2 cursor-pointer"><input type="radio" {...props} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" /><span className="text-sm text-gray-700">{props.label}</span></label>);
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => { if (totalPages <= 1) return null; const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0; const endItem = Math.min(currentPage * itemsPerPage, totalItems); return (<div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600"><p className="mb-3 sm:mb-0">Mostrando {startItem} a {endItem} de {totalItems} registros</p><div className="flex items-center gap-1"><button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsLeft size={16} /></button><button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronLeft size={16} /></button><span className="px-3 py-1 font-semibold text-gray-800">Página {currentPage} de {totalPages}</span><button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronRight size={16} /></button><button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsRight size={16} /></button></div></div>);};

