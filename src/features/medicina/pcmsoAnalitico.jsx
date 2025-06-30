import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Type } from 'lucide-react';

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Principal da Aplicação
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export default function PcmsoAnalitico() {
    const [view, setView] = useState('list'); // 'list' ou 'form'
    const [selectedPcmso, setSelectedPcmso] = useState(null);

    const handleCreateNew = () => {
        setSelectedPcmso(null);
        setView('form');
    };

    const handleEdit = (pcmso) => {
        setSelectedPcmso(pcmso);
        setView('form');
    };

    const handleBackToList = () => {
        setView('list');
    };

    if (view === 'list') {
        return <PcmsoAnaliticoList onCreateNew={handleCreateNew} onEdit={handleEdit} />;
    }

    return <PcmsoAnaliticoForm pcmsoData={selectedPcmso} onBack={handleBackToList} />;
}

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Dados Mockados
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const mockPcmsoAnaliticoList = [
    { id: 1, empresa: 'WAYSTER HENRIQUE CRUZ DE MELO', responsavel: 'Dr. Carlos Andrade', dataInicio: '2023-01-01', dataFim: '2023-12-31', dataCriacao: '2024-01-15T10:00:00' },
    { id: 2, empresa: 'Construtora Segura Ltda.', responsavel: 'Dra. Ana Paula Faria', dataInicio: '2023-06-01', dataFim: '2024-05-31', dataCriacao: '2024-06-10T14:30:00' },
    { id: 3, empresa: 'Transportadora Veloz S.A.', responsavel: 'Dr. Carlos Andrade', dataInicio: '2024-01-01', dataFim: '2024-12-31', dataCriacao: '2025-01-20T09:00:00' },
];

const mockEmpresas = [
    { id: 1, nome: 'WAYSTER HENRIQUE CRUZ DE MELO', documento: '59.413.555/0001-08' },
    { id: 2, nome: 'Construtora Segura Ltda.', documento: '12.345.678/0001-99' },
];

const mockPrestadores = [
    { id: 1, nome: 'MEDICO TESTE WAYSTER' },
    { id: 2, nome: 'Dra. Ana Paula Faria' },
    { id: 3, nome: 'Dr. João Ricardo Neves' }
];

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Listagem de PCMSO Analítico
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const PcmsoAnaliticoList = ({ onCreateNew, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredData = useMemo(() =>
        mockPcmsoAnaliticoList.filter(item =>
            item.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">PCMSO Analítico</h1>
                    <button
                        onClick={onCreateNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        Cadastrar PCMSO Analítico
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="relative w-full sm:w-1/3 mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Procure por Empresa ou Responsável"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                {['Data Criação', 'Empresa', 'Responsável', 'Data de Início', 'Data de Fim', 'Ações'].map(header => (
                                    <th key={header} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{header}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(item.dataCriacao)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{item.empresa}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{item.responsavel}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(item.dataInicio)}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(item.dataFim)}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-3">
                                            <button onClick={() => onEdit(item)} className="text-gray-500 hover:text-blue-600"><Edit size={18} /></button>
                                            <button className="text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
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
                </div>
            </div>
        </div>
    );
};


//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Cadastro de PCMSO Analítico
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const PcmsoAnaliticoForm = ({ pcmsoData, onBack }) => {
    const [selectedEmpresa] = useState(mockEmpresas[0]);
    const discussionText = "Após a análise comparativa, observamos que os dados coletados apresentam um padrão consistente com os parâmetros esperados para a população avaliada. As variações identificadas entre os diferentes períodos analisados indicam que houve uma melhora significativa nos indicadores relacionados à saúde ocupacional, especialmente no que diz respeito à redução dos fatores de risco identificados inicialmente.\n\nOs resultados obtidos pelo médico responsável evidenciam a eficácia das intervenções propostas, que incluem ajustes no ambiente de trabalho, treinamentos específicos e acompanhamento contínuo dos colaboradores. A análise detalhada demonstra que a aplicação destas medidas resultou em um impacto positivo tanto na qualidade de vida dos trabalhadores quanto na produtividade da empresa.\n\nDestaca-se ainda a importância da continuidade do monitoramento e da atualização periódica dos protocolos de segurança, a fim de garantir a manutenção dos avanços alcançados e a prevenção de possíveis agravamentos. Recomenda-se que futuras análises sejam realizadas em intervalos regulares para acompanhar a evolução dos indicadores e ajustar as ações conforme necessário.\n\nEm suma, a análise comparativa não apenas confirma a validade das medidas adotadas, como também aponta caminhos para aprimoramentos futuros que podem contribuir para um ambiente laboral mais saudável e seguro.";

    return (
        <div className="bg-gray-100 p-4 sm:p-6 lg:p-8 min-h-screen font-sans">
            <div className="mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Cadastro de PCMSO Analítico</h1>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-6">
                    {/* Seção Empresa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                        <div className="p-4 bg-gray-100 rounded-md">
                            <p className="text-gray-900 font-semibold">{selectedEmpresa.nome}</p>
                            <p className="text-sm text-gray-500">Documento: {selectedEmpresa.documento}</p>
                        </div>
                    </div>

                    {/* Seção Filtro e Médico */}
                    <CustomSearchableSelect label="Selecione uma empresa para filtrar *" options={mockEmpresas} />
                    <CustomSearchableSelect label="Médico Responsável" options={mockPrestadores} />

                    {/* Seção Discussão */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Discussão sobre os resultados obtidos por meio da Análise Comparativa *</label>
                        <RichTextEditor initialContent={discussionText} />
                    </div>

                    {/* Seção Período */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput label="Data de Início *" type="date" defaultValue="2025-06-19" />
                            <CustomInput label="Data de Fim *" type="date" defaultValue="2025-06-25" />
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-4">
                    <button onClick={onBack} className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors">Cancelar</button>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors">Salvar</button>
                </div>
            </div>
        </div>
    );
};


//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Sub-Componentes Reutilizáveis
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const RichTextEditor = ({ initialContent }) => (
    <div className="border border-gray-200 rounded-lg">
        <div className="flex items-center p-2 bg-gray-50 border-b border-gray-200 space-x-2">
            <button className="p-2 rounded hover:bg-gray-200"><Bold size={16}/></button>
            <button className="p-2 rounded hover:bg-gray-200"><Italic size={16}/></button>
            <button className="p-2 rounded hover:bg-gray-200"><Underline size={16}/></button>
            <div className="w-px h-5 bg-gray-300"></div>
            <button className="p-2 rounded hover:bg-gray-200"><AlignLeft size={16}/></button>
            <button className="p-2 rounded hover:bg-gray-200"><AlignCenter size={16}/></button>
            <button className="p-2 rounded hover:bg-gray-200"><AlignRight size={16}/></button>
            <div className="w-px h-5 bg-gray-300"></div>
            <button className="p-2 rounded hover:bg-gray-200"><List size={16}/></button>
            <button className="p-2 rounded hover:bg-gray-200"><Type size={16}/></button>
        </div>
        <textarea
            className="w-full h-48 p-3 border-none focus:ring-0 resize-y"
            defaultValue={initialContent}
        ></textarea>
    </div>
);

const CustomInput = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
    </div>
);

const CustomSearchableSelect = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <select {...props} className="w-full appearance-none bg-white px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {props.placeholder && <option value="">{props.placeholder}</option>}
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
            </select>
            <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-2 bg-gray-100 border-l border-gray-300 rounded-r-md">
                <button className="text-gray-600 hover:text-blue-600"><Search size={16} /></button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button className="text-blue-600 hover:text-blue-800"><Plus size={16} /></button>
            </div>
        </div>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p>Mostrando {startItem} até {endItem} de {totalItems} registros</p>
            <div className="flex items-center gap-1 mt-4 sm:mt-0">
                <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <span className="px-3 py-1 font-semibold">{currentPage} de {totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronRight size={16} /></button>
                <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsRight size={16} /></button>
            </div>
        </div>
    );
};
