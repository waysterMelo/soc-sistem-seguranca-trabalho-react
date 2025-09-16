import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import ltcatService from '../../api/services/ltcat/ltcatService.js';
import setorService from '../../api/services/cadastros/Setor/setorService.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import PrestadorServicoSearchModal from '../../components/modal/PrestadorServico.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';
import AparelhagemLtcatModal from '../../components/modal/AparelhagemLtcatModal.jsx';

import {
    Search, Trash2, Plus, Bold, Italic, Underline, List, Image as ImageIcon, X
} from 'lucide-react';

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

const RichTextEditor = ({ content, onChange, heightClass = 'h-64', readOnly = false }) => {
    const editorRef = React.useRef(null);

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

    React.useEffect(() => {
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

const TabCapa = ({ onFileChange, initialImageUrl }) => {
    const fileInputRef = React.useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

     useEffect(() => {
        if (initialImageUrl) {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
            
        
            try {
                 const fullUrl = new URL(apiBaseUrl + initialImageUrl);
                 setPreviewUrl(fullUrl.href);
            } catch (error) {
                 console.error("URL da imagem inválida:", error);
                 setPreviewUrl(apiBaseUrl + initialImageUrl);
            }
        }
    }, [initialImageUrl]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            // Ao selecionar uma nova imagem, o preview é atualizado com a URL local.
            setPreviewUrl(URL.createObjectURL(file));
            onFileChange(file);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        onFileChange(null);
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

const TabButton = ({label, isActive, onClick}) => (<button type="button" onClick={onClick}
    className={`px-4 py-3 -mb-px text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{label}</button>);

export default function CadastrarLTCAT() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('capa');
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [isPrestadorModalOpen, setIsPrestadorModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isAparelhagemModalOpen, setIsAparelhagemModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedProfissionais, setSelectedProfissionais] = useState([]);
    const [selectedSetores, setSelectedSetores] = useState([]);
    const [selectedAparelhos, setSelectedAparelhos] = useState([]);
    const [initialImageUrl, setInitialImageUrl] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const ITENS_POR_PAGINA = 5;
    const [laudoSubTab, setLaudoSubTab] = useState('responsabilidade');
    const laudoSubTabs = [
        { id: 'responsabilidade', label: 'Responsabilidade Técnica', field: 'laudoResponsabilidadeTecnica' },
        { id: 'introducao', label: 'Introdução', field: 'laudoIntroducao' },
        { id: 'objetivos', label: 'Objetivos', field: 'laudoObjetivos' },
        { id: 'consideracoes', label: 'Considerações Gerais', field: 'laudoConsideracoesGerais' },
        { id: 'criterios', label: 'Critérios de Avaliação', field: 'laudoCriteriosAvaliacao' },
        ];
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
        laudoResponsabilidadeTecnica: `
        <p>O presente documento terá a responsabilidade técnica e é assinado pelo <strong>Engenheiro de Segurança do Trabalho [NOME DO PROFISSIONAL SELECIONADO]</strong>.</p>

<p>A habilitação para executar tal tarefa está explícita na <strong>Constituição Federal</strong>, no <strong>Título II – dos Direitos e Garantias Fundamentais</strong>, <strong>Capítulo I – dos Direitos e Deveres Individuais</strong> e <strong>Artigo 5º – Item XIII</strong>; no <strong>Artigo 195 da CLT</strong>; e na <strong>Resolução nº 359 de 31/07/91</strong>, do <strong>Conselho Federal de Engenharia – CONFEA</strong>.</p>
        `,
        laudoIntroducao: `
            <p>O <strong>Laudo Técnico das Condições Ambientais de Trabalho (LTCAT)</strong> é um documento técnico legal, assinado por profissional responsável qualificado e legalmente constituído, podendo ser utilizado para subsidiar a elaboração de programas e ações de prevenção referentes à segurança e saúde ocupacional, tais como:</p>

<ul>
  <li>Programa de Gerenciamento de Riscos (PGR)</li>
  <li>Programa de Controle Médico de Saúde Ocupacional (PCMSO)</li>
  <li>Emissão do Perfil Profissiográfico Previdenciário (PPP)</li>
</ul>

<p>Esse documento apresenta-se tanto como um <strong>atestado das ações preventivas já implementadas na empresa</strong>, quanto como uma <strong>ferramenta de gestão na busca de melhorias nas condições de trabalho</strong>.</p>
        `,
        laudoObjetivos: `
        <p>O LTCAT tem por finalidade:</p>

<ul>
  <li>
    Cumprir as exigências da legislação previdenciária – <strong>Art. 58 da Lei nº 9.528, de 10.12.97</strong>;
  </li>
  <li>
    Dar sustentabilidade técnica às condições ambientais existentes na empresa e subsidiar o enquadramento de tais atividades no referente ao recolhimento das denominadas <strong>Alíquotas Suplementares do Seguro de Acidentes do Trabalho (SAT)</strong>, criadas pelo texto da <strong>Lei nº 9.732, de 11.12.98</strong>;
  </li>
  <li>
    Avaliar as condições, os ambientes de trabalho e determinar a caracterização da exposição dos empregados aos agentes nocivos, segundo a legislação trabalhista e previdenciária vigentes;
  </li>
  <li>
    Caracterizar as condições do ambiente de trabalho quanto à <strong>insalubridade ou não</strong> e quanto à <strong>periculosidade ou não</strong> das atividades e operações desenvolvidas pelos empregados.
  </li>
</ul>
        `,
        laudoConsideracoesGerais: `
            <p>O presente <strong>Laudo Técnico de Condições Ambientais de Trabalho (LTCAT)</strong> foi elaborado com base em vistorias técnicas, medições ambientais e análise documental, observando-se a legislação trabalhista e previdenciária vigente, em especial as Normas Regulamentadoras do Ministério do Trabalho e Emprego (MTE) e demais normas aplicáveis.</p>
<p>Ressalta-se que as informações aqui contidas <strong>refletem as condições existentes na data da inspeção</strong>, podendo sofrer alterações em decorrência de modificações no ambiente de trabalho, processos produtivos, tecnologias ou organização do trabalho.</p>
<p>Assim, recomenda-se a <strong>constante atualização do presente laudo</strong>, bem como a <strong>implementação de medidas de controle e prevenção de riscos ocupacionais</strong>, visando garantir a integridade física e a saúde dos trabalhadores.</p>
        `,
        laudoCriteriosAvaliacao: `
        <p>A avaliação das condições ambientais de trabalho foi conduzida segundo os parâmetros estabelecidos pela legislação vigente, incluindo:</p>
<ul>
    <li>Consolidação das Leis do Trabalho (CLT)</li>
    <li>Normas Regulamentadoras (NRs)</li>
    <li>Notas Técnicas e Instruções Normativas do INSS</li>
    <li>Normas de Higiene Ocupacional (NHOs) da FUNDACENTRO</li>
    <li>Normas Brasileiras (NBRs) aplicáveis</li>
</ul>
<p>Foram utilizados <strong>métodos reconhecidos de amostragem, medição e análise</strong> de agentes físicos, químicos e biológicos, comparando-se os resultados obtidos com os limites de tolerância definidos pela legislação e referências técnicas nacionais e internacionais.</p>
<p>O enquadramento das atividades e a caracterização da exposição consideraram, ainda, a <strong>habitualidade e permanência do trabalhador</strong> frente aos agentes nocivos, em conformidade com os critérios técnicos e legais.</p>
        `,
        recomendacoesTecnicas: `
        <p>Com base na análise realizada, recomenda-se a <strong>adoção contínua de medidas de prevenção e controle dos riscos ambientais</strong> identificados, em conformidade com a legislação trabalhista e previdenciária vigente.</p>
<p>Devem ser priorizadas as seguintes ações:</p>
<ul>
    <li><strong>Eliminação ou redução da exposição</strong> a agentes nocivos, por meio de melhorias nos processos, adequação de máquinas e equipamentos, e utilização de tecnologias mais seguras.</li>
    <li>Implementação de <strong>medidas de proteção coletiva (EPCs)</strong>.</li>
    <li>Fornecimento e gestão adequada de <strong>Equipamentos de Proteção Individual (EPIs)</strong>.</li>
</ul>
<p>Recomenda-se ainda a <strong>manutenção de programas de saúde ocupacional</strong>, como o PCMSO e o PGR, além de <strong>treinamentos periódicos</strong> aos trabalhadores, de forma a garantir a conscientização e o uso correto das medidas de proteção implementadas.</p>
        `,
        conclusao: `
        <p>O presente <strong>Laudo Técnico de Condições Ambientais de Trabalho (LTCAT)</strong> foi elaborado de acordo com os critérios técnicos e legais aplicáveis, refletindo a realidade das condições laborais observadas na data de sua emissão.</p>
<p>As informações aqui registradas visam subsidiar o cumprimento das exigências previdenciárias e trabalhistas, bem como orientar a adoção de medidas de prevenção e promoção da saúde ocupacional.</p>
<p>Ressalta-se a <strong>necessidade de atualização periódica do laudo</strong>, especialmente em situações de alteração de processos, ambientes ou organização do trabalho, garantindo assim a efetividade do gerenciamento de riscos e a preservação da saúde dos trabalhadores.</p>
        `,
    });
    const [capaImagemFile, setCapaImagemFile] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [funcoesDoLTCAT, setFuncoesDoLTCAT] = useState([]);

    useEffect(() => {
    if (id) {
        const carregarLTCAT = async () => {
            try {
                const data = await ltcatService.getLtcatById(id);

                // 1. Popula o formulário com todos os dados do LTCAT
                setLtcatData({
                    ...data,
                    dataDocumento: data.dataDocumento?.split('T')[0] || '',
                    dataVencimento: data.dataVencimento?.split('T')[0] || '',
                    // Garante que cidade e estado sejam preenchidos a partir da unidade
                    cidade: data.unidadeOperacional?.cidade || '',
                    estado: data.unidadeOperacional?.estado || ''
                });

                // 2. Define a unidade e a empresa selecionadas
                if (data.unidadeOperacional) {
                    setSelectedUnidade(data.unidadeOperacional);
                    if (data.unidadeOperacional.empresa) {
                        setSelectedEmpresa(data.unidadeOperacional.empresa);
                    }
                }

                // 3. Popula as listas de entidades relacionadas
                setInitialImageUrl(data.imagemCapa);
                setSelectedProfissionais(data.prestadoresServico || []);
                setSelectedAparelhos(data.aparelhos || []);
                setFuncoesDoLTCAT(data.funcoes || []);

                // 4. Extrai e define os setores a partir das funções retornadas
                if (data.funcoes && data.funcoes.length > 0) {
                    const setoresUnicos = data.funcoes.reduce((acc, funcao) => {
                        if (funcao.setor && !acc.some(s => s.id === funcao.setor.id)) {
                            acc.push(funcao.setor);
                        }
                        return acc;
                    }, []);
                    setSelectedSetores(setoresUnicos);
                }

            } catch (error) {
                console.error("Erro ao carregar LTCAT:", error);
                toast.error("Erro ao carregar os dados para edição.");
                navigate('/seguranca/ltcat');
            }
        };
        carregarLTCAT();
    }
    }, [id, navigate]);

    useEffect(() => {
        if (selectedProfissionais.length > 0) {
            const profissional = selectedProfissionais[0];
            const nomeCompleto = `${profissional.nome} ${profissional.sobrenome}`;
            
            setLtcatData(prev => ({
                ...prev,
                laudoResponsabilidadeTecnica: prev.laudoResponsabilidadeTecnica.replace(
                    '[NOME DO PROFISSIONAL SELECIONADO]',
                    nomeCompleto
                )
            }));
        }
    }, [selectedProfissionais]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setLtcatData(prev => ({...prev, [name]: value}));
    };

    const validarFormulario = () => {
    const erros = [];

    if (!selectedEmpresa) erros.push("Empresa é obrigatória.");
    if (!selectedUnidade) erros.push("Unidade Operacional é obrigatória.");
    if (selectedProfissionais.length === 0) erros.push("Selecione pelo menos um profissional.");
    if (selectedSetores.length === 0) erros.push("Selecione pelo menos um setor.");
    if (!ltcatData.dataDocumento) erros.push("Data do documento é obrigatória.");
    if (!ltcatData.dataVencimento) erros.push("Data de vencimento é obrigatória.");

    if (erros.length > 0) {
        erros.forEach(msg => toast.warning(msg));
        return false;
    }
    return true;
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
  if (!validarFormulario()) return;

  try {
   
    const fonteDeFuncoes = id ? funcoesDoLTCAT : selectedSetores.flatMap(setor => setor.funcoes || []);
    const funcoesIds = [...new Set(fonteDeFuncoes.map(f => f.id))];

    const agentesNocivos = fonteDeFuncoes.flatMap(funcao =>
    (funcao.agentesNocivosEsocial || []).map(agente => ({
        agenteNocivoId: agente.agenteNocivoCatalogo.id,
        funcaoId: funcao.id
    }))
    );

    // Prepara o payload final
    const payload = {
      ...ltcatData,
      unidadeOperacionalId: selectedUnidade?.id || null,
      prestadoresServicoIds: selectedProfissionais.map(p => p.id),
      funcoesIds,
      agentesNocivos,
      profissionaisAmbientaisIds: [],
      aparelhosIds: selectedAparelhos.map(a => a.id),
      bibliografiasIds: [],
      empresasContratantesIds: []
    };

    // Remove campo não utilizado na API
    delete payload.imagemCapa;

    // Envia os dados
    if (id) {
      await ltcatService.updateLtcat(id, payload, capaImagemFile);
      setShowSuccessModal(true);
      setTimeout(() => navigate('/seguranca/ltcat'), 1500);
    } else {
      await ltcatService.createLtcat(payload, capaImagemFile);
      setShowSuccessModal(true);
      setTimeout(() => navigate('/seguranca/ltcat'), 2000);
    }
  } catch (error) {
    console.error('Erro ao salvar LTCAT:', error);
    toast.error('Erro ao salvar LTCAT. Verifique os dados e tente novamente.');
     }
    };

    const handleSelectAparelho = (aparelho) => {
        
        if(!selectedAparelhos.some(a => a.id === aparelho.id)) {
            setSelectedAparelhos(prev => [...prev, aparelho]);
        }
        setIsAparelhagemModalOpen(false);
    };

    const handleRemoveAparelho = (aparelhoId) => {
        setSelectedAparelhos(prev => prev.filter(a => a.id !== aparelhoId));
    }

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
        setLtcatData(p => ({...p, unidadeOperacionalId: unidade.unidadeOperacionalId, cidade: unidade.cidade, estado: unidade.estado}));
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


    const TabLaudoTecnico = () => {
        const activeSubTab = laudoSubTabs.find(tab => tab.id === laudoSubTab);
        if (!activeSubTab) return null;
        const contentField = activeSubTab.field;

        return (
            <div className="space-y-6">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="flex space-x-2">
                        {laudoSubTabs.map(tab => (
                            <TabButton
                                key={tab.id}
                                label={tab.label}
                                isActive={laudoSubTab === tab.id}
                                onClick={() => setLaudoSubTab(tab.id)}
                            />
                        ))}
                    </nav>
                </div>
            
                <RichTextEditor
                    content={ltcatData[contentField] || ''}
                    onChange={(html) => {
                        setLtcatData(prev => ({ ...prev, [contentField]: html }));
                    }}
                    readOnly={true}
                />
            </div>
        );
    };

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

    const TabAparelhagem = () => (
        <div className="space-y-4">
        <div className="flex justify-end">
        <button type="button" onClick={() => setIsAparelhagemModalOpen(true)}
            className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">
            <Plus size={16}/> Adicionar Aparelho
        </button>
        </div>
        <div className="mt-2 border rounded-md p-2 space-y-2 min-h-[50px]">
            {selectedAparelhos.length === 0 &&
            <p className="text-center text-gray-500 py-4">Nenhum aparelho selecionado.</p>}
            {selectedAparelhos.map((aparelho) => (
            <div key={aparelho.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <span>{aparelho.descricao}</span>
            <button type="button" onClick={() => handleRemoveAparelho(aparelho.id)}
            className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
            </div>))}
        </div>
        </div>
);

    const mainTabs = [
        {id: 'capa', label: 'Capa', component: <TabCapa onFileChange={setCapaImagemFile} initialImageUrl={initialImageUrl} />}, 
        {id: 'profissionais', label: 'Profissionais', component: <TabProfissionais/>},
        {id: 'setores', label: 'Setores', component: <TabSetores/>},
        {id: 'aparelhagem', label: 'Aparelhagem', component: <TabAparelhagem />},
        {
            id: 'laudo',
            label: 'Laudo Técnico',
            component: <TabLaudoTecnico/>
        },
        {
            id: 'recomendacoes',
            label: 'Recomendações',
            component: <RichTextEditor
                key="recomendacoes"
                content={ltcatData.recomendacoesTecnicas}
                onChange={(html) => setLtcatData(p => ({...p, recomendacoesTecnicas: html}))}
            />
        },
        {
            id: 'conclusao',
            label: 'Conclusão',
            component: <RichTextEditor
                key="conclusao"
                content={ltcatData.conclusao}
                onChange={(html) => setLtcatData(p => ({...p, conclusao: html}))}
            />
        },
    ];

    const todasFuncoes = (id ? funcoesDoLTCAT : selectedSetores.flatMap(setor => setor.funcoes || []))
    .map(funcao => ({
        ...funcao,
        nomeSetor: funcao.setor?.nome || 'N/A'
    }));

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
                            Preliminares</label>
                            <RichTextEditor
                                key="condicoesPreliminares"
                                content={ltcatData.condicoesPreliminares}
                                onChange={(html) => setLtcatData(p => ({...p, condicoesPreliminares: html}))}
                                heightClass="h-40"
                            />
                        </div>
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
                                className="bg-gray-500 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-gray-600 transition-colors">Cancelar
                        </button>
                         {id && (
                            <button type="button" onClick={handleSubmit}
                                    className="bg-red-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors">
                                Inativar
                            </button>   
                        )}
                        <button type="submit"
                                className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors">
                            {id ? 'Salvar Alterações' : 'Salvar'}
                        </button>
                    </div>
                </form>
                {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">LTCAT salva com sucesso</h3>
                                <p className="text-gray-600">Redirecionando...</p>
                            </div>
                        </div>
                    </div>
                )}

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
            <AparelhagemLtcatModal isOpen={isAparelhagemModalOpen} 
            onClose={() => setIsAparelhagemModalOpen(false)}
                                onSelect={handleSelectAparelho}/>
        </div>
    );
}