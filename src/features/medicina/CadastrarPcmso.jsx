import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import pcmsoService from '../../api/services/pcmso/pcmsoService.js';
import funcaoService from '../../api/services/cadastros/funcoesService.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import PrestadorServicoSearchModal from '../../components/modal/PrestadorServico.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';
import {
     Plus, Edit, Trash2, X, Bold, Italic, Underline,
     List,  Save, ArrowLeft, Search,
    Image as ImageIcon
} from 'lucide-react';


const FormSection = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        {title && <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
);

const InputWithActions = ({ placeholder, value, actions, className = '', onClick }) => (
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

const RichTextEditor = ({ content, onChange, heightClass = 'h-64', readOnly = false }) => {
    const editorRef = useRef(null);

    const handleContentChange = (event) => {
        if (!readOnly && onChange) {
            onChange(event.target.innerHTML);
        }
    };

    const formatDoc = (command, value = null) => {
        if (readOnly || !editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, value);
        if (onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content || '';
        }
    }, [content]);

    const editorButtons = [
        { icon: Bold, action: () => formatDoc('bold') },
        { icon: Italic, action: () => formatDoc('italic') },
        { icon: Underline, action: () => formatDoc('underline') },
        { icon: List, action: () => formatDoc('insertUnorderedList') },
    ];

    return (
        <div className="border border-gray-300 rounded-lg">
            {!readOnly && (
                <div className="flex flex-wrap items-center p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center space-x-1">
                        {editorButtons.map(({ icon: Icon, action }, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={action}
                                className="p-2 text-gray-600 rounded-md hover:bg-gray-200"
                            >
                                <Icon size={16} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div
                ref={editorRef}
                contentEditable={!readOnly}
                onInput={handleContentChange}
                className={`w-full p-4 ${heightClass} overflow-y-auto focus:outline-none rounded-b-lg ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            ></div>
        </div>
    );
};

const TabButton = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-3 -mb-px text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
            isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`}
    >
        {label}
    </button>
);

const TabCapa = ({ onFileChange, onRemove, previewUrl }) => {
    const fileInputRef = useRef(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            onFileChange(file);
        }
    };

    const handleRemoveImage = () => {
        onRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileSelect = () => fileInputRef.current.click();

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">Selecione uma imagem para a capa do documento.</p>
            <div
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
                onClick={triggerFileSelect}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Pré-visualização da Capa" className="max-h-full max-w-full object-contain" />
                ) : (
                    <div className="text-gray-500">
                        <ImageIcon size={48} className="mx-auto mb-2" />
                        <span>Clique para selecionar uma imagem</span>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            {previewUrl && (
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                >
                    <Trash2 size={16} />
                    Remover Imagem
                </button>
            )}
        </div>
    );
};

export default function CadastrarPcmso() {
    const { id: pcmsoId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('capa');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Modais
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [isMedicoModalOpen, setIsMedicoModalOpen] = useState(false);
    const [isElaboradorModalOpen, setIsElaboradorModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);

    // Seleções
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedMedicoResponsavel, setSelectedMedicoResponsavel] = useState(null);
    const [selectedElaboradores, setSelectedElaboradores] = useState([]);
    const [selectedSetores, setSelectedSetores] = useState([]);

    // Estados para exames e riscos
    const [funcoesDosPcmso, setFuncoesDosPcmso] = useState([]);
    const [examesTotais, setExamesTotais] = useState([]);
    const [riscosTotal, setRiscosTotal] = useState([]);

    // Upload de capa
    const [capaImagemFile, setCapaImagemFile] = useState(null);
    const [capaPreviewUrl, setCapaPreviewUrl] = useState(null);


    // Dados do formulário
    const [pcmsoFormData, setPcmsoFormData] = useState({
        unidadeOperacionalId: null,
        medicoResponsavelId: null,
        elaboradoresIds: [],
        status: 'ATIVO',
        dataDocumento: new Date().toISOString().split('T')[0],
        dataVencimento: '',
        introducao: `
            <p>
            O presente documento constitui o <strong>Programa de Controle Médico de Saúde Ocupacional - PCMSO</strong> da empresa <strong>[NOME DA EMPRESA]</strong>, elaborado em conformidade com as diretrizes da Norma Regulamentadora nº 7 (NR-7) da Secretaria de Segurança e Saúde no Trabalho, do Ministério do Trabalho e Emprego.
        </p>
        <p>
            Este programa visa a promoção e preservação da saúde do conjunto de seus trabalhadores, através de ações coordenadas e planejadas com base nos riscos identificados no <strong>Programa de Gerenciamento de Riscos - PGR</strong>.
        </p>
                
        `,
        sobrePcmso: `
        <p>
            O PCMSO tem caráter de <strong>prevenção, rastreamento e diagnóstico precoce</strong> dos agravos à saúde relacionados ao trabalho, inclusive de natureza subclínica, além da constatação da existência de casos de doenças profissionais ou danos irreversíveis à saúde dos trabalhadores.
        </p>
        <p>
            São diretrizes deste programa:
        </p>
        <ul>
            <li>Rastrear e detectar precocemente os agravos à saúde relacionados ao trabalho;</li>
            <li>Definir a aptidão de cada empregado para exercer suas funções ou tarefas determinadas;</li>
            <li>Subsidiar a emissão dos Atestados de Saúde Ocupacional (ASO).</li>
        </ul>
        <p>
            Para tal, o PCMSO inclui a realização obrigatória dos seguintes exames médicos:
        </p>
        <ul>
            <li>Admissional;</li>
            <li>Periódico;</li>
            <li>De retorno ao trabalho;</li>
            <li>De mudança de riscos ocupacionais;</li>
            <li>Demissional;</li>
        </ul>
        `,
        conclusao: `
            <p>
    Este Programa de Controle Médico de Saúde Ocupacional (PCMSO) foi elaborado com base nos riscos ocupacionais identificados e visa ser uma ferramenta dinâmica na gestão da saúde ocupacional desta organização.
        </p>
        <p>
            As diretrizes e planejamentos aqui contidos devem ser seguidos por todos os níveis da empresa. A eficácia deste programa depende da colaboração contínua entre empregador, trabalhadores e a equipe de saúde responsável.
        </p>
        <p>
            O presente PCMSO tem validade de <strong>1 (um) ano</strong>, devendo ser revisado sempre que houver mudanças nos processos de trabalho que impliquem em novos riscos à saúde dos trabalhadores.
        </p>
        `,
        exames: []
    });


    useEffect(() => {
        if (selectedEmpresa) {
            const nomeDaEmpresa = selectedEmpresa.razaoSocial;

            setPcmsoFormData(prev => ({
                ...prev,
                introducao: prev.introducao.replace('[NOME DA EMPRESA]', nomeDaEmpresa)
            }));
        }
    }, [selectedEmpresa]);

    useEffect(() => {
        if (pcmsoId) {
            const carregarPCMSO = async () => {
                try {
                    const data = await pcmsoService.getPcmsoById(pcmsoId);

                    setPcmsoFormData({
                        ...data,
                        dataDocumento: data.dataDocumento?.split('T')[0] || '',
                        dataVencimento: data.dataVencimento?.split('T')[0] || ''
                    });

                    if (data.unidadeOperacional) {
                        setSelectedUnidade(data.unidadeOperacional);
                        if (data.unidadeOperacional.empresa) {
                            setSelectedEmpresa(data.unidadeOperacional.empresa);
                        }
                    }

                    // Normaliza a estrutura de setores para sempre ser um array
                    let setoresDoPcmso = [];
                    if (data.setores && Array.isArray(data.setores)) {
                        // Caso 1: Backend retorna um array de setores no nível principal
                        setoresDoPcmso = data.setores;
                    } else if (data.setor && typeof data.setor === 'object' && !Array.isArray(data.setor)) {
                        // Caso 2: Backend retorna um único objeto de setor no nível principal
                        setoresDoPcmso = [data.setor];
                    } else if (data.unidadeOperacional && data.unidadeOperacional.setores && Array.isArray(data.unidadeOperacional.setores)) {
                        // Caso 3 (estrutura antiga): Backend retorna um array dentro de unidadeOperacional
                        setoresDoPcmso = data.unidadeOperacional.setores;
                    }
                    setSelectedSetores(setoresDoPcmso);

                    if (data.medicoResponsavel) {
                        setSelectedMedicoResponsavel(data.medicoResponsavel);
                    }

                    if (data.elaboradores) {
                        setSelectedElaboradores(data.elaboradores);
                    }

                    if (data.imagemCapa) {
                        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
                        const newUrl = apiBaseUrl + data.imagemCapa;
                        setCapaPreviewUrl(newUrl);
                    } 
                } catch (error) {
                    console.error("Erro ao carregar PCMSO:", error);
                    toast.error("Erro ao carregar os dados para edição.");
                    navigate('/medicina/pcmso');
                }
            };
            carregarPCMSO();
        }
    }, [pcmsoId, navigate]);

    useEffect(() => {
        const buscarFuncoesEExames = async () => {
            if (selectedSetores.length === 0) {
                setFuncoesDosPcmso([]);
                setExamesTotais([]);
                setRiscosTotal([]);
                return;
            }

            try {
                const todasFuncoes = [];
                for (const setor of selectedSetores) {
                    const response = await funcaoService.getFuncoesBySetorId(setor.id);
                    const funcoes = response?.data?.content || response?.data || [];
                    if (!Array.isArray(funcoes)) {
                        console.warn(`Resposta inesperada para setor ${setor.nome}:`, response);
                        continue;
                    }
                    for (const funcao of funcoes) {
                        todasFuncoes.push({ ...funcao, setorNome: setor.nome });
                    }
                }
                setFuncoesDosPcmso(todasFuncoes);

                if (pcmsoId && pcmsoFormData.exames && pcmsoFormData.exames.length > 0) {
                    const activeFuncaoIds = new Set(todasFuncoes.map(f => f.id));
                    const examesMap = new Map();
                    const riscosMap = new Map();
                    const funcaoToSetorMap = new Map(todasFuncoes.map(f => [f.id, f.setorNome]));

                    pcmsoFormData.exames
                        .filter(exame => activeFuncaoIds.has(exame.funcaoId))
                        .forEach(exame => {
                            const funcaoInfo = { id: exame.funcaoId, nome: exame.nomeFuncao, setor: funcaoToSetorMap.get(exame.funcaoId) || 'Setor não encontrado' };
                            const exameKey = `${exame.exameId}-${exame.tipoExame}`;
                            if (!examesMap.has(exameKey)) {
                                examesMap.set(exameKey, { exameId: exame.exameId, nomeExame: exame.nomeExame, codigoExame: exame.codigoExame, tipoExame: exame.tipoExame, periodicidadeMeses: exame.periodicidadeMeses, funcoes: [] });
                            }
                            examesMap.get(exameKey).funcoes.push(funcaoInfo);

                            if (exame.riscos) {
                                exame.riscos.forEach(risco => {
                                    const riscoInfo = risco.riscoCatalogo;
                                    if (riscoInfo && !riscosMap.has(riscoInfo.id)) {
                                        riscosMap.set(riscoInfo.id, { ...riscoInfo, funcoes: [] });
                                    }
                                    if (riscoInfo && !riscosMap.get(riscoInfo.id).funcoes.some(f => f.id === exame.funcaoId)) {
                                        riscosMap.get(riscoInfo.id).funcoes.push(funcaoInfo);
                                    }
                                });
                            }
                        });
                    setExamesTotais(Array.from(examesMap.values()));
                    setRiscosTotal(Array.from(riscosMap.values()));
                } else if (selectedUnidade?.id) {
                    // CREATE MODE: (Mantendo a lógica simulada por enquanto)
                    const examesTotaisMap = new Map();
                    const riscosTotalMap = new Map();
                    todasFuncoes.forEach(funcao => {
                        const examesSimulados = [
                            { exameId: 1, nomeExame: "1,1-dicloro-2,2-bis (P-clorofeniletileno)", codigoExame: "0001", tipoExame: "ADMISSIONAL", periodicidadeMeses: 12 },
                            { exameId: 2, nomeExame: "1,1,1-tricloroetano", codigoExame: "0002", tipoExame: "PERIODICO", periodicidadeMeses: 12 }
                        ];
                        examesSimulados.forEach(exame => {
                            const key = `${exame.exameId}-${exame.tipoExame}`;
                            if (!examesTotaisMap.has(key)) {
                                examesTotaisMap.set(key, { ...exame, funcoes: [] });
                            }
                            examesTotaisMap.get(key).funcoes.push({ id: funcao.id, nome: funcao.nome, setor: funcao.setorNome });
                        });
                        const riscosSimulados = [
                            { id: 3, grupo: "GRUPO_1_FISICOS", descricao: "Radiações ionizantes" },
                            { id: 4, grupo: "GRUPO_1_FISICOS", descricao: "Radiações não ionizantes" }
                        ];
                        riscosSimulados.forEach(risco => {
                            if (!riscosTotalMap.has(risco.id)) {
                                riscosTotalMap.set(risco.id, { ...risco, funcoes: [] });
                            }
                            riscosTotalMap.get(risco.id).funcoes.push({ id: funcao.id, nome: funcao.nome, setor: funcao.setorNome });
                        });
                    });
                    setExamesTotais(Array.from(examesTotaisMap.values()));
                    setRiscosTotal(Array.from(riscosTotalMap.values()));
                }
            } catch (error) {
                console.error('Erro ao buscar funções e exames:', error);
                toast.error('Erro ao carregar exames e riscos das funções.');
            }
        };

        buscarFuncoesEExames();
    }, [selectedSetores, selectedUnidade, pcmsoId, pcmsoFormData.exames]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPcmsoFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRichTextChange = (field, content) => {
        setPcmsoFormData(prev => ({ ...prev, [field]: content }));
    };

    const handleCapaFileChange = (file) => {
        setCapaImagemFile(file);
        if (file) {
            setCapaPreviewUrl(URL.createObjectURL(file));
        } else {
            setCapaPreviewUrl(null);
        }
    };

    const handleRemoveCapaFile = () => {
        setCapaImagemFile(null);
        setCapaPreviewUrl(null);
    };

    const validarFormulario = () => {
        const erros = [];

        if (!selectedEmpresa) erros.push("Empresa é obrigatória.");
        if (!selectedUnidade) erros.push("Unidade Operacional é obrigatória.");
        if (!selectedMedicoResponsavel) erros.push("Médico responsável é obrigatório.");
        if (!pcmsoFormData.dataDocumento) erros.push("Data do documento é obrigatória.");
        if (!pcmsoFormData.dataVencimento) erros.push("Data de vencimento é obrigatória.");

        if (erros.length > 0) {
            erros.forEach(msg => toast.warning(msg));
            return false;
        }
        return true;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setIsSaving(true);

        const newExamesArray = [];
        const funcaoRiscosMap = new Map(); 

        riscosTotal.forEach(risco => {
            risco.funcoes.forEach(funcao => {
                if (!funcaoRiscosMap.has(funcao.id)) {
                    funcaoRiscosMap.set(funcao.id, new Set());
                }
                funcaoRiscosMap.get(funcao.id).add(risco.id);
            });
        });

        examesTotais.forEach(exame => {
            exame.funcoes.forEach(funcao => {
                const riscosForFuncao = Array.from(funcaoRiscosMap.get(funcao.id) || []);
                newExamesArray.push({
                    funcaoId: funcao.id,
                    exameId: exame.exameId,
                    tipoExame: exame.tipoExame,
                    periodicidadeMeses: exame.periodicidadeMeses,
                    riscos: riscosForFuncao.map(id => ({ riscoId: id }))
                });
            });
        });

        try {
            const payload = {
                unidadeOperacionalId: selectedUnidade?.id,
                medicoResponsavelId: selectedMedicoResponsavel?.id,
                elaboradoresIds: selectedElaboradores.map(e => e.id),
                status: pcmsoFormData.status,
                dataDocumento: pcmsoFormData.dataDocumento,
                dataVencimento: pcmsoFormData.dataVencimento,
                introducao: pcmsoFormData.introducao,
                sobrePcmso: pcmsoFormData.sobrePcmso,
                conclusao: pcmsoFormData.conclusao,
                exames: newExamesArray
            };

            if (pcmsoId) {
                await pcmsoService.updatePcmso(pcmsoId, payload, capaImagemFile);
            } else {
                await pcmsoService.createPcmso(payload, capaImagemFile);
            }

            setShowSuccessModal(true);
            setTimeout(() => {
                navigate('/medicina/pcmso');
            }, 1500);

        } catch (error) {
            console.error('Erro ao salvar PCMSO:', error);
            toast.error('Erro ao salvar PCMSO. Verifique os dados e tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };


    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        setIsEmpresaModalOpen(false);
        setSelectedUnidade(null);
    };

    const handleSelectUnidade = (unidade) => {
        setSelectedUnidade(unidade);
        setIsUnidadeModalOpen(false);
        setPcmsoFormData(prev => ({ ...prev, unidadeOperacionalId: unidade.id }));
    };

    const handleSelectMedico = (medico) => {
        setSelectedMedicoResponsavel(medico);
        setIsMedicoModalOpen(false);
        setPcmsoFormData(prev => ({ ...prev, medicoResponsavelId: medico.id }));
    };

    const handleSelectElaborador = (elaborador) => {
        if (!selectedElaboradores.some(e => e.id === elaborador.id)) {
            setSelectedElaboradores(prev => [...prev, elaborador]);
        }
        setIsElaboradorModalOpen(false);
    };

    const handleRemoveElaborador = (elaboradorId) => {
        setSelectedElaboradores(prev => prev.filter(e => e.id !== elaboradorId));
    };

    const mainTabs = [
        { id: 'capa', label: 'Capa', component: <TabCapa onFileChange={handleCapaFileChange} onRemove={handleRemoveCapaFile} previewUrl={capaPreviewUrl} /> },
        { id: 'introducao', label: 'Introdução', component: <RichTextEditor content={pcmsoFormData.introducao} onChange={(c) => handleRichTextChange('introducao', c)} /> },
        { id: 'sobre', label: 'Sobre o PCMSO', component: <RichTextEditor content={pcmsoFormData.sobrePcmso} onChange={(c) => handleRichTextChange('sobrePcmso', c)} /> },
        { id: 'conclusao', label: 'Conclusão', component: <RichTextEditor content={pcmsoFormData.conclusao} onChange={(c) => handleRichTextChange('conclusao', c)} /> },
    ];

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="container mx-auto">
                <header className="mb-6">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => navigate('/medicina/pcmso')}
                            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
                        >
                            <ArrowLeft size={20} className="mr-1" /> Voltar
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {pcmsoId ? `Editar PCMSO #${pcmsoId}` : 'Cadastrar PCMSO'}
                        </h1>
                    </div>
                </header>

                <form onSubmit={handleSave}>
                    <FormSection title="Informações Básicas">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-600">Empresa *</label>
                            <InputWithActions
                                placeholder="Selecione uma empresa"
                                value={selectedEmpresa ? selectedEmpresa.razaoSocial : ''}
                                onClick={() => setIsEmpresaModalOpen(true)}
                                actions={
                                    selectedEmpresa ? (
                                        <button type="button" onClick={() => setSelectedEmpresa(null)}
                                                className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md">
                                            <X size={18}/>
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => setIsEmpresaModalOpen(true)}
                                                className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                            <Search size={18}/>
                                        </button>
                                    )
                                }
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-600">Unidade Operacional *</label>
                            <InputWithActions
                                placeholder="Selecione uma unidade operacional"
                                value={selectedUnidade ? selectedUnidade.nome : ''}
                                onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                actions={
                                    <button type="button"
                                            onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                            disabled={!selectedEmpresa}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md disabled:bg-gray-400">
                                        <Search size={18}/>
                                    </button>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Data do Documento *</label>
                            <input
                                type="date"
                                name="dataDocumento"
                                value={pcmsoFormData.dataDocumento}
                                onChange={handleInputChange}
                                className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Data de Vencimento *</label>
                            <input
                                type="date"
                                name="dataVencimento"
                                value={pcmsoFormData.dataVencimento}
                                onChange={handleInputChange}
                                className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Médico Responsável *</label>
                            <InputWithActions
                                placeholder="Selecione o médico responsável"
                                value={selectedMedicoResponsavel ? `${selectedMedicoResponsavel.nome} ${selectedMedicoResponsavel.sobrenome}` : ''}
                                onClick={() => setIsMedicoModalOpen(true)}
                                actions={
                                    <button type="button" onClick={() => setIsMedicoModalOpen(true)}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                        <Search size={18}/>
                                    </button>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Situação *</label>
                            <select
                                name="status"
                                value={pcmsoFormData.status}
                                onChange={handleInputChange}
                                className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="ATIVO">Ativo</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                        </div>
                    </FormSection>

                    <FormSection title="Elaboradores" className="mt-6">
                        <div className="col-span-full">
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-600">Elaboradores</label>
                                <InputWithActions
                                    placeholder="Clique para adicionar elaboradores"
                                    value=""
                                    onClick={() => setIsElaboradorModalOpen(true)}
                                    actions={
                                        <button type="button" onClick={() => setIsElaboradorModalOpen(true)}
                                                className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                            <Plus size={18}/>
                                        </button>
                                    }
                                />
                            </div>
                            <div className="mt-2 border rounded-md p-2 space-y-2 min-h-[50px]">
                                {selectedElaboradores.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">Nenhum elaborador selecionado.</p>
                                )}
                                {selectedElaboradores.map((elaborador) => (
                                    <div key={elaborador.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                        <span>{elaborador.nome} {elaborador.sobrenome}</span>
                                        <button type="button" onClick={() => handleRemoveElaborador(elaborador.id)}
                                                className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FormSection>

                    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                        <div className="border-b border-gray-200 overflow-x-auto">
                            <nav className="flex space-x-2">
                                {mainTabs.map(tab => (
                                    <TabButton
                                        key={tab.id}
                                        label={tab.label}
                                        isActive={activeTab === tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                    />
                                ))}
                            </nav>
                        </div>
                        <div className="mt-6">
                            {mainTabs.find(tab => tab.id === activeTab)?.component}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">Exames e Riscos</h3>
                        <p className="text-sm text-gray-600 mb-4">Para cadastrar ou visualizar os exames e os Riscos PGR, escolha o setor e a função.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Setor</label>
                                <InputWithActions
                                    placeholder="Selecione um setor"
                                    value={selectedSetores.map(s => s.nome).join(', ')}
                                    onClick={() => selectedEmpresa && setIsSetorModalOpen(true)}
                                    actions={
                                        <button type="button"
                                                onClick={() => selectedEmpresa && setIsSetorModalOpen(true)}
                                                disabled={!selectedEmpresa}
                                                className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md disabled:bg-gray-400">
                                            <Plus size={18}/>
                                        </button>
                                    }
                                />
                            </div>
                        </div>

                        {selectedSetores.length > 0 && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                <h4 className="font-semibold mb-2">Setores Selecionados:</h4>
                                <div className="space-y-2">
                                    {selectedSetores.map(setor => (
                                        <div key={setor.id} className="flex justify-between items-center bg-white p-2 rounded">
                                            <span>{setor.nome}</span>
                                            <button type="button"
                                                    onClick={() => setSelectedSetores(prev => prev.filter(s => s.id !== setor.id))}
                                                    className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Exibição de Funções */}
                        {funcoesDosPcmso.length > 0 && (
                            <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                                <h4 className="font-semibold mb-3 text-blue-800">Funções Encontradas:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {funcoesDosPcmso.map(funcao => (
                                        <div key={`${funcao.id}-${funcao.setorNome}`} className="bg-white p-3 rounded border">
                                            <div className="font-medium text-gray-900">{funcao.nome}</div>
                                            <div className="text-sm text-gray-600">Setor: {funcao.setorNome}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Exibição de Exames */}
                        {examesTotais.length > 0 && (
                            <div className="mt-6 p-4 border rounded-lg bg-green-50">
                                <h4 className="font-semibold mb-3 text-green-800">Exames das Funções:</h4>
                                <div className="space-y-4">
                                    {examesTotais.map((exame, index) => (
                                        <div key={`${exame.exameId}-${exame.tipoExame}-${index}`} className="bg-white p-4 rounded border">
                                            <div className="font-medium text-gray-900 mb-2">{exame.nomeExame}</div>
                                            <div className="text-sm text-gray-600 mb-1">Código: {exame.codigoExame}</div>
                                            <div className="text-sm text-gray-600 mb-1">Tipo: {exame.tipoExame}</div>
                                            <div className="text-sm text-gray-600 mb-2">Periodicidade: {exame.periodicidadeMeses} meses</div>
                                            <div className="text-sm text-gray-600 mb-2">Funções que requerem este exame:</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {exame.funcoes.map((funcao, funcaoIndex) => (
                                                    <div key={funcaoIndex} className="text-xs bg-gray-100 p-2 rounded">
                                                        <span className="font-medium">{funcao.nome}</span>
                                                        <span className="text-gray-500"> ({funcao.setor})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Exibição de Riscos */}
                        {riscosTotal.length > 0 && (
                            <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
                                <h4 className="font-semibold mb-3 text-yellow-800">Riscos PGR das Funções:</h4>
                                <div className="space-y-4">
                                    {riscosTotal.map(risco => (
                                        <div key={risco.id} className="bg-white p-4 rounded border">
                                            <div className="font-medium text-gray-900 mb-1">{risco.descricao}</div>
                                            <div className="text-sm text-gray-600 mb-2">Grupo: {risco.grupo}</div>
                                            <div className="text-sm text-gray-600 mb-2">Funções expostas a este risco:</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {risco.funcoes.map((funcao, index) => (
                                                    <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                                                        <span className="font-medium">{funcao.nome}</span>
                                                        <span className="text-gray-500"> ({funcao.setor})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSetores.length > 0 && funcoesDosPcmso.length === 0 && (
                            <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-center">
                                <p className="text-gray-600">Nenhuma função encontrada para os setores selecionados.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/medicina/pcmso')}
                            className="bg-gray-500 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> {pcmsoId ? 'Salvar Alterações' : 'Salvar PCMSO'}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Modais */}
                <EmpresaSearchModal
                    isOpen={isEmpresaModalOpen}
                    onClose={() => setIsEmpresaModalOpen(false)}
                    onSelect={handleSelectEmpresa}
                />

                {selectedEmpresa && (
                    <UnidadesOperacionaisModal
                        isOpen={isUnidadeModalOpen}
                        onClose={() => setIsUnidadeModalOpen(false)}
                        onSelect={handleSelectUnidade}
                        empresaId={selectedEmpresa.id}
                    />
                )}

                <PrestadorServicoSearchModal
                    isOpen={isMedicoModalOpen}
                    onClose={() => setIsMedicoModalOpen(false)}
                    onSelect={handleSelectMedico}
                />

                <PrestadorServicoSearchModal
                    isOpen={isElaboradorModalOpen}
                    onClose={() => setIsElaboradorModalOpen(false)}
                    onSelect={handleSelectElaborador}
                />

                {selectedEmpresa && (
                    <SetorSearchModal
                        isOpen={isSetorModalOpen}
                        onClose={() => setIsSetorModalOpen(false)}
                        onSelect={(setor) => {
                            if (!selectedSetores.some(s => s.id === setor.id)) {
                                setSelectedSetores(prev => [...prev, setor]);
                            }
                            setIsSetorModalOpen(false);
                        }}
                        empresaId={selectedEmpresa.id}
                    />
                )}

                {/* Modal de Sucesso */}
                {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">PCMSO salvo com sucesso</h3>
                                <p className="text-gray-600">Redirecionando...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};