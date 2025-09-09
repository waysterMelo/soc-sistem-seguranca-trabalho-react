import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // This import should be in a global file like App.jsx or main.jsx
import ltcatService from '../../api/services/ltcat/ltcatService.js';
import setorService from '../../api/services/cadastros/Setor/setorService.js';

// Importe seus modais
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import PrestadorServicoSearchModal from '../../components/modal/PrestadorServico.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';

import {
    Search, Trash2, Plus, RefreshCw, Paperclip, Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, List, Link2, Image as ImageIcon, X
} from 'lucide-react';

// --- COMPONENTES REUTILIZÁVEIS ---
const FormSection = ({title, children, className}) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        {title && <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
);
const InputWithActions = ({placeholder, value, actions, className = '', onClick}) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            onClick={onClick}
            className={`w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`}
        />
        <div className="absolute right-0 flex">{actions}</div>
    </div>
);
const RichTextEditor = ({name, value, onChange, rows = 6}) => (
    <div className="border border-gray-300 rounded-lg">
        <div className="flex flex-wrap items-center p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <select className="text-sm border-gray-300 rounded-md mr-2">
                <option>Normal</option>
            </select>
            <div className="flex items-center space-x-1">
                {[Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, Link2, ImageIcon].map((Icon, index) => (
                    <button key={index} type="button" className="p-2 text-gray-600 rounded-md hover:bg-gray-200"><Icon
                        size={16}/></button>
                ))}
            </div>
        </div>
        <textarea name={name} value={value || ''} onChange={onChange} rows={rows}
                  className="w-full p-4 focus:outline-none rounded-b-lg"></textarea>
    </div>
);
const TabButton = ({label, isActive, onClick}) => (<button type="button" onClick={onClick}
                                                           className={`px-4 py-3 -mb-px text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{label}</button>);

// --- COMPONENTE PRINCIPAL ---
export default function CadastrarLTCAT() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('capa');

    // Estados para modais
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [isPrestadorModalOpen, setIsPrestadorModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);

    // Estados para seleções
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedProfissionais, setSelectedProfissionais] = useState([]);
    const [selectedSetores, setSelectedSetores] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const ITENS_POR_PAGINA = 5;

    const [ltcatData, setLtcatData] = useState({
        unidadeOperacionalId: null,
        dataDocumento: new Date().toISOString().split('T')[0],
        dataVencimento: '',
        alertaValidadeDias: 60,
        situacao: 'ATIVO',
        cidade: '',
        estado: '',
        comentariosInternos: '',
        condicoesPreliminares: '',
        conteudoCapa: '',
        laudoResponsabilidadeTecnica: '',
        laudoIntroducao: '',
        laudoObjetivos: '',
        laudoConsideracoesGerais: '',
        laudoCriteriosAvaliacao: '',
        recomendacoesTecnicas: '',
        conclusao: '',
        planejamentoAnual: '',
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setLtcatData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const funcoesIds = [...new Set(selectedSetores.flatMap(setor => (setor.funcoes || []).map(f => f.id)))];
        const agentesNocivos = selectedSetores.flatMap(setor =>
            (setor.funcoes || []).flatMap(funcao =>
                (funcao.agentesNocivosEsocial || []).map(agente => ({
                    agenteNocivoId: agente.agenteNocivoCatalogo.id,
                    funcaoId: funcao.id
                }))
            )
        );
        const payload = {
            ...ltcatData,
            prestadoresServicoIds: selectedProfissionais.map(p => p.id),
            funcoesIds: funcoesIds,
            agentesNocivos: agentesNocivos,
            profissionaisAmbientaisIds: [], aparelhosIds: [], bibliografiasIds: [], empresasContratantesIds: [],
        };
        console.log("Enviando para API:", payload);
        // ... Lógica de envio
    };

    // --- Handlers dos Modais ---
    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        setIsEmpresaModalOpen(false);
        setSelectedUnidade(null);
        setLtcatData(p => ({...p, unidadeOperacionalId: null}));
    };
    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setLtcatData(p => ({...p, unidadeOperacionalId: null}));
    };
    const handleSelectUnidade = (unidade) => {
        setSelectedUnidade(unidade);
        setLtcatData(p => ({...p, unidadeOperacionalId: unidade.id, cidade: unidade.cidade, estado: unidade.estado}));
        setIsUnidadeModalOpen(false);
    };
    const handleSelectPrestador = (prestador) => {
        if (!selectedProfissionais.some(p => p.id === prestador.id)) setSelectedProfissionais(prev => [...prev, prestador]);
        setIsPrestadorModalOpen(false);
    };
    const handleRemovePrestador = (prestadorId) => setSelectedProfissionais(prev => prev.filter(p => p.id !== prestadorId));

    const handleSelectSetor = async (setor) => {
        setIsSetorModalOpen(false); // Fecha o modal imediatamente

        // Se o setor já foi adicionado, não faz nada.
        if (selectedSetores.some(s => s.id === setor.id)) {
            return;
        }

        // Mostra um feedback para o usuário
        const loadingToast = toast.loading(`Carregando detalhes do setor: ${setor.nome}...`);

        try {
            // O modal pode retornar um setor "simples". Buscamos o setor completo com as funções.
            const setoresDaEmpresa = await setorService.getSetoresByEmpresa(selectedEmpresa.id);

            // A API retorna um array de setores. Encontramos o que foi selecionado.
            const setorCompleto = setoresDaEmpresa.find(s => s.id === setor.id);

            if (setorCompleto) {
                // Adiciona o setor completo com todas as suas informações (funções, agentes, etc.)
                setSelectedSetores(prev => [...prev, setorCompleto]);
                toast.update(loadingToast, {
                    render: "Detalhes do setor carregados!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });
            } else {
                // Fallback: Adiciona o setor do modal se não encontrar o completo
                toast.update(loadingToast, {
                    render: `Detalhes de "${setor.nome}" não encontrados. Adicionando sem funções.`,
                    type: "warning",
                    isLoading: false,
                    autoClose: 5000
                });
                setSelectedSetores(prev => [...prev, setor]);
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes do setor:", error);
            toast.update(loadingToast, {
                render: `Erro ao carregar detalhes do setor "${setor.nome}".`,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
            // Adiciona o setor do modal como fallback em caso de erro na API
            setSelectedSetores(prev => [...prev, setor]);
        }
    };

    const handleRemoveSetor = (setorId) => setSelectedSetores(prev => prev.filter(s => s.id !== setorId));

    // --- SUB-COMPONENTES DAS ABAS ---
    const TabCapa = () => <RichTextEditor name="conteudoCapa" value={ltcatData.conteudoCapa}
                                          onChange={handleInputChange}/>;
    const TabProfissionais = () => (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-600">Profissionais responsáveis *</label>
                <InputWithActions placeholder="Clique para buscar um profissional"
                                  actions={<button type="button" onClick={() => setIsPrestadorModalOpen(true)}
                                                   className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                      <Search size={18}/></button>}/>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600">Profissionais Selecionados</label>
                <div
                    className="mt-2 border rounded-md p-2 space-y-2 min-h-[50px]">{selectedProfissionais.map((prof) => (
                    <div key={prof.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <span>{prof.nome} {prof.sobrenome}</span>
                        <button type="button" onClick={() => handleRemovePrestador(prof.id)}
                                className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>))}</div>
            </div>
        </div>
    );

    const TabSetores = () => (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button type="button" onClick={() => setIsSetorModalOpen(true)}
                        className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                        disabled={!selectedEmpresa}><Plus size={16}/> Adicionar Setor
                </button>
            </div>
            <div className="mt-2 border rounded-md p-2 space-y-2 min-h-[50px]">
                {selectedSetores.length === 0 &&
                    <p className="text-center text-gray-500 py-4">Nenhum setor selecionado.</p>}
                {selectedSetores.map((setor) => (
                    <div key={setor.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <span>{setor.nome}</span>
                        <button type="button" onClick={() => handleRemoveSetor(setor.id)}
                                className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>))}
            </div>
        </div>
    );

    const mainTabs = [
        {id: 'capa', label: 'Capa', component: <TabCapa/>},
        {id: 'profissionais', label: 'Profissionais', component: <TabProfissionais/>},
        {id: 'setores', label: 'Setores', component: <TabSetores/>},
        {
            id: 'laudo',
            label: 'Laudo Técnico',
            component: <RichTextEditor name="laudoIntroducao" value={ltcatData.laudoIntroducao}
                                       onChange={handleInputChange}/>
        },
        {
            id: 'recomendacoes',
            label: 'Recomendações',
            component: <RichTextEditor name="recomendacoesTecnicas" value={ltcatData.recomendacoesTecnicas}
                                       onChange={handleInputChange}/>
        },
        {
            id: 'conclusao',
            label: 'Conclusão',
            component: <RichTextEditor name="conclusao" value={ltcatData.conclusao} onChange={handleInputChange}/>
        },
    ];

    const todasFuncoes = selectedSetores.flatMap(setor =>
        (setor.funcoes || []).map(funcao => ({
            ...funcao,
            nomeSetor: setor.nome
        }))
    );

    // Paginação
    const totalPaginas = Math.ceil(todasFuncoes.length / ITENS_POR_PAGINA);
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const funcoesPagina = todasFuncoes.slice(inicio, fim);

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
            <div className="container mx-auto">
                <header className="mb-6"><h1
                    className="text-3xl font-bold text-gray-900">{id ? `Editar LTCAT #${id}` : 'Cadastrar LTCAT'}</h1>
                </header>
                <form onSubmit={handleSubmit}>
                    <FormSection title="Informações Básicas">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-600">Empresa *</label>
                            <InputWithActions placeholder="Selecione uma empresa"
                                              value={selectedEmpresa ? selectedEmpresa.razaoSocial : ''}
                                              onClick={() => setIsEmpresaModalOpen(true)} actions={selectedEmpresa ? (
                                <button type="button" onClick={handleClearEmpresa}
                                        className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><X
                                    size={18}/></button>) : (
                                <button type="button" onClick={() => setIsEmpresaModalOpen(true)}
                                        className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                    <Search size={18}/></button>)}/>
                        </div>
                        <div className="col-span-2 flex items-end gap-2">
                            <button type="button"
                                    className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-full">Empresa
                            </button>
                            <button type="button" onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 disabled:opacity-50"
                                    disabled={!selectedEmpresa}>
                                {selectedUnidade ? selectedUnidade.nome : 'Unidade Operacional'}
                            </button>
                        </div>
                        <div><label className="text-sm font-medium text-gray-600">Data do Documento *</label><input
                            type="date" name="dataDocumento" value={ltcatData.dataDocumento}
                            onChange={handleInputChange}
                            className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/></div>
                        <div><label className="text-sm font-medium text-gray-600">Data de Vencimento *</label><input
                            type="date" name="dataVencimento" value={ltcatData.dataVencimento}
                            onChange={handleInputChange}
                            className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/></div>
                        <div><label className="text-sm font-medium text-gray-600">Alerta de validade do laudo
                            *</label><input type="number" name="alertaValidadeDias" value={ltcatData.alertaValidadeDias}
                                            onChange={handleInputChange}
                                            className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/></div>
                        <div><label className="text-sm font-medium text-gray-600">Situação *</label><select
                            name="situacao" value={ltcatData.situacao} onChange={handleInputChange}
                            className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md bg-white">
                            <option value="ATIVO">Ativo</option>
                            <option value="INATIVO">Inativo</option>
                        </select></div>
                        <div><label className="text-sm font-medium text-gray-600">Cidade *</label><input type="text"
                                                                                                         name="cidade"
                                                                                                         value={ltcatData.cidade}
                                                                                                         onChange={handleInputChange}
                                                                                                         className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/>
                        </div>
                        <div><label className="text-sm font-medium text-gray-600">Estado *</label><select name="estado"
                                                                                                          value={ltcatData.estado}
                                                                                                          onChange={handleInputChange}
                                                                                                          className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md bg-white">
                            <option value="">Selecione...</option>
                            <option value="MG">Minas Gerais</option>
                        </select></div>
                        <div className="col-span-full"><label className="text-sm font-medium text-gray-600">Comentários
                            (não será impresso no LTCAT)</label><input type="text" name="comentariosInternos"
                                                                       value={ltcatData.comentariosInternos}
                                                                       onChange={handleInputChange}
                                                                       className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/>
                        </div>
                        <div className="col-span-full"><label className="text-sm font-medium text-gray-600">Condições
                            Preliminares</label><RichTextEditor name="condicoesPreliminares"
                                                                value={ltcatData.condicoesPreliminares}
                                                                onChange={handleInputChange} rows={3}/></div>
                    </FormSection>

                    <div className="bg-white rounded-lg shadow-md mt-6">
                        <div className="border-b border-gray-200 overflow-x-auto">
                            <nav className="flex space-x-2 px-4">{mainTabs.map(tab => (
                                <TabButton key={tab.id} label={tab.label} isActive={activeTab === tab.id}
                                           onClick={() => setActiveTab(tab.id)}/>))}</nav>
                        </div>
                        <div className="p-6">{mainTabs.find(tab => tab.id === activeTab)?.component}</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                        <h4 className="font-semibold text-blue-800 mb-4 text-center border-t border-b py-2 bg-blue-50">
                            Funções do LTCAT
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">CBO</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Função</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Setor</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Agentes
                                        Nocivos
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {funcoesPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-gray-500 py-4">
                                            Nenhuma função encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    funcoesPagina.map(funcao => (
                                        <tr key={`${funcao.id}-${funcao.nomeSetor}`}>
                                            <td className="px-4 py-3">{funcao.codigoCbo}</td>
                                            <td className="px-4 py-3">{funcao.nome}</td>
                                            <td className="px-4 py-3">{funcao.nomeSetor}</td>
                                            <td className="px-4 py-3">
                                                {(funcao.agentesNocivosEsocial || [])
                                                    .map(a => a.agenteNocivoCatalogo?.descricao)
                                                    .join(', ') || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                            {true && (
                                <div className="flex justify-center items-center gap-2 mt-4">
                                    <button
                                        onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
                                        disabled={paginaAtual === 1}
                                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>

                                    <span className="text-sm text-gray-700">
                                      Página {paginaAtual} de {totalPaginas}
                                    </span>

                                    <button
                                        onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                                        disabled={paginaAtual === totalPaginas}
                                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-4 mt-8">
                        <button type="button" onClick={() => navigate(-1)}
                                className="bg-red-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors">Cancelar
                        </button>
                        <button type="submit"
                                className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors">Salvar
                        </button>
                    </div>
                </form>
            </div>

            {/* Renderização dos Modais */}
            <EmpresaSearchModal isOpen={isEmpresaModalOpen} onClose={() => setIsEmpresaModalOpen(false)}
                                onSelect={handleSelectEmpresa}/>
            {selectedEmpresa &&
                <UnidadesOperacionaisModal isOpen={isUnidadeModalOpen} onClose={() => setIsUnidadeModalOpen(false)}
                                           onSelect={handleSelectUnidade} empresaId={selectedEmpresa.id}/>}
            <PrestadorServicoSearchModal isOpen={isPrestadorModalOpen} onClose={() => setIsPrestadorModalOpen(false)}
                                         onSelect={handleSelectPrestador}/>
            {selectedEmpresa && <SetorSearchModal isOpen={isSetorModalOpen} onClose={() => setIsSetorModalOpen(false)}
                                                  onSelect={handleSelectSetor} empresaId={selectedEmpresa.id}/>}
        </div>
    );
}