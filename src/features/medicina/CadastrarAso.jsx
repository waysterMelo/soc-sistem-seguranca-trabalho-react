import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Save, User, Upload, FileText, Plus, Search, Building, Briefcase } from 'lucide-react';
import FuncionarioSearchModal from '../../components/modal/FuncionarioSearchModal.jsx';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import funcionarioService from '../../api/services/cadastros/funcionariosServices.js';
import PrestadorServicoModal from '../../components/modal/PrestadorServico.jsx';
import asoService from '../../api/services/aso/asoService.js';


export default function CadastrarAso() {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, id: Date.now() });
        setTimeout(() => setNotification(null), 4000);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Notification notification={notification} />
            <AsoForm showNotification={showNotification} />
        </div>
    );
}


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


const AsoForm = ({ showNotification }) => {
    const [formData, setFormData] = useState({
        empresaId: '',
        unidadeId: '',
        setorId: '',
        funcionarioId: '',
        tipoRetificacao: 'ORIGINAL',
        dataAsoRetificado: '',
        tipoAso: '',
        dataEmissao: '',
        medicoExaminadorId: '',
        medicoResponsavelPcmsoId: '',
        conclusaoAso: '',
        diasInapto: '',
        status: 'CONCLUIDO',
        naoInformar: false,
        observacoes: '',
        conclusaoColaborador: ''
    });

    // Estados para seleções
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);
    const [setorSelecionado, setSetorSelecionado] = useState(null);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [medicoExaminador, setMedicoExaminador] = useState(null);
    const [medicoResponsavel, setMedicoResponsavel] = useState(null);

    // Estados para modais
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showUnidadeModal, setShowUnidadeModal] = useState(false);
    const [showSetorModal, setShowSetorModal] = useState(false);
    const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
    const [showPrestadorModal, setShowPrestadorModal] = useState(false);
    const [prestadorFieldTarget, setPrestadorFieldTarget] = useState(null);

    // Estados para dados
    const [funcionarios, setFuncionarios] = useState([]);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
    const [exames, setExames] = useState([]);
    const [riscos, setRiscos] = useState([]);
    const [isAddingRisks, setIsAddingRisks] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [examesCatalogo, setExamesCatalogo] = useState([]);
    const [riscosCatalogo, setRiscosCatalogo] = useState([]);

    // Carregar funcionários automaticamente quando setor mudar
    useEffect(() => {
        const carregarFuncionarios = async () => {
            if (!setorSelecionado) {
                setFuncionarios([]);
                return;
            }

            setLoadingFuncionarios(true);
            try {
                const response = await funcionarioService.buscarFuncionariosPorSetor(
                    setorSelecionado.id,
                    { page: 0, size: 100 }
                );
                setFuncionarios(response.data.content || []);
            } catch (error) {
                console.error('Erro ao carregar funcionários:', error);
                showNotification('Erro ao carregar funcionários', 'error');
                setFuncionarios([]);
            } finally {
                setLoadingFuncionarios(false);
            }
        };

        carregarFuncionarios();
    }, [setorSelecionado]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handlers para seleção de empresa, setor e funcionário
    const handleEmpresaSelect = (empresa) => {
        setEmpresaSelecionada(empresa);
        setFormData(prev => ({
            ...prev,
            empresaId: empresa.id,
            unidadeId: '',
            setorId: '',
            funcionarioId: ''
        }));
        // Limpar seleções dependentes
        setUnidadeSelecionada(null);
        setSetorSelecionado(null);
        setFuncionarioSelecionado(null);
        setShowEmpresaModal(false);
    };

    const handleUnidadeSelect = (unidade) => {
        setUnidadeSelecionada(unidade);
        setFormData(prev => ({
            ...prev,
            unidadeId: unidade.id,
            setorId: '',
            funcionarioId: ''
        }));
        setSetorSelecionado(null);
        setFuncionarioSelecionado(null);
        setShowUnidadeModal(false);
    };

    const handleSetorSelect = (setor) => {
        setSetorSelecionado(setor);
        setFormData(prev => ({
            ...prev,
            setorId: setor.id,
            funcionarioId: ''
        }));
        // Limpar funcionário selecionado
        setFuncionarioSelecionado(null);
        setShowSetorModal(false);
    };

    const handleFuncionarioSelect = async (funcionario) => {
        setFuncionarioSelecionado(funcionario);
        setFormData(prev => ({
            ...prev,
            funcionarioId: funcionario.id
        }));
        setShowFuncionarioModal(false);

        // Fetch risks and exams
        if (funcionario && funcionario.id) {
            try {
                const [riscosResponse, examesResponse] = await Promise.all([
                    funcionarioService.getRiscosPorFuncionario(funcionario.id),
                    funcionarioService.getExamesPorFuncionario(funcionario.id)
                ]);

                if (riscosResponse.data) {
                    const riscosData = riscosResponse.data.map(item => ({
                        id: item.riscoCatalogo.id,
                        nome: item.riscoCatalogo.descricao,
                        grupo: item.riscoCatalogo.grupo
                    }));
                    setRiscos(riscosData);
                }
                if (examesResponse.data) {
                    const examesData = examesResponse.data.map(item => ({
                        id: item.exameCatalogo.id,
                        codigo: item.exameCatalogo.codigoExame,
                        nome: item.exameCatalogo.nomeExame,
                    }));
                    setExames(examesData);
                }
                showNotification('Riscos e exames do funcionário carregados.', 'success');
            } catch (error) {
                console.error('Erro ao buscar riscos e exames do funcionário:', error);
                showNotification('Falha ao carregar riscos e exames.', 'error');
            }
        }
    };

    const openPrestadorModal = (target) => {
        setPrestadorFieldTarget(target);
        setShowPrestadorModal(true);
    };

    const handlePrestadorSelect = (prestador) => {
        if (prestadorFieldTarget === 'medicoExaminadorId') {
            setMedicoExaminador(prestador);
            handleInputChange('medicoExaminadorId', prestador.id);
        } else if (prestadorFieldTarget === 'medicoResponsavelPcmsoId') {
            setMedicoResponsavel(prestador);
            handleInputChange('medicoResponsavelPcmsoId', prestador.id);
        }
        setShowPrestadorModal(false);
        setPrestadorFieldTarget(null);
    };

    // Handlers para limpeza
    const handleClearEmpresa = () => {
        setEmpresaSelecionada(null);
        setUnidadeSelecionada(null);
        setSetorSelecionado(null);
        setFuncionarioSelecionado(null);
        setFormData(prev => ({
            ...prev,
            empresaId: '',
            unidadeId: '',
            setorId: '',
            funcionarioId: ''
        }));
    };

    const handleClearUnidade = () => {
        setUnidadeSelecionada(null);
        setSetorSelecionado(null);
        setFuncionarioSelecionado(null);
        setFormData(prev => ({
            ...prev,
            unidadeId: '',
            setorId: '',
            funcionarioId: ''
        }));
    };

    const handleClearSetor = () => {
        setSetorSelecionado(null);
        setFuncionarioSelecionado(null);
        setFormData(prev => ({
            ...prev,
            setorId: '',
            funcionarioId: ''
        }));
    };

    const handleClearFuncionario = () => {
        setFuncionarioSelecionado(null);
        setFormData(prev => ({
            ...prev,
            funcionarioId: ''
        }));
    };

    const handleClearPrestador = (target) => {
        if (target === 'medicoExaminadorId') {
            setMedicoExaminador(null);
            handleInputChange('medicoExaminadorId', '');
        } else if (target === 'medicoResponsavelPcmsoId') {
            setMedicoResponsavel(null);
            handleInputChange('medicoResponsavelPcmsoId', '');
        }
    };

    const handleFileChange = (file, exameId) => {
        setExames(prevExames => prevExames.map(ex =>
            ex.id === exameId ? { ...ex, file } : ex
        ));
    };

    const handleConfirmRiscos = (novosRiscos) => {
        setRiscos(novosRiscos);
        setIsAddingRisks(false);
    };

    const handleSave = async () => {
        // Validações básicas
        if (!formData.empresaId) {
            showNotification('Selecione uma empresa', 'error');
            return;
        }
        if (!formData.funcionarioId) {
            showNotification('Selecione um funcionário', 'error');
            return;
        }
        if (!formData.dataEmissao) {
            showNotification('Informe a data de emissão', 'error');
            return;
        }
        if (!formData.tipoAso) {
            showNotification('Selecione o tipo de ASO', 'error');
            return;
        }
        if (!formData.medicoExaminadorId) {
            showNotification('Selecione o médico examinador', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Mapear dados do formulário para o formato da API
            const apiPayload = {
                empresaId: parseInt(formData.empresaId),
                unidadeId: formData.unidadeId ? parseInt(formData.unidadeId) : null,
                setorId: formData.setorId ? parseInt(formData.setorId) : null,
                funcionarioId: parseInt(formData.funcionarioId),
                tipoRetificacao: formData.tipoRetificacao,
                dataAsoRetificado: formData.tipoRetificacao === 'RETIFICACAO' ? formData.dataAsoRetificado : null,
                tipoAso: formData.tipoAso,
                dataEmissao: formData.dataEmissao,
                medicoExaminadorId: parseInt(formData.medicoExaminadorId),
                medicoResponsavelPcmsoId: formData.medicoResponsavelPcmsoId ? parseInt(formData.medicoResponsavelPcmsoId) : null,
                conclusaoAso: formData.conclusaoAso || null,
                diasInapto: formData.diasInapto ? parseInt(formData.diasInapto) : null,
                status: formData.status,
                naoInformar: formData.naoInformar,
                observacoes: formData.observacoes || null,
                conclusaoColaborador: formData.conclusaoColaborador || null,
                riscoIds: riscos.map(risco => risco.id),
                exames: exames
                    .filter(exame => exame.file)
                    .map(exame => ({
                        exameCatalogoId: exame.id,
                        caminhoAnexo: exame.file ? `/uploads/${exame.file.name}` : null
                    }))
            };

            await asoService.createAso(apiPayload);

            showNotification('ASO cadastrado com sucesso!', 'success');

            // Reset do formulário após sucesso
            resetForm();

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao cadastrar ASO. Tente novamente.';
            console.error('Erro ao salvar ASO:', error);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            empresaId: '',
            unidadeId: '',
            setorId: '',
            funcionarioId: '',
            tipoRetificacao: 'ORIGINAL',
            dataAsoRetificado: '',
            tipoAso: '',
            dataEmissao: '',
            medicoExaminadorId: '',
            medicoResponsavelPcmsoId: '',
            conclusaoAso: '',
            diasInapto: '',
            status: 'CONCLUIDO',
            naoInformar: false,
            observacoes: '',
            conclusaoColaborador: ''
        });
        setEmpresaSelecionada(null);
        setUnidadeSelecionada(null);
        setSetorSelecionado(null);
        setFuncionarioSelecionado(null);
        setExames([]);
        setRiscos([]);
        setMedicoExaminador(null);
        setMedicoResponsavel(null);
    };

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Cadastrar ASO
                        </h1>
                        <p className="text-gray-600 mt-2">Preencha as informações para cadastrar um novo Atestado de Saúde Ocupacional</p>
                    </div>

                    <div className="space-y-6">
                        <FormSection title="Seleção de Empresa e Funcionário" icon={<Building size={20}/>}>
                            <div className="space-y-4">
                                {/* Seleção de Empresa */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Empresa *
                                    </label>
                                    <InputWithActions
                                        placeholder="Selecione uma empresa..."
                                        value={empresaSelecionada ?
                                            `${empresaSelecionada.razaoSocial} - ${empresaSelecionada.cpfOuCnpj}` :
                                            ''
                                        }
                                        onClick={() => setShowEmpresaModal(true)}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmpresaModal(true)}
                                                    className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                                                >
                                                    <Building size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleClearEmpresa}
                                                    className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        }
                                    />
                                </div>

                                {/* Seleção de Unidade - condicional à empresa */}
                                {empresaSelecionada && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unidade Operacional
                                        </label>
                                        <InputWithActions
                                            placeholder="Selecione uma unidade..."
                                            value={unidadeSelecionada ? unidadeSelecionada.nome : ''}
                                            onClick={() => setShowUnidadeModal(true)}
                                            actions={
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowUnidadeModal(true)}
                                                        className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                                                    >
                                                        <Search size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleClearUnidade}
                                                        className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            }
                                        />
                                    </div>
                                )}

                                {/* Seleção de Setor - condicional à unidade */}
                                {unidadeSelecionada && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Setor
                                        </label>
                                        <InputWithActions
                                            placeholder="Selecione um setor..."
                                            value={setorSelecionado ? setorSelecionado.nome : ''}
                                            onClick={() => setShowSetorModal(true)}
                                            actions={
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowSetorModal(true)}
                                                        className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                                                    >
                                                        <Briefcase size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleClearSetor}
                                                        className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            }
                                        />
                                    </div>
                                )}

                                {/* Lista de Funcionários - aparece após seleção de setor */}
                                {setorSelecionado && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Funcionários Disponíveis *
                                            </label>
                                            {loadingFuncionarios && (
                                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                                    Carregando...
                                                </div>
                                            )}
                                        </div>

                                        {funcionarios.length > 0 ? (
                                            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                                                {funcionarios.map((funcionario) => (
                                                    <div
                                                        key={funcionario.id}
                                                        onClick={() => handleFuncionarioSelect(funcionario)}
                                                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                                            funcionarioSelecionado?.id === funcionario.id ? 'bg-blue-50 border-blue-200' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {funcionario.nome} {funcionario.sobrenome}
                                                                </div>
                                                                <div className="text-sm text-gray-500 mt-1">
                                                                    CPF: {funcionario.cpf} |
                                                                    Função: {funcionario.funcao?.nome || 'Não informado'} |
                                                                    Setor: {funcionario.setor?.nome || 'Não informado'}
                                                                </div>
                                                            </div>
                                                            {funcionarioSelecionado?.id === funcionario.id && (
                                                                <Check size={20} className="text-blue-600 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !loadingFuncionarios && setorSelecionado ? (
                                            <div className="text-center py-8 text-gray-500 border border-gray-300 rounded-lg bg-gray-50">
                                                <User size={48} className="mx-auto mb-4 text-gray-400" />
                                                <p>Nenhum funcionário encontrado</p>
                                                <p className="text-sm">
                                                    Não há funcionários cadastrados neste setor
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </FormSection>

                        {/* Dados do Funcionário - Exibidos após seleção */}
                        {funcionarioSelecionado && (
                            <FormSection title="Dados do Funcionário">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <InfoField label="Nome Completo" value={`${funcionarioSelecionado.nome} ${funcionarioSelecionado.sobrenome}`} />
                                    <InfoField label="CPF" value={funcionarioSelecionado.cpf || 'Não informado'} />
                                    <InfoField label="Data de Nascimento" value={funcionarioSelecionado.dataNascimento ? new Date(funcionarioSelecionado.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'} />
                                    <InfoField label="Empresa" value={funcionarioSelecionado.empresa?.nomeFantasia || funcionarioSelecionado.empresa?.razaoSocial || 'Não informado'} />
                                    <InfoField label="Função" value={funcionarioSelecionado.funcao?.nome || 'Não informado'} />
                                    <InfoField label="Setor" value={funcionarioSelecionado.setor?.nome || 'Não informado'} />
                                    <InfoField label="Data de Admissão" value={funcionarioSelecionado.dataAdmissao ? new Date(funcionarioSelecionado.dataAdmissao).toLocaleDateString('pt-BR') : 'Não informado'} />
                                </div>
                            </FormSection>
                        )}

                        <FormSection title="Informações do ASO">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <InputField
                                    label="Data de Emissão *"
                                    type="date"
                                    value={formData.dataEmissao}
                                    onChange={(e) => handleInputChange('dataEmissao', e.target.value)}
                                />
                                <SelectField
                                    label="Tipo de ASO *"
                                    options={['', 'ADMISSIONAL', 'PERIODICO', 'DEMISSIONAL', 'MUDANCA_DE_FUNCAO', 'RETORNO_AO_TRABALHO']}
                                    value={formData.tipoAso}
                                    onChange={(e) => handleInputChange('tipoAso', e.target.value)}
                                />
                                <SelectField
                                    label="Tipo de Retificação"
                                    options={['ORIGINAL', 'RETIFICACAO']}
                                    value={formData.tipoRetificacao}
                                    onChange={(e) => handleInputChange('tipoRetificacao', e.target.value)}
                                />
                                {formData.tipoRetificacao === 'RETIFICACAO' && (
                                    <InputField
                                        label="Data do ASO Retificado"
                                        type="date"
                                        value={formData.dataAsoRetificado}
                                        onChange={(e) => handleInputChange('dataAsoRetificado', e.target.value)}
                                    />
                                )}
                            </div>
                        </FormSection>

                        <FormSection title="Exames">
                            <div className="flex justify-end mb-4">
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Adicionar Exame
                                </button>
                            </div>
                            {exames.length > 0 ? (
                                <ul className="space-y-2">
                                    {exames.map(exame =>
                                        <ExameUploadItem
                                            key={exame.id}
                                            exame={exame}
                                            onFileChange={handleFileChange}
                                        />
                                    )}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p>Nenhum exame adicionado</p>
                                    <p className="text-sm">Clique em "Adicionar Exame" para começar</p>
                                </div>
                            )}
                        </FormSection>

                        <FormSection title="Riscos Trabalhistas">
                            <p className="text-sm text-gray-500 mb-4">Confirme os riscos que este profissional está exposto neste ASO.</p>
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingRisks(true)}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Adicionar Riscos
                                </button>
                            </div>
                            <div className="space-y-2">
                                {riscos.length > 0 ? riscos.map(risco => (
                                    <div key={risco.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                        <span className="text-sm text-gray-800">{risco.nome}</span>
                                        <button
                                            type="button"
                                            onClick={() => setRiscos(prev => prev.filter(r => r.id !== risco.id))}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )) : <p className="text-sm text-gray-400 text-center py-4">Nenhum risco adicionado.</p>}
                            </div>
                        </FormSection>

                        <FormSection title="Responsáveis">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Médico Examinador *</label>
                                    <InputWithActions
                                        placeholder="Selecione um médico..."
                                        value={medicoExaminador ? medicoExaminador.nome : ''}
                                        onClick={() => openPrestadorModal('medicoExaminadorId')}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openPrestadorModal('medicoExaminadorId')}
                                                    className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                                                >
                                                    <Search size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleClearPrestador('medicoExaminadorId')}
                                                    className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Médico Responsável pelo PCMSO</label>
                                    <InputWithActions
                                        placeholder="Selecione um médico..."
                                        value={medicoResponsavel ? medicoResponsavel.nome : ''}
                                        onClick={() => openPrestadorModal('medicoResponsavelPcmsoId')}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openPrestadorModal('medicoResponsavelPcmsoId')}
                                                    className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                                                >
                                                    <Search size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleClearPrestador('medicoResponsavelPcmsoId')}
                                                    className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        }
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Conclusão do ASO">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                                <SelectField
                                    label="Conclusão"
                                    options={['', 'APTO', 'INAPTO']}
                                    value={formData.conclusaoAso}
                                    onChange={(e) => handleInputChange('conclusaoAso', e.target.value)}
                                />
                                <InputField
                                    label="Dias de Inaptidão"
                                    type="number"
                                    value={formData.diasInapto}
                                    onChange={(e) => handleInputChange('diasInapto', e.target.value)}
                                />
                                <SelectField
                                    label="Status"
                                    options={['CONCLUIDO', 'PENDENTE', 'CANCELADO']}
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                />
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        id="naoInformar"
                                        checked={formData.naoInformar}
                                        onChange={(e) => handleInputChange('naoInformar', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="naoInformar" className="ml-2 text-sm text-gray-700">
                                        Não informar
                                    </label>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    value={formData.observacoes}
                                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Conclusão do Colaborador">
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                placeholder="Conclusão do colaborador sobre o ASO..."
                                value={formData.conclusaoColaborador}
                                onChange={(e) => handleInputChange('conclusaoColaborador', e.target.value)}
                            />
                        </FormSection>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-700 transition-colors"
                            disabled={isLoading}
                        >
                            Limpar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {isLoading ? 'Salvando...' : 'Salvar ASO'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleEmpresaSelect}
            />

            {empresaSelecionada && (
                <UnidadesOperacionaisModal
                    isOpen={showUnidadeModal}
                    onClose={() => setShowUnidadeModal(false)}
                    onSelect={handleUnidadeSelect}
                    empresaId={formData.empresaId}
                />
            )}

            <SetorSearchModal
                isOpen={showSetorModal}
                onClose={() => setShowSetorModal(false)}
                onSelect={handleSetorSelect}
                empresaId={formData.empresaId}
                unidadeId={formData.unidadeId}
            />

            <PrestadorServicoModal
                isOpen={showPrestadorModal}
                onClose={() => setShowPrestadorModal(false)}
                onSelect={handlePrestadorSelect}
            />

            {isAddingRisks && (
                <AdicionarRiscosModal
                    initialSelectedRiscos={riscos}
                    riscosCatalogo={riscosCatalogo}
                    onConfirm={handleConfirmRiscos}
                    onCancel={() => setIsAddingRisks(false)}
                />
            )}
        </>
    );
};


const AdicionarRiscosModal = ({ initialSelectedRiscos, riscosCatalogo, onConfirm, onCancel }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRiscos, setSelectedRiscos] = useState(initialSelectedRiscos);

    const handleToggleRisco = (risco) => {
        setSelectedRiscos(prev =>
            prev.find(r => r.id === risco.id)
                ? prev.filter(r => r.id !== risco.id)
                : [...prev, risco]
        );
    };

    const filteredRiscos = riscosCatalogo.filter(r =>
        r.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.grupo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedRiscos = filteredRiscos.reduce((acc, risco) => {
        const grupo = risco.grupo || 'Outros';
        (acc[grupo] = acc[grupo] || []).push(risco);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Adicionar Riscos</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
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
                    {Object.keys(groupedRiscos).length > 0 ? (
                        <div className="space-y-4">
                            {Object.keys(groupedRiscos).map(grupo => (
                                <div key={grupo}>
                                    <h3 className="font-semibold text-gray-600 mb-2">{grupo}</h3>
                                    <ul className="space-y-2">
                                        {groupedRiscos[grupo].map(risco => (
                                            <li
                                                key={risco.id}
                                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors border ${selectedRiscos.find(r => r.id === risco.id) ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
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
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhum risco encontrado</p>
                            <p className="text-sm">Verifique se há riscos cadastrados no sistema</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-4 p-4 border-t bg-gray-50">
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md font-semibold hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button onClick={() => onConfirm(selectedRiscos)} className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700">
                        Confirmar ({selectedRiscos.length})
                    </button>
                </div>
            </div>
        </div>
    );
};


const FormSection = ({ title, children, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
            {icon && <div className="text-blue-600">{icon}</div>}
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {children}
    </div>
);

const InputWithActions = ({ placeholder, value, actions, className = '', onClick, readOnly = true }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly={readOnly}
            onClick={onClick}
            className={`w-full py-2.5 pl-4 pr-20 border border-gray-300 rounded-lg focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`}
        />
        <div className="absolute right-0 flex">{actions}</div>
    </div>
);

const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md h-9 flex items-center">{value}</p>
    </div>
);

const InputField = ({ label, value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            {...props}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

const SelectField = ({ label, options, value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            {...props}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const SearchableSelect = ({ options, placeholder, label, value, onChange }) => (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            <select
                value={value || ''}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="w-full appearance-none bg-white pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
                <option value="">{placeholder}</option>
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
            </select>
            <div className="absolute right-0 top-0 h-full flex items-center space-x-1 p-2 bg-gray-100 border-l border-gray-300 rounded-r-md">
                <button type="button" className="text-green-600 hover:text-green-800" title="Buscar">
                    <Search size={16} />
                </button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button type="button" className="text-red-600 hover:text-red-800" title="Limpar" onClick={() => onChange && onChange('')}>
                    <X size={16} />
                </button>
            </div>
        </div>
    </div>
);

const ExameUploadItem = ({ exame, onFileChange }) => {
    const fileInputRef = useRef(null);
    const handleButtonClick = () => fileInputRef.current?.click();

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
                        <button
                            type="button"
                            onClick={() => onFileChange(null, exame.id)}
                            className="text-green-700 hover:text-green-900"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleButtonClick}
                        className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100 flex items-center gap-2"
                    >
                        <Upload size={14} /> Anexar Resultado
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e.target.files[0], exame.id)}
                    className="hidden"
                />
            </div>
        </li>
    );
};