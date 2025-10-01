import React, {useState, useEffect} from 'react';
import {
    Search,
    Trash2,
    Plus,
    ArrowLeft
} from 'lucide-react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import funcaoService from '../../../api/services/cadastros/funcoesService.js';
import ModalEmpresa from '../../../components/modal/empresaSearchModal.jsx';
import ModalSetor from '../../../components/modal/SetorSearchModal.jsx';
import ModalCBO from '../../../components/modal/CboModal.jsx';
import ModalRiscosPGR from '../../../components/modal/RiscoPgrModalSearch.jsx';
import ModalAgentesNocivos from '../../../components/modal/ModalAgentesNocivos.jsx';
import ModalExamesPCMSO from '../../../components/modal/ModalExamesPCMSO.jsx';
import MedicoSearchModal from '../../../components/modal/MedicoSearchModal.jsx';

const FormSection = ({title, children}) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        {title && <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-6">{title}</h3>}
        {children}
    </div>
);

const FormField = ({label, required, children, className = ''}) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const InputWithActions = ({placeholder, value, actions}) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            readOnly
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md bg-gray-100 cursor-default focus:outline-none"
        />
        <div className="absolute right-0 flex">{actions}</div>
    </div>
);

const TabButton = ({label, isActive, onClick}) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-3 -mb-px text-sm font-semibold transition-colors border-b-2 ${
            isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`}
    >
        {label}
    </button>
);


export default function EditarFuncao() {
    const navigate = useNavigate();
    const {id} = useParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeTab, setActiveTab] = useState('riscos');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        empresa: {id: null, razaoSocial: ''},
        setor: {id: null, nome: ''},
        cbo: {id: null, codigoCbo: '', nomeOcupacao: ''},
        qtdFuncionarios: 0,
        descricao: '',
        gfip: 'Não exposto - sem adicional sobre o RAT',
        atividadesInsalubres: '',
        infoComplementar: '',
        status: 'ATIVO'
    });
    const [riscosPGR, setRiscosPGR] = useState([]);
    const [agentesNocivos, setAgentesNocivos] = useState([]);
    const [examesPCMSO, setExamesPCMSO] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
    const [modalSetorOpen, setModalSetorOpen] = useState(false);
    const [modalCboOpen, setModalCboOpen] = useState(false);
    const [modalRiscosOpen, setModalRiscosOpen] = useState(false);
    const [modalAgentesOpen, setModalAgentesOpen] = useState(false);
    const [modalExamesOpen, setModalExamesOpen] = useState(false);
    const [modalMedicoOpen, setModalMedicoOpen] = useState(false);

    useEffect(() => {
        if (!id) {
            toast.error("ID da função não encontrado na URL.");
            navigate('/cadastros/listar/funcao');
            return;
        }
        fetchFuncaoData(id);
    }, [id, navigate]);

    const fetchFuncaoData = async (funcaoId) => {
        setLoading(true);
        try {
            const response = await funcaoService.getById(funcaoId);
            const data = response.data;

            // Mapeia o valor do enum do backend para o texto do frontend
            const reverseGfipMap = {
                'NAO_EXPOSTO_SEM_ADICIONAL': 'Não exposto - sem adicional sobre o RAT',
                'EXPOSTO_ADICIONAL_1': 'Adicional de 1% - trabalho com baixo risco',
                'EXPOSTO_ADICIONAL_2': 'Adicional de 2% - trabalho com médio risco',
                'EXPOSTO_ADICIONAL_3': 'Adicional de 3% - trabalho com alto risco'
            };

            setFormData({
                nome: data.nome || '',
                empresa: data.empresa ? {id: data.empresa.id, razaoSocial: data.empresa.razaoSocial} : {
                    id: null,
                    razaoSocial: ''
                },
                setor: data.setor || {id: null, nome: ''},
              
                cbo: data.codigoCbo ? {
                    id: data.cboId,
                    nomeOcupacao: data.nomeCbo,
                    codigoCbo: data.codigoCbo
                } : {id: null, codigoCbo: '', nomeOcupacao: ''},
                quantidadeFuncionarios: data.quantidadeFuncionarios || 0,
                descricaoFuncao: data.descricaoFuncao || '',
                gfip: reverseGfipMap[data.tipoGfip] || 'Não exposto - sem adicional sobre o RAT',
                atividadesInsalubres: data.atividadesInsalubres || '',
                informacoesComplementaresRegistrosAmbientais: data.informacoesComplementaresRegistrosAmbientais || '',
                status: data.status || 'ATIVO'
            });

            // Preenche as listas de relacionamentos
            setRiscosPGR(data.riscosPGR || []);
            setAgentesNocivos(data.agentesNocivosEsocial || []);
            setExamesPCMSO(data.examesPcmso || []);
            setProfissionais(data.prestadoresResponsaveis || []);

        } catch (error) {
            console.error('Erro ao carregar dados da função:', error);
            toast.error('Não foi possível carregar os dados da função.');
            navigate('/cadastros/listar/funcao');
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    const handleEmpresaSelect = (empresa) => {
        setFormData(prev => ({
            ...prev,
            empresa: {id: empresa.id, razaoSocial: empresa.razaoSocial},
            setor: {id: null, nome: ''}
        }));
        setModalEmpresaOpen(false);
    };
    const handleSetorSelect = (setor) => {
        setFormData(prev => ({...prev, setor}));
        setModalSetorOpen(false);
    };
    const handleCboSelect = (cbo) => {
        const normalizedCbo = {
            id: cbo.id,
            codigoCbo: cbo.codigo,
            nomeOcupacao: cbo.descricao
        };
        setFormData(prev => ({...prev, cbo: normalizedCbo, nome: cbo.descricao}));
        setModalCboOpen(false);
    };
    const addToList = (setList, item) => setList(currentList => !currentList.some(i => i.id === item.id) ? [...currentList, item] : currentList);
    const removeFromList = (setList, itemId) => setList(currentList => currentList.filter(item => item.id !== itemId));
    const handleRiscoSelect = (riscoSelecionado) => {

        const novoRiscoFormatado = {
            id: Date.now(), // Gera um ID temporário único para a chave do React
            riscoCatalogo: {
                id: riscoSelecionado.id,
                grupo: riscoSelecionado.grupo,
                descricao: riscoSelecionado.descricao
            }
        };

        // 2. Adiciona o novo risco já formatado à lista
        setRiscosPGR(prevRiscos => {
            const riscoArray = Array.isArray(prevRiscos) ? prevRiscos : [];
            // Evita adicionar duplicatas pelo ID do riscoCatalogo
            if (!riscoArray.some(r => r.riscoCatalogo.id === novoRiscoFormatado.riscoCatalogo.id)) {
                return [...riscoArray, novoRiscoFormatado];
            }
            return riscoArray;
        });

        setModalRiscosOpen(false);
    };
    const handleAgenteSelect = (agenteSelecionado) => {
        // Formata o objeto para a estrutura correta
        const novoAgenteFormatado = {
            id: Date.now(), // ID temporário para a key
            agenteNocivoCatalogo: { // <- Envolve o objeto
                id: agenteSelecionado.id,
                codigoEsocial: agenteSelecionado.codigoEsocial,
                descricao: agenteSelecionado.descricao
            }
        };

        // Adiciona à lista, evitando duplicatas
        setAgentesNocivos(prevAgentes => {
            const agenteArray = Array.isArray(prevAgentes) ? prevAgentes : [];
            if (!agenteArray.some(a => a.agenteNocivoCatalogo.id === novoAgenteFormatado.agenteNocivoCatalogo.id)) {
                return [...agenteArray, novoAgenteFormatado];
            }
            return agenteArray;
        });

        setModalAgentesOpen(false);
    };
    const handleExameSelect = (exameSelecionado) => {
        // Formata o objeto para a estrutura correta
        const novoExameFormatado = {
            id: Date.now(), // ID temporário para a key
            exameCatalogo: { // <- Envolve o objeto
                id: exameSelecionado.id,
                codigoExame: exameSelecionado.codigoExame,
                nomeExame: exameSelecionado.nomeExame
            }
        };

        // Adiciona à lista, evitando duplicatas
        setExamesPCMSO(prevExames => {
            const exameArray = Array.isArray(prevExames) ? prevExames : [];
            if (!exameArray.some(e => e.exameCatalogo.id === novoExameFormatado.exameCatalogo.id)) {
                return [...exameArray, novoExameFormatado];
            }
            return exameArray;
        });

        setModalExamesOpen(false);
    };
    const handleMedicoSelect = (medico) => {
        addToList(setProfissionais, medico);
        setModalMedicoOpen(false);
    };
    const handleRemoveRisco = (riscoId) => removeFromList(setRiscosPGR, riscoId);
    const handleRemoveAgente = (agenteId) => removeFromList(setAgentesNocivos, agenteId);
    const handleRemoveExame = (exameId) => removeFromList(setExamesPCMSO, exameId);
    const handleRemoveProfissional = (profissionalId) => removeFromList(setProfissionais, profissionalId);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const gfipMap = {
            'Não exposto - sem adicional sobre o RAT': 'NAO_EXPOSTO_SEM_ADICIONAL',
            'Adicional de 1% - trabalho com baixo risco': 'EXPOSTO_ADICIONAL_1',
            'Adicional de 2% - trabalho com médio risco': 'EXPOSTO_ADICIONAL_2',
            'Adicional de 3% - trabalho com alto risco': 'EXPOSTO_ADICIONAL_3'
        };

        const payload = {
            nome: formData.nome,
            descricaoFuncao: formData.descricaoFuncao,
            empresaId: formData.empresa.id,
            setorId: formData.setor.id,
            cboId: formData.cbo.id,
            quantidadeFuncionarios: formData.quantidadeFuncionarios,
            tipoGfip: gfipMap[formData.gfip] || 'NAO_EXPOSTO_SEM_ADICIONAL',
            status: formData.status,
            atividadesInsalubres: formData.atividadesInsalubres,
            informacoesComplementaresRegistrosAmbientais: formData.informacoesComplementaresRegistrosAmbientais,

            riscosPGR: riscosPGR.map(r => ({ riscoCatalogoId: r.riscoCatalogo.id })),
            agentesNocivosEsocial: agentesNocivos.map(a => ({ agenteNocivoCatalogoId: a.agenteNocivoCatalogo.id })),
            examesPcmso: examesPCMSO.map(ex => ({ exameCatalogoId: ex.exameCatalogo.id, tipoExame: 'ADMISSIONAL', obrigatorio: true })),
            prestadoresResponsaveis: profissionais.map(p => ({ prestadorServicoId: p.id }))
        };

        try {
            await funcaoService.update(id, payload);
            setShowSuccessModal(true);
            setTimeout(() => navigate('/cadastros/listar/funcao'), 1500);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Erro ao salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };
    const handleCancel = () => navigate('/cadastros/listar/funcao');

    if (loading) {
        return (
            <div className="flex justify-center items-center bg-gray-50 min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando dados da função...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Editar Função</h1>
                        <p className="text-gray-600 mt-1">Editando registro ID: {id}</p>
                    </div>
                    <button onClick={handleCancel} className="flex items-center text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={20} className="mr-2"/>
                        <span>Voltar para a Lista</span>
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <FormSection title="Informações da Função">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Empresa" required><InputWithActions value={formData.empresa?.razaoSocial}
                                                                                  actions={<>
                                                                                      <button type="button"
                                                                                              onClick={() => setModalEmpresaOpen(true)}
                                                                                              className="p-2.5 text-gray-500 hover:text-green-600">
                                                                                          <Search size={18}/></button>
                                                                                      <button type="button"
                                                                                              onClick={() => setFormData(prev => ({
                                                                                                  ...prev,
                                                                                                  empresa: {
                                                                                                      id: null,
                                                                                                      razaoSocial: ''
                                                                                                  }
                                                                                              }))}
                                                                                              className="p-2.5 text-gray-500 hover:text-red-600">
                                                                                          <Trash2 size={18}/></button>
                                                                                  </>}/></FormField>
                            <FormField label="Setor" required><InputWithActions value={formData.setor?.nome} actions={<>
                                <button type="button" onClick={() => setModalSetorOpen(true)}
                                        className="p-2.5 text-gray-500 hover:text-green-600"><Search size={18}/>
                                </button>
                                <button type="button"
                                        onClick={() => setFormData(prev => ({...prev, setor: {id: null, nome: ''}}))}
                                        className="p-2.5 text-gray-500 hover:text-red-600"><Trash2 size={18}/></button>
                            </>}/></FormField>
                            <FormField label="CBO" className="col-span-2" required><InputWithActions
                                value={formData.cbo?.codigoCbo ? `${formData.cbo.codigoCbo} - ${formData.cbo.nomeOcupacao}` : ''}
                                actions={<>
                                    <button type="button" onClick={() => setModalCboOpen(true)}
                                            className="p-2.5 text-gray-500 hover:text-green-600"><Search size={18}/>
                                    </button>
                                    <button type="button" onClick={() => setFormData(prev => ({
                                        ...prev,
                                        cbo: {id: null, codigo: '', descricao: ''}
                                    }))} className="p-2.5 text-gray-500 hover:text-red-600"><Trash2 size={18}/></button>
                                </>}/></FormField>
                            <FormField label="Nome da Função" required><input type="text" name="nome"
                                                                              value={formData.nome}
                                                                              onChange={handleInputChange}
                                                                              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></FormField>
                            <FormField label="Quantidade de funcionários"><input type="number" name="quantidadeFuncionarios"
                                                                                 value={formData.quantidadeFuncionarios || ''}
                                                                                 onChange={handleInputChange}
                                                                                 className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></FormField>
                            <FormField label="Descrição da Função" className="col-span-2" required><textarea rows="5"
                                                                                                             name="descricaoFuncao"
                                                                                                             value={formData.descricaoFuncao || ''}
                                                                                                             onChange={handleInputChange}
                                                                                                             className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea></FormField>
                            <FormField label="GFIP"><select name="gfip" value={formData.gfip}
                                                            onChange={handleInputChange}
                                                            className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Não exposto - sem adicional sobre o RAT">Não exposto - sem adicional
                                    sobre o RAT
                                </option>
                                <option value="Adicional de 1% - trabalho com baixo risco">Adicional de 1% - trabalho
                                    com baixo risco
                                </option>
                                <option value="Adicional de 2% - trabalho com médio risco">Adicional de 2% - trabalho
                                    com médio risco
                                </option>
                                <option value="Adicional de 3% - trabalho com alto risco">Adicional de 3% - trabalho com
                                    alto risco
                                </option>
                            </select></FormField>
                            <FormField label="Situação" required>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </FormField>
                        </div>
                    </FormSection>

                    <div className="bg-white rounded-lg shadow-md">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-4 px-6">
                                <TabButton label="RISCOS TRABALHISTAS (PGR)" isActive={activeTab === 'riscos'}
                                           onClick={() => setActiveTab('riscos')}/>
                                <TabButton label="AGENTES NOCIVOS (ESOCIAL)" isActive={activeTab === 'agentes'}
                                           onClick={() => setActiveTab('agentes')}/>
                                <TabButton label="EXAMES (PCMSO)" isActive={activeTab === 'exames'}
                                           onClick={() => setActiveTab('exames')}/>
                            </nav>
                        </div>
                        <div className="p-6">
                            {activeTab === 'riscos' && (<>
                                <div className="flex justify-end mb-4">
                                    <button type="button" onClick={() => setModalRiscosOpen(true)}
                                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                        <Plus size={16}/><span>Adicionar Risco</span></button>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody
                                        className="bg-white divide-y divide-gray-200">{riscosPGR.length > 0 ? riscosPGR.map(risco => (
                                        <tr key={risco.id}>
                                            <td className="px-6 py-4 text-sm text-black">{risco.riscoCatalogo.grupo}</td>
                                            <td className="px-6 py-4 text-sm text-black">{risco.riscoCatalogo.descricao}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <button type="button" onClick={() => handleRemoveRisco(risco.id)}
                                                        className="text-red-500 hover:text-red-700"><Trash2 size={18}/>
                                                </button>
                                            </td>
                                        </tr>)) : <tr>
                                        <td colSpan="3" className="text-center py-4 text-sm text-gray-500">Nenhum risco
                                            adicionado.
                                        </td>
                                    </tr>}</tbody>
                                </table>
                            </>)}
                            {activeTab === 'agentes' && (<>
                                <div className="flex justify-end mb-4">
                                    <button type="button" onClick={() => setModalAgentesOpen(true)}
                                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                        <Plus size={16}/><span>Adicionar Agente</span></button>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody
                                        className="bg-white divide-y divide-gray-200">{agentesNocivos.length > 0 ? agentesNocivos.map(agente => (
                                        <tr key={agente.id}>
                                            <td className="px-6 py-4 text-sm">{agente.agenteNocivoCatalogo.codigoEsocial}</td>
                                            <td className="px-6 py-4 text-sm">{agente.agenteNocivoCatalogo.descricao}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <button type="button" onClick={() => handleRemoveAgente(agente.id)}
                                                        className="text-red-500 hover:text-red-700"><Trash2 size={18}/>
                                                </button>
                                            </td>
                                        </tr>)) : <tr>
                                        <td colSpan="3" className="text-center py-4 text-sm text-gray-500">Nenhum agente
                                            nocivo adicionado.
                                        </td>
                                    </tr>}</tbody>
                                </table>
                            </>)}
                            {activeTab === 'exames' && (<>
                                <div className="flex justify-end mb-4">
                                    <button type="button" onClick={() => setModalExamesOpen(true)}
                                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                        <Plus size={16}/><span>Adicionar Exame</span></button>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody
                                        className="bg-white divide-y divide-gray-200">{examesPCMSO.length > 0 ? examesPCMSO.map(exame => (
                                        <tr key={exame.id}>
                                            <td className="px-6 py-4 text-sm">{exame.exameCatalogo.codigoExame}</td>
                                            <td className="px-6 py-4 text-sm">{exame.exameCatalogo.nomeExame}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <button type="button" onClick={() => handleRemoveExame(exame.id)}
                                                        className="text-red-500 hover:text-red-700"><Trash2 size={18}/>
                                                </button>
                                            </td>
                                        </tr>)) : <tr>
                                        <td colSpan="3" className="text-center py-4 text-sm text-gray-500">Nenhum exame
                                            adicionado.
                                        </td>
                                    </tr>}</tbody>
                                </table>
                            </>)}
                        </div>
                    </div>

                    <div className="mt-6 space-y-6">
                        <FormField label="Atividades Insalubres"><input type="text" name="atividadesInsalubres"
                                                                        value={formData.atividadesInsalubres}
                                                                        onChange={handleInputChange}
                                                                        className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></FormField>
                        <FormField label="Informações Complementares Referente a Registros Ambientais"><input
                            type="text" name="infoComplementar" value={formData.informacoesComplementaresRegistrosAmbientais}
                            onChange={handleInputChange}
                            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></FormField>
                        <FormField label="Profissionais responsáveis pelos Registros Ambientais">
                            <div className="flex justify-end mb-2">
                                <button type="button" onClick={() => setModalMedicoOpen(true)}
                                        className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700">
                                    <Plus size={14}/><span>Adicionar Profissional</span></button>
                            </div>
                            <div className="mt-2 space-y-2">{profissionais.length > 0 ? profissionais.map((prof) => (
                                <div key={prof.id}
                                     className="flex justify-between items-center p-2 bg-gray-100 rounded-md"><span
                                    className="text-sm text-gray-700">{prof.nome}</span>
                                    <button type="button" onClick={() => handleRemoveProfissional(prof.id)}
                                            className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </div>)) : <div className="text-center py-2 text-sm text-gray-500">Nenhum profissional
                                adicionado</div>}</div>
                        </FormField>
                    </div>

                    <div className="flex flex-wrap justify-end gap-4 mt-8">
                        <button type="button" onClick={handleCancel}
                                className="bg-gray-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-gray-700">Cancelar
                        </button>
                        <button type="submit"
                                className="bg-green-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-green-700"
                                disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</button>
                    </div>
                </form>
                {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Função salva com sucesso!</h3>
                                <p className="text-gray-600">Redirecionando...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ModalEmpresa isOpen={modalEmpresaOpen} onClose={() => setModalEmpresaOpen(false)}
                          onSelect={handleEmpresaSelect}/>
            <ModalSetor isOpen={modalSetorOpen} onClose={() => setModalSetorOpen(false)} onSelect={handleSetorSelect}
                        empresaId={formData.empresa?.id}/>
            <ModalCBO isOpen={modalCboOpen} onClose={() => setModalCboOpen(false)} onSelect={handleCboSelect}/>
            <ModalRiscosPGR isOpen={modalRiscosOpen} onClose={() => setModalRiscosOpen(false)}
                            onSelect={handleRiscoSelect}/>
            <ModalAgentesNocivos isOpen={modalAgentesOpen} onClose={() => setModalAgentesOpen(false)}
                                 onSelect={handleAgenteSelect}/>
            <ModalExamesPCMSO isOpen={modalExamesOpen} onClose={() => setModalExamesOpen(false)}
                              onSelect={handleExameSelect}/>
            <MedicoSearchModal isOpen={modalMedicoOpen} onClose={() => setModalMedicoOpen(false)}
                               onMedicoSelect={handleMedicoSelect}/>
        </div>
    );
}