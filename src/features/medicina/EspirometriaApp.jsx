import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    User, Building, Calendar, ClipboardList, ArrowLeft, Save, X, Check, Home
} from 'lucide-react';

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Principal
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export default function EspirometriaApp() {
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
        // Lógica para deletar o item da lista (simulado)
        showNotification('Avaliação de Espirometria excluída com sucesso.', 'warning');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Notification notification={notification} />
            {view === 'list' ? (
                <EspirometriaList
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <EspirometriaForm
                    avaliacaoData={selectedAvaliacao}
                    onBack={handleBackToList}
                    showNotification={showNotification}
                />
            )}
        </div>
    );
}

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente de Notificação
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const Notification = ({ notification }) => {
    if (!notification) return null;
    const { message, type } = notification;
    const typeClasses = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-500',
    };
    return (
        <div className={`fixed top-5 right-5 z-50 ${typeClasses[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn`}>
            {type === 'success' ? <Check size={20} /> : <X size={20} />}
            <span>{message}</span>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Dados Mockados
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const mockEspirometriaList = [
    { id: 1, dataAvaliacao: '2025-07-01', nomeEmpresa: 'WAYSTER HENRIQUE CRUZ DE MELO', nomeFuncionario: 'MARINA GARCIA LOPES' },
    { id: 2, dataAvaliacao: '2025-06-25', nomeEmpresa: 'Construtora Segura Ltda.', nomeFuncionario: 'JOÃO DA SILVA' },
    { id: 3, dataAvaliacao: '2025-06-10', nomeEmpresa: 'Transportadora Veloz S.A.', nomeFuncionario: 'MARIA OLIVEIRA' },
];

const mockRegistrosProfissionais = [
    { id: 1, nome: 'MARINA GARCIA LOPES CONS EM TEC DA INFOR LTDA - Comercial e Projetos - Gerente Comercial e de Projetos' },
    { id: 2, nome: 'JOÃO DA SILVA - Construtora Segura Ltda. - Obras - Pedreiro' },
];

const mockFuncionarioData = {
    nome: 'MARINA GARCIA LOPES',
    empresa: 'WAYSTER HENRIQUE CRUZ DE MELO',
    setor: 'Comercial e Projetos',
    funcao: 'Gerente Comercial e de Projetos',
    dataAdmissao: '10/10/2022',
    dataEntradaCargo: '10/10/2022'
};

const mockAparelhos = [
    { id: 1, nome: 'Espirômetro Digital Portátil SP10' },
    { id: 2, nome: 'Espirômetro Koko Sx 1000' }
];

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Listagem (Ícones com cores)
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const EspirometriaList = ({ onCreateNew, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredData = useMemo(() =>
        mockEspirometriaList.filter(item =>
            item.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nomeFuncionario.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Avaliações de Espirometria</h1>
                    <button onClick={onCreateNew} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm">
                        <Plus size={18} /> Cadastrar Avaliação
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="relative w-full sm:w-1/3 mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Procure por Empresa ou Funcionário" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                {['Data da Avaliação', 'Nome da Empresa', 'Nome do Funcionário', 'Ações'].map(header => (
                                    <th key={header} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{header}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(item.dataAvaliacao)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{item.nomeEmpresa}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{item.nomeFuncionario}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-4">
                                            <button onClick={() => onEdit(item)} className="text-gray-500 hover:text-blue-600 transition-colors" title="Editar"><Edit size={18} /></button>
                                            <button onClick={() => onDelete(item.id)} className="text-gray-500 hover:text-red-600 transition-colors" title="Remover"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length === 0 && <div className="text-center py-10 text-gray-500">Nenhum registro encontrado.</div>}
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} />
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Cadastro (Ícones com cores)
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const EspirometriaForm = ({ avaliacaoData, onBack }) => {
    const [fev1, setFev1] = useState(0);
    const [fvc, setFvc] = useState(0);
    const [conclusao, setConclusao] = useState('normal');

    const fev1FvcRatio = useMemo(() => {
        if (fvc > 0) {
            return ((fev1 / fvc) * 100).toFixed(0);
        }
        return 0;
    }, [fev1, fvc]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Cadastrar Avaliação de Espirometria</h1>

                <div className="space-y-6">
                    <FormSection title="Selecione um Registro Profissional *">
                        <SearchableSelect options={mockRegistrosProfissionais} placeholder="MARINA GARCIA LOPES CONS EM TEC DA INFOR LTDA - Comercial e Projetos - Gerente Comercial e de Projetos" />
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

                    <FormSection title="Dados da Avaliação">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <InputField label="Altura *" defaultValue="0" type="number" />
                            <InputField label="Peso *" defaultValue="0" type="number" />
                            <InputField label="Data do Exame *" type="date" />
                            <SelectField label="Tipo de Exame *" options={['Admissional', 'Periódico', 'Demissional', 'Retorno ao Trabalho', 'Mudança de Risco']} />
                        </div>
                    </FormSection>

                    <FormSection title="Valores Encontrados">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <InputField label="PEF *" defaultValue="0" type="number" />
                            <InputField label="FEV 1 *" value={fev1} onChange={(e) => setFev1(Number(e.target.value))} type="number" />
                            <InputField label="FVC *" value={fvc} onChange={(e) => setFvc(Number(e.target.value))} type="number" />
                            <InfoField label="FEV 1 / FVC *" value={`${fev1FvcRatio}%`} />
                        </div>
                    </FormSection>

                    <FormSection title="Vincular Aparelho Utilizado">
                        <SearchableSelect options={mockAparelhos} placeholder="Nenhum aparelho selecionado" />
                    </FormSection>

                    <FormSection title="Conclusão">
                        <div className="flex items-center space-x-6">
                            <RadioOption name="conclusao" value="normal" checked={conclusao === 'normal'} onChange={(e) => setConclusao(e.target.value)} label="Espirometria dentro dos valores da normalidade" />
                            <RadioOption name="conclusao" value="outros" checked={conclusao === 'outros'} onChange={(e) => setConclusao(e.target.value)} label="Outros" />
                        </div>
                        {conclusao === 'outros' && (
                            <textarea placeholder="Descreva a outra conclusão..." className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
                        )}
                    </FormSection>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => onBack()} className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors">Cancelar</button>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                        <Save size={18} /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Sub-Componentes
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        {children}
    </div>
);

const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md h-9 flex items-center">{value}</p>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
    </div>
);

const SelectField = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const SearchableSelect = ({ options, placeholder }) => (
    <div className="relative">
        <select className="w-full appearance-none bg-white pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
            <option>{placeholder}</option>
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
        </select>
        <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-2 bg-gray-100 border-l border-gray-300 rounded-r-md">
            <button className="text-green-600 hover:text-green-800" title="Buscar"><Search size={16} /></button>
            <div className="w-px h-4 bg-gray-300"></div>
            <button className="text-red-600 hover:text-red-800" title="Voltar"><Home size={16} /></button>
        </div>
    </div>
);

const RadioOption = (props) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="radio" {...props} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
        <span className="text-sm text-gray-700">{props.label}</span>
    </label>
);

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p className="mb-3 sm:mb-0">Mostrando {startItem} a {endItem} de {totalItems} registros</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <span className="px-3 py-1 font-semibold text-gray-800">Página {currentPage} de {totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronRight size={16} /></button>
                <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsRight size={16} /></button>
            </div>
        </div>
    );
};