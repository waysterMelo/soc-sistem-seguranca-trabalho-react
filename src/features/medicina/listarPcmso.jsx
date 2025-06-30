import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    FileText, Shield, X, Check, Bold, Italic, Underline, AlignLeft, AlignCenter,
    AlignRight, List, Type, Save, ArrowLeft, Frown, Smile, ClipboardList, Filter
} from 'lucide-react';

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Principal da Aplicação
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export default function ListarPcmso() {
    const [view, setView] = useState('list');
    const [selectedPcmso, setSelectedPcmso] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreateNew = () => {
        setSelectedPcmso(null);
        setView('form');
        showNotification('Novo PCMSO iniciado com sucesso');
    };

    const handleEdit = (pcmso) => {
        setSelectedPcmso(pcmso);
        setView('form');
        showNotification(`Editando PCMSO: ${pcmso.empresa}`);
    };

    const handleBackToList = () => {
        setView('list');
        showNotification('Alterações salvas com sucesso!', 'success');
    };

    const handleDelete = (id) => {
        showNotification('PCMSO excluído com sucesso', 'warning');
        // Lógica de exclusão iria aqui
    };

    if (view === 'list') {
        return (
            <>
                <Notification message={notification?.message} type={notification?.type} />
                <PcmsoList
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </>
        );
    }

    return (
        <>
            <Notification message={notification?.message} type={notification?.type} />
            <PcmsoForm
                pcmsoData={selectedPcmso}
                onBack={handleBackToList}
                showNotification={showNotification}
            />
        </>
    );
}

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente de Notificação
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const Notification = ({ message, type }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
            'bg-yellow-500';

    return (
        <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn`}>
            {type === 'success' ? <Smile size={20} /> : <Frown size={20} />}
            <span>{message}</span>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Dados Mockados (mantidos originais)
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const mockPcmsoList = [
    { id: 1, empresa: 'WAYSTER HENRIQUE CRUZ DE MELO', unidade: 'Matriz - Belo Horizonte', dataDocumento: '2024-01-15', dataVencimento: '2025-01-15', situacao: 'Ativo' },
    { id: 2, empresa: 'Construtora Segura Ltda.', unidade: 'Unidade Industrial', dataDocumento: '2023-11-20', dataVencimento: '2024-11-20', situacao: 'Ativo' },
    { id: 3, empresa: 'Transportadora Veloz S.A.', unidade: 'Garagem Central', dataDocumento: '2024-03-10', dataVencimento: '2025-03-10', situacao: 'Ativo' },
    { id: 4, empresa: 'Indústria Metalúrgica Pesada', unidade: 'Forjaria 2', dataDocumento: '2022-08-01', dataVencimento: '2023-08-01', situacao: 'Inativo' },
    { id: 5, empresa: 'Rede de Varejo Nacional', unidade: 'Centro de Distribuição SP', dataDocumento: '2024-05-30', dataVencimento: '2025-05-30', situacao: 'Ativo' },
    { id: 6, empresa: 'Consultoria e Projetos T.I.', unidade: 'Escritório Principal', dataDocumento: '2023-09-01', dataVencimento: '2024-09-01', situacao: 'Ativo' },
];

const mockEmpresas = [
    { id: 1, nome: 'WAYSTER HENRIQUE CRUZ DE MELO', documento: '59.413.555/0001-08' },
    { id: 2, nome: 'Construtora Segura Ltda.', documento: '12.345.678/0001-99' },
];

const mockPrestadores = [
    { id: 1, nome: 'Dr. Carlos Andrade' },
    { id: 2, nome: 'Dra. Ana Paula Faria' },
    { id: 3, nome: 'Dr. João Ricardo Neves' }
];

const mockSetores = [
    {id: 1, nome: 'Administrativo'},
    {id: 2, nome: 'Produção'},
    {id: 3, nome: 'Logística'}
];

const mockFuncoes = [
    {id: 1, nome: 'Auxiliar Administrativo'},
    {id: 2, nome: 'Operador de Máquinas'},
    {id: 3, nome: 'Motorista de Empilhadeira'}
];

const mockRiscosPGR = [
    {id: 1, grupo: 'Físico', descricao: 'Ruído Contínuo'},
    {id: 2, grupo: 'Ergonômico', descricao: 'Postura Inadequada'}
];

const mockExames = [
    {id: 1, nome: 'Audiometria'},
    {id: 2, nome: 'Acuidade Visual'},
    {id: 3, nome: 'Hemograma Completo'}
];

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Listagem de PCMSO (Design Aprimorado)
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const PcmsoList = ({ onCreateNew, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('todos');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const itemsPerPage = 5;

    // Filtra e ordena os dados
    const filteredData = useMemo(() => {
        let result = [...mockPcmsoList];

        // Filtro por termo de busca
        if (searchTerm) {
            result = result.filter(item =>
                item.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.unidade.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por status
        if (selectedStatus !== 'todos') {
            result = result.filter(item => item.situacao === selectedStatus);
        }

        // Ordenação
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [searchTerm, selectedStatus, sortConfig]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('todos');
        setSortConfig({ key: null, direction: 'asc' });
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className=" mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">PCMSO - Programa de Controle Médico de Saúde Ocupacional</h1>
                        <p className="text-gray-600 mt-1">Gerencie todos os programas de saúde ocupacional da empresa</p>
                    </div>
                    <button
                        onClick={onCreateNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                        <Plus size={18} />
                        Cadastrar PCMSO
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Procure por Empresa ou Unidade"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                                <Filter size={16} className="text-gray-500 mr-2" />
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="bg-transparent focus:outline-none text-sm"
                                >
                                    <option value="todos">Todos os status</option>
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>
                            </div>

                            {(searchTerm || selectedStatus !== 'todos') && (
                                <button
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                                >
                                    <X size={16} className="mr-1" /> Limpar filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ClipboardList size={48} className="text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum PCMSO encontrado</h3>
                            <p className="text-gray-500 max-w-md">
                                Sua busca não retornou resultados. Tente ajustar os filtros ou cadastre um novo PCMSO.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        {[
                                            { key: 'empresa', label: 'Empresa' },
                                            { key: 'unidade', label: 'Unidade Operacional' },
                                            { key: 'dataDocumento', label: 'Data do Documento' },
                                            { key: 'dataVencimento', label: 'Data de Vencimento' },
                                            { key: 'situacao', label: 'Situação' },
                                            { key: 'acoes', label: 'Ações' }
                                        ].map(header => (
                                            <th
                                                key={header.key}
                                                className={`text-left py-3 px-4 font-semibold text-gray-600 text-sm ${
                                                    header.key !== 'acoes' ? 'cursor-pointer hover:bg-gray-200' : ''
                                                }`}
                                                onClick={() => header.key !== 'acoes' && handleSort(header.key)}
                                            >
                                                <div className="flex items-center">
                                                    {header.label}
                                                    {sortConfig.key === header.key && (
                                                        <span className="ml-1">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {paginatedData.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-700">{item.empresa}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{item.unidade}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{item.dataDocumento}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                <div className="flex items-center">
                                                    {item.dataVencimento}
                                                    {new Date(item.dataVencimento) < new Date() && (
                                                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Vencido</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.situacao === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.situacao}
                          </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => onEdit(item)}
                                                        className="text-gray-500 hover:text-blue-600 transition-colors"
                                                        aria-label="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(item.id)}
                                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                                        aria-label="Excluir"
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

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                totalItems={filteredData.length}
                                itemsPerPage={itemsPerPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Cadastro/Edição de PCMSO (Design Aprimorado)
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const PcmsoForm = ({ pcmsoData, onBack, showNotification }) => {
    const [activeTab, setActiveTab] = useState('capa');
    const [selectedEmpresa, setSelectedEmpresa] = useState(mockEmpresas[0]);
    const [richTextContent, setRichTextContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulando requisição
        setTimeout(() => {
            setIsSaving(false);
            showNotification('PCMSO salvo com sucesso!', 'success');
            onBack();
        }, 1500);
    };

    return (
        <div className="bg-gray-100 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
            <div className=" mx-auto">
                <div className="flex items-center mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
                    >
                        <ArrowLeft size={20} className="mr-1" /> Voltar
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {pcmsoData ? 'Editar PCMSO' : 'Cadastrar PCMSO'}
                    </h1>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                <p className="text-gray-900 font-semibold">{selectedEmpresa.nome}</p>
                                <p className="text-sm text-gray-500">Documento: {selectedEmpresa.documento}</p>
                            </div>
                        </div>
                        <div>
                            <SearchableSelect
                                label="Empresas que não possuem PCMSO"
                                options={mockEmpresas}
                                onSelect={(empresa) => {
                                    setSelectedEmpresa(empresa);
                                    showNotification(`Empresa selecionada: ${empresa.nome}`, 'success');
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <CustomInput label="Data do Documento *" type="date" defaultValue="2025-06-12" />
                        <CustomInput label="Data de Vencimento" type="date" defaultValue="2026-06-12" />
                        <SearchableSelect label="Médico Responsável *" options={mockPrestadores} />
                        <SearchableSelect label="Elaboradores (máx. 6)" options={mockPrestadores} isMulti />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex flex-wrap gap-2" aria-label="Tabs">
                            {['capa', 'introducao', 'sobre', 'conclusao', 'planejamento'].map((tab) => (
                                <TabButton
                                    key={tab}
                                    tabName={tab}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                >
                                    {tab === 'capa' && 'Capa'}
                                    {tab === 'introducao' && 'Introdução'}
                                    {tab === 'sobre' && 'Sobre o Pcmso'}
                                    {tab === 'conclusao' && 'Conclusão'}
                                    {tab === 'planejamento' && 'Planejamento Anual'}
                                </TabButton>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-6">
                        <RichTextEditor value={richTextContent} onChange={setRichTextContent} />
                        <div className="flex justify-between items-center mt-4">
                            <button className="bg-yellow-400 text-yellow-900 px-3 py-2 text-sm font-semibold rounded-md hover:bg-yellow-500 flex items-center gap-2">
                                <FileText size={16} />
                                Textos Padrões
                            </button>
                            <div className="text-sm text-gray-500">
                                {richTextContent.length > 0 ? `${richTextContent.split(/\s+/).length} palavras` : 'Comece a digitar...'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <p className="text-sm text-gray-600 mb-4">Para cadastrar ou visualizar os exames e os Riscos PGR, escolha o setor e a função e clique nas seções.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableSelect label="Setor" options={mockSetores} placeholder="Selecione um setor..." />
                        <SearchableSelect label="Função" options={mockFuncoes} placeholder="Selecione uma ou mais funções..." isMulti />
                    </div>
                    <div className="mt-6 space-y-4">
                        <Accordion title="Exames" icon={<FileText className="text-blue-600" />} data={mockExames} />
                        <Accordion title="Riscos do PGR" icon={<Shield className="text-orange-600" />} data={mockRiscosPGR} />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        onClick={onBack}
                        className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} /> Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Salvar PCMSO
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componentes Reutilizáveis Aprimorados
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Componente para Abas
const TabButton = ({ tabName, activeTab, setActiveTab, children }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`whitespace-nowrap py-3 px-4 font-medium text-sm rounded-t-lg ${
            activeTab === tabName
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
);

// Componente de Editor de Texto Rico (Aprimorado)
const RichTextEditor = ({ value, onChange }) => {
    const [content, setContent] = useState(value || '');

    useEffect(() => {
        if (value !== content) {
            setContent(value);
        }
    }, [value]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setContent(newValue);
        onChange(newValue);
    };

    const applyFormat = (format) => {
        // Implementação real de formatação seria mais complexa
        showFormatMessage(format);
    };

    const showFormatMessage = (format) => {
        // Em implementação real, isso aplicaria a formatação
        alert(`Formatação "${format}" aplicada!`);
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex flex-wrap items-center p-2 bg-gray-50 border-b border-gray-200 gap-1">
                <button
                    onClick={() => applyFormat('bold')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Negrito"
                >
                    <Bold size={16}/>
                </button>
                <button
                    onClick={() => applyFormat('italic')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Itálico"
                >
                    <Italic size={16}/>
                </button>
                <button
                    onClick={() => applyFormat('underline')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Sublinhado"
                >
                    <Underline size={16}/>
                </button>
                <div className="w-px h-5 bg-gray-300"></div>
                <button
                    onClick={() => applyFormat('align-left')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Alinhar à esquerda"
                >
                    <AlignLeft size={16}/>
                </button>
                <button
                    onClick={() => applyFormat('align-center')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Centralizar"
                >
                    <AlignCenter size={16}/>
                </button>
                <button
                    onClick={() => applyFormat('align-right')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Alinhar à direita"
                >
                    <AlignRight size={16}/>
                </button>
                <div className="w-px h-5 bg-gray-300"></div>
                <button
                    onClick={() => applyFormat('list')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Lista"
                >
                    <List size={16}/>
                </button>
                <button
                    onClick={() => applyFormat('font')}
                    className="p-2 rounded hover:bg-gray-200"
                    aria-label="Fonte"
                >
                    <Type size={16}/>
                </button>
            </div>
            <textarea
                className="w-full h-64 p-4 border-none focus:ring-0 resize-y text-gray-700"
                placeholder="Digite o conteúdo aqui..."
                value={content}
                onChange={handleChange}
            ></textarea>
        </div>
    );
};

// Componente Acordeão para Exames e Riscos
const Accordion = ({ title, icon, data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const toggleItem = (item) => {
        setSelectedItems(prev =>
            prev.some(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        );
    };

    return (
        <div className="border border-gray-200 rounded-md overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span>{title}</span>
                </div>
                <ChevronRight
                    className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div className="border-t border-gray-200 bg-white">
                    <ul className="divide-y divide-gray-200">
                        {data.map(item => (
                            <li key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                <div>
                  <span className="text-sm font-medium text-gray-800 block">
                    {item.descricao || item.nome}
                  </span>
                                    {item.grupo && (
                                        <span className="text-xs text-gray-500 mt-1">{item.grupo}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => toggleItem(item)}
                                    className={`p-2 rounded-full ${
                                        selectedItems.some(i => i.id === item.id)
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                    aria-label={selectedItems.some(i => i.id === item.id) ? "Desselecionar" : "Selecionar"}
                                >
                                    {selectedItems.some(i => i.id === item.id) ? <Check size={16} /> : <Plus size={16} />}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2">
                            <Plus size={16} /> Adicionar novo item
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente de Input Customizado
const CustomInput = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            {...props}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
    </div>
);

// Componente de Seletor com Busca (Aprimorado)
const SearchableSelect = ({ label, options, isMulti = false, onSelect, placeholder = "Selecione..." }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(isMulti ? [] : null);

    const filteredOptions = options.filter(option =>
        option.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        if (isMulti) {
            const newSelected = selected.some(item => item.id === option.id)
                ? selected.filter(item => item.id !== option.id)
                : [...selected, option];
            setSelected(newSelected);
            onSelect && onSelect(newSelected);
        } else {
            setSelected(option);
            onSelect && onSelect(option);
            setIsOpen(false);
        }
    };

    const removeSelected = (option) => {
        if (isMulti) {
            const newSelected = selected.filter(item => item.id !== option.id);
            setSelected(newSelected);
            onSelect && onSelect(newSelected);
        } else {
            setSelected(null);
            onSelect && onSelect(null);
        }
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <div
                    className="flex flex-wrap items-center min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer gap-1"
                    onClick={() => setIsOpen(true)}
                >
                    {isMulti ? (
                        selected.length > 0 ? (
                            selected.map(item => (
                                <span key={item.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center text-sm">
                  {item.nome}
                                    <button
                                        type="button"
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSelected(item);
                                        }}
                                    >
                    <X size={14} />
                  </button>
                </span>
                            ))
                        ) : (
                            <span className="text-gray-400">{placeholder}</span>
                        )
                    ) : (
                        selected ? (
                            <span className="text-gray-800">{selected.nome}</span>
                        ) : (
                            <span className="text-gray-400">{placeholder}</span>
                        )
                    )}

                    <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-2 bg-gray-100 border-l border-gray-300 rounded-r-md">
                        <button
                            type="button"
                            className="text-gray-600 hover:text-blue-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(true);
                            }}
                        >
                            <Search size={16} />
                        </button>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Adicionar novo item
                            }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="sticky top-0 bg-white p-2 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <ul>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <li
                                        key={option.id}
                                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                                            (isMulti && selected.some(item => item.id === option.id)) ||
                                            (!isMulti && selected?.id === option.id) ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        <span>{option.nome}</span>
                                        {(isMulti && selected.some(item => item.id === option.id)) && (
                                            <Check className="text-green-500" size={16} />
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-3 text-center text-gray-500">
                                    Nenhum resultado encontrado
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente de Paginação (Aprimorado)
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p className="mb-3 sm:mb-0">Mostrando {startItem} até {endItem} de {totalItems} registros</p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Primeira página"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                        page = i + 1;
                    } else if (currentPage <= 3) {
                        page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                    } else {
                        page = currentPage - 2 + i;
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 rounded-full text-sm font-medium ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                )}

                {totalPages > 5 && currentPage < totalPages - 1 && (
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className={`w-9 h-9 rounded-full text-sm font-medium ${
                            currentPage === totalPages
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {totalPages}
                    </button>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Próxima página"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Última página"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};