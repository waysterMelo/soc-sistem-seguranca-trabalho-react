import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    User, Building, Calendar, ClipboardList, ArrowLeft, Save, X, Check, Home, UserPlus
} from 'lucide-react';

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Principal
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export default function AfastamentoApp() {
    const [view, setView] = useState('list'); // 'list' ou 'form'
    const [selectedAfastamento, setSelectedAfastamento] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, id: Date.now() });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateNew = () => {
        setSelectedAfastamento(null);
        setView('form');
    };

    const handleEdit = (afastamento) => {
        setSelectedAfastamento(afastamento);
        setView('form');
    };

    const handleBackToList = (message) => {
        setView('list');
        if (message) showNotification(message, 'success');
    };

    const handleDelete = (id) => {
        showNotification('Afastamento excluído com sucesso.', 'warning');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Notification notification={notification} />
            {view === 'list' ? (
                <AfastamentoList
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <AfastamentoForm
                    afastamentoData={selectedAfastamento}
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

const SearchableSelect = ({ label, options, placeholder, value, onSelect }) => (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            <input
                type="text"
                readOnly
                value={value ? value.nome : ''}
                placeholder={placeholder}
                className="w-full appearance-none bg-white pl-3 pr-16 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-1">
                <button className="p-1.5 rounded text-green-600 hover:bg-green-100" title="Buscar"><Search size={16} /></button>
                <button className="p-1.5 rounded text-red-600 hover:bg-red-100" title="Limpar"><X size={16} /></button>
            </div>
        </div>
    </div>
);

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Dados Mockados
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const mockAfastamentos = [
    { id: 1, funcionario: 'MARINA GARCIA LOPES', motivo: 'Licença Médica', empresa: 'WAYSTER HENRIQUE CRUZ DE MELO', setor: 'Comercial', funcao: 'Gerente', dataInicio: '2025-06-05', dataFim: '2025-06-25' },
];
const mockRegistros = [{ id: 1, nome: 'MARINA GARCIA LOPES - Gerente Comercial e de Projetos' }];
const mockEmitentes = [{ id: 1, nome: 'MÉDICO TESTE WAYSTER' }];
const mockMotivos = [{ id: 1, nome: '07 - Acompanhamento - Licença para acompanhamento de membro da família enfermo' }];
const mockCids = [
    { id: 1, codigo: 'A09.1', descricao: 'Gastroenterite e colite de origem infecciosa' },
    { id: 2, codigo: 'Z99.1', descricao: 'Dependencia de respirador' },
    { id: 3, codigo: 'Z99.2', descricao: 'Dependencia de dialise renal' },
];

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Listagem de Afastamentos
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const AfastamentoList = ({ onCreateNew, onEdit, onDelete }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Atestado de Afastamento</h1>
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
                            <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <UserPlus size={18} /> Funcionários
                            </button>
                            <button onClick={onCreateNew} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Plus size={18} /> Novo Afastamento
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                {['Funcionário', 'Motivo', 'Empresa', 'Setor', 'Função', 'Data de Início', 'Data de Fim', 'Ações'].map(h => <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{h}</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            <tr><td colSpan="8" className="text-center py-10 text-gray-500">Nenhum registro encontrado!</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Tela de Cadastro de Afastamento
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const AfastamentoForm = ({ afastamentoData, onBack }) => {
    const [isCidModalOpen, setIsCidModalOpen] = useState(false);
    const [selectedCid, setSelectedCid] = useState(mockCids[0]);

    const handleSelectCid = (cid) => {
        setSelectedCid(cid);
        setIsCidModalOpen(false);
    };

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={() => onBack()} className="flex items-center text-blue-600 hover:text-blue-800 mr-4 p-2 rounded-full hover:bg-blue-50 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">Cadastro de Afastamento</h1>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                        <SearchableSelect label="Registro Profissional *" options={mockRegistros} value={mockRegistros[0]} />
                        <SearchableSelect label="Emitente *" options={mockEmitentes} value={mockEmitentes[0]} />
                        <SearchableSelect label="Motivo do Afastamento *" options={mockMotivos} value={mockMotivos[0]} />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CID</label>
                            <div className="relative">
                                <input type="text" readOnly value={selectedCid ? `${selectedCid.codigo} - ${selectedCid.descricao}` : ''} className="w-full appearance-none bg-white pl-3 pr-16 py-2 border border-gray-300 rounded-md cursor-pointer" onClick={() => setIsCidModalOpen(true)} />
                                <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-1">
                                    <button onClick={() => setIsCidModalOpen(true)} className="p-1.5 rounded text-green-600 hover:bg-green-100" title="Buscar CID"><Search size={16} /></button>
                                    <button onClick={() => setSelectedCid(null)} className="p-1.5 rounded text-red-600 hover:bg-red-100" title="Limpar"><X size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectField label="Tipo de Acidente" options={['Não Informado']} />
                            <InputField label="CNPJ *" />
                            <SelectField label="Ônus da Remuneração *" options={['Selecione']} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Início do Afastamento" type="date" defaultValue="2025-06-05" />
                            <InputField label="Final do Afastamento" type="date" defaultValue="2025-06-25" />
                            <InputField label="Total de Dias" value="20" disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                            <textarea defaultValue="nada" className="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">O afastamento decorre da mesma doença que gerou o afastamento anterior, dentro de 60 dias?</p>
                            <div className="flex gap-4"><RadioOption name="mesma_doenca" label="Sim" /><RadioOption name="mesma_doenca" label="Não" /></div>
                        </div>
                        <div className="space-y-2">
                            <CheckboxOption label="Alterar status do funcionário para afastado" />
                            <CheckboxOption label="Exibir RG do funcionário no atestado" />
                            <CheckboxOption label="Exibir CPF do funcionário no atestado" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Retificação</label>
                            <div className="flex gap-4"><RadioOption name="retificacao" label="Original" defaultChecked /><RadioOption name="retificacao" label="Retificação" /></div>
                        </div>
                        <InputField label="Número do recibo do evento no eSocial do Afastamento para caso de retificação" />
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={() => onBack()} className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700">Cancelar</button>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 flex items-center gap-2"><Save size={18} /> Salvar</button>
                    </div>
                </div>
            </div>
            {isCidModalOpen && <CidModal onSelect={handleSelectCid} onCancel={() => setIsCidModalOpen(false)} />}
        </>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Componente Modal para Seleção de CID
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const CidModal = ({ onSelect, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">CID</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Procure por algum registro..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"/>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="w-8 p-2"><input type="checkbox" /></th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Código</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Descrição</th>
                            </tr>
                            </thead>
                            <tbody>
                            {mockCids.map(cid => (
                                <tr key={cid.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2 text-center"><input type="checkbox" /></td>
                                    <td className="py-2 px-4 text-sm font-mono">{cid.codigo}</td>
                                    <td className="py-2 px-4 text-sm">{cid.descricao}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-4 border-t bg-gray-50">
                    <button onClick={onCancel} className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700">Cancelar</button>
                    <button onClick={() => onSelect(mockCids[0])} className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700">Selecionar</button>
                </div>
            </div>
        </div>
    );
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Sub-componentes do Formulário
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
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

const RadioOption = (props) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="radio" {...props} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
        <span className="text-sm text-gray-700">{props.label}</span>
    </label>
);

const CheckboxOption = ({ label, ...props }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" {...props} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);
