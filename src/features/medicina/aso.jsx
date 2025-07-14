import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Printer, Settings, Upload, FileText, Shield, AlertTriangle, X, Check, Save, ArrowLeft, Home
} from 'lucide-react';

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Principal
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export default function AsoApp() {
    const [view, setView] = useState('list'); // 'list' ou 'form'
    const [selectedAso, setSelectedAso] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, id: Date.now() });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateNew = () => {
        setSelectedAso(null);
        setView('form');
    };

    const handleEdit = (aso) => {
        setSelectedAso(aso);
        setView('form');
    };

    const handleBackToList = (message) => {
        setView('list');
        if (message) showNotification(message, 'success');
    };

    const handleDelete = (id) => {
        showNotification('ASO excluído com sucesso.', 'warning');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Notification notification={notification} />
            {view === 'list' ? (
                <AsoList
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <AsoForm
                    asoData={selectedAso}
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
const mockAsoList = [
    { id: 1, idRegistro: 101, dataAso: '2025-07-15', tipo: 'Admissional', nomeEmpresa: 'WAYSTER HENRIQUE CRUZ DE MELO', nomeFuncionario: 'MARINA GARCIA LOPES', vencimento: '2026-07-15' },
    { id: 2, idRegistro: 102, dataAso: '2025-07-14', tipo: 'Periódico', nomeEmpresa: 'Construtora Segura Ltda.', nomeFuncionario: 'JOÃO DA SILVA', vencimento: '2026-07-14' },
];

const mockRegistrosProfissionais = [
    { id: 1, nome: 'MARINA GARCIA LOPES - 12345678910 - Comercial e Projetos - Gerente Comercial e de Projetos' },
    { id: 2, nome: 'JOÃO DA SILVA - 10987654321 - Obras - Pedreiro' },
];

const mockFuncionarioData = {
    nome: 'MARINA GARCIA LOPES',
    dataNascimento: '20/05/1980',
    empresa: 'WAYSTER HENRIQUE CRUZ DE MELO',
    setor: 'Comercial e Projetos',
    funcao: 'Gerente Comercial e de Projetos',
    dataAdmissao: '10/10/2022',
};

const mockMedicos = [
    { id: 1, nome: 'Dr. Carlos Andrade' },
    { id: 2, nome: 'Dra. Ana Paula Faria' },
];

const mockExamesDoPcmso = [
    { id: 1, codigo: '1010', nome: 'Hemograma Completo', file: null },
    { id: 2, codigo: '1012', nome: 'Acuidade Visual', file: null },
    { id: 3, codigo: '2015', nome: 'Audiometria Tonal', file: null },
];

const mockRiscosCatalogo = [
    { id: 1, nome: 'Ruído Contínuo ou Intermitente', grupo: 'Físico' },
    { id: 2, nome: 'Postura Inadequada', grupo: 'Ergonômico' },
    { id: 3, nome: 'Poeiras Minerais', grupo: 'Químico' },
    { id: 4, nome: 'Vírus', grupo: 'Biológico' },
    { id: 5, nome: 'Bactérias', grupo: 'Biológico' },
    { id: 6, nome: 'Máquinas sem Proteção', grupo: 'Acidentes' },
];


//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Listagem de ASO
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const AsoList = ({ onCreateNew, onEdit, onDelete }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Atestado de Saúde Ocupacional</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <SearchableSelect label="Filtrar por Empresa" options={[]} placeholder="Selecione uma empresa para filtrar" />
                        <SearchableSelect label="Filtrar por Unidade Operacional" options={[]} placeholder="Nenhuma Unidade Operacional selecionada" />
                        <SelectField label="Filtrar pelo tipo de ASO" options={['Todos', 'Admissional', 'Periódico', 'Demissional']} />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder="Procure por algum registro..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                            <button className="w-full md:w-auto bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md font-semibold hover:bg-yellow-500 flex items-center justify-center gap-2 transition-colors">
                                <Settings size={18} /> Configurar Impresso
                            </button>
                            <button className="w-full md:w-auto bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors">
                                <Printer size={18} /> Gerar Relatório
                            </button>
                            <button onClick={onCreateNew} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                                <Plus size={18} /> Novo ASO
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                {['Id Registro', 'Data do Aso', 'Tipo', 'Nome da Empresa', 'Nome do Funcionário', 'Vencimento', 'Ações'].map(header => (
                                    <th key={header} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{header}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-gray-500">Nenhum registro encontrado!</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Cadastro de ASO (Refatorada)
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const AsoForm = ({ asoData, onBack }) => {
    const [exames, setExames] = useState(mockExamesDoPcmso);
    const [riscos, setRiscos] = useState([]);
    const [isAddingRisks, setIsAddingRisks] = useState(false);

    const handleFileChange = (file, exameId) => {
        setExames(prevExames => prevExames.map(ex =>
            ex.id === exameId ? { ...ex, file } : ex
        ));
    };

    const handleConfirmRiscos = (novosRiscos) => {
        setRiscos(novosRiscos);
        setIsAddingRisks(false);
    };

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={() => onBack()} className="flex items-center text-blue-600 hover:text-blue-800 mr-4 p-2 rounded-full hover:bg-blue-50 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">Cadastrar Aso</h1>
                    </div>

                    <div className="space-y-6">
                        <FormSection title="Dados do Registro Profissional">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SearchableSelect options={mockRegistrosProfissionais} placeholder="Selecione um registro profissional *" />
                                <InfoField label="Data de Nasc./Idade" value={`${mockFuncionarioData.dataNascimento} (45 anos)`} />
                            </div>
                        </FormSection>

                        <FormSection title="Informações Básicas">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <InfoField label="Empresa" value={mockFuncionarioData.empresa} />
                                <InfoField label="Setor" value={mockFuncionarioData.setor} />
                                <InfoField label="Função" value={mockFuncionarioData.funcao} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <InputField label="Data do Aso *" type="date" />
                                <SelectField label="Tipo de ASO *" options={['Admissional', 'Periódico']} />
                                <div className="flex items-center space-x-4 pt-6">
                                    <RadioOption name="retificacao" value="original" label="Original" defaultChecked />
                                    <RadioOption name="retificacao" value="retificacao" label="Retificação" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <Search size={14} /> Buscar dados do PCMSO para este ASO
                                </button>
                            </div>
                        </FormSection>

                        <FormSection title="Exames">
                            <div className="flex justify-end mb-4">
                                <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-blue-700 flex items-center gap-2">
                                    <Plus size={16} /> Adicionar Exame
                                </button>
                            </div>
                            <ul className="space-y-2">
                                {exames.map(exame => <ExameUploadItem key={exame.id} exame={exame} onFileChange={handleFileChange} />)}
                            </ul>
                        </FormSection>

                        <FormSection title="Riscos Trabalhistas">
                            <p className="text-sm text-gray-500 mb-4">Confirme os riscos que este profissional está exposto neste ASO.</p>
                            <div className="flex gap-2 mb-4">
                                <button onClick={() => setIsAddingRisks(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-blue-700 flex items-center gap-2">
                                    <Plus size={16} /> Adicionar Riscos
                                </button>
                            </div>
                            <div className="space-y-2">
                                {riscos.length > 0 ? riscos.map(risco => (
                                    <div key={risco.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                        <span className="text-sm text-gray-800">{risco.nome}</span>
                                        <button onClick={() => setRiscos(prev => prev.filter(r => r.id !== risco.id))} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                                    </div>
                                )) : <p className="text-sm text-gray-400 text-center py-4">Nenhum risco adicionado.</p>}
                            </div>
                        </FormSection>

                        <FormSection title="Responsáveis">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SearchableSelect label="Médico Examinador *" options={mockMedicos} placeholder="Selecione um médico..." />
                                <SearchableSelect label="Médico Responsável pelo PCMSO" options={mockMedicos} placeholder="Selecione um médico..." />
                            </div>
                        </FormSection>

                        <FormSection title="Conclusão do Aso">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                                <SelectField label="Resultado" options={['Apto', 'Inapto']} />
                                <InputField label="Inapto (dias)" type="number" />
                                <SelectField label="Não concluir agora" options={['Sim', 'Não']} />
                                <SelectField label="Não informar" options={['Sim', 'Não']} />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <textarea className="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
                            </div>
                        </FormSection>

                        <FormSection title="Conclusão Detalhada (Colaborador)">
                            <textarea className="w-full p-2 border border-gray-300 rounded-md" rows="4"></textarea>
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
            {isAddingRisks && <AdicionarRiscosModal initialSelectedRiscos={riscos} onConfirm={handleConfirmRiscos} onCancel={() => setIsAddingRisks(false)} />}
        </>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela Modal para Adicionar Riscos
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const AdicionarRiscosModal = ({ initialSelectedRiscos, onConfirm, onCancel }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRiscos, setSelectedRiscos] = useState(initialSelectedRiscos);

    const handleToggleRisco = (risco) => {
        setSelectedRiscos(prev =>
            prev.find(r => r.id === risco.id)
                ? prev.filter(r => r.id !== risco.id)
                : [...prev, risco]
        );
    };

    const filteredRiscos = useMemo(() =>
        mockRiscosCatalogo.filter(r =>
            r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.grupo.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]
    );

    const groupedRiscos = useMemo(() =>
            filteredRiscos.reduce((acc, risco) => {
                (acc[risco.grupo] = acc[risco.grupo] || []).push(risco);
                return acc;
            }, {})
        , [filteredRiscos]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Adicionar Riscos</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou grupo de risco..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-4">
                        {Object.keys(groupedRiscos).map(grupo => (
                            <div key={grupo}>
                                <h3 className="font-semibold text-gray-600 mb-2">{grupo}</h3>
                                <ul className="space-y-2">
                                    {groupedRiscos[grupo].map(risco => (
                                        <li
                                            key={risco.id}
                                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${selectedRiscos.find(r => r.id === risco.id) ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                            onClick={() => handleToggleRisco(risco)}
                                        >
                                            <span className="text-sm text-gray-800">{risco.nome}</span>
                                            {selectedRiscos.find(r => r.id === risco.id) && <Check size={18} className="text-blue-600" />}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-4 border-t bg-gray-50">
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md font-semibold hover:bg-gray-300">Cancelar</button>
                    <button onClick={() => onConfirm(selectedRiscos)} className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700">Confirmar ({selectedRiscos.length})</button>
                </div>
            </div>
        </div>
    );
};


//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Sub-Componentes
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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

const SearchableSelect = ({ options, placeholder, label }) => (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            <select className="w-full appearance-none bg-white pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                <option>{placeholder}</option>
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
            </select>
            <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-2 bg-gray-100 border-l border-gray-300 rounded-r-md">
                <button className="text-green-600 hover:text-green-800" title="Buscar"><Search size={16} /></button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button className="text-red-600 hover:text-red-800" title="Limpar"><X size={16} /></button>
            </div>
        </div>
    </div>
);

const RadioOption = (props) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="radio" {...props} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
        <span className="text-sm text-gray-700">{props.label}</span>
    </label>
);

const ExameUploadItem = ({ exame, onFileChange }) => {
    const fileInputRef = useRef(null);
    const handleButtonClick = () => fileInputRef.current.click();

    return (
        <li className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-md border">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <FileText size={18} className="text-gray-500" />
                <span className="text-sm text-gray-800 font-medium">{exame.codigo} - {exame.nome}</span>
            </div>
            <div className="flex items-center gap-2">
                {exame.file ? (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        <Check size={16} />
                        <span>{exame.file.name}</span>
                        <button onClick={() => onFileChange(null, exame.id)} className="text-green-700 hover:text-green-900"><X size={14} /></button>
                    </div>
                ) : (
                    <button onClick={handleButtonClick} className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100 flex items-center gap-2">
                        <Upload size={14} /> Anexar Resultado
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={(e) => onFileChange(e.target.files[0], exame.id)} className="hidden" />
                <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
            </div>
        </li>
    );
};

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
