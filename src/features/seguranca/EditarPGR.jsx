import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Bold,
    Italic,
    Underline,
    List,
    Image as ImageIcon,
    Save,
    X,
    Loader2,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';
import PrestadorServicoModal from '../../components/modal/PrestadorServico.jsx';
import funcoesService from '../../api/services/cadastros/funcoesService.js';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import pgrService from '../../api/services/pgr/pgrService.js';
import apiService from '../../api/apiService.js';

const metodologias = {
  '5W2H_PDCA': `<b>5W2H + PDCA:</b><br>
- What (O que será feito?)<br>
- Why (Por que será feito?)<br>
- Where (Onde será feito?)<br>
- When (Quando será feito?)<br>
- Who (Por quem será feito?)<br>
- How (Como será feito?)<br>
- How much (Quanto custará?)<br>
- Plan (Planejar)<br>
- Do (Executar)<br>
- Check (Verificar)<br>
- Act (Agir)`,
  '5W2H': `<b>5W2H:</b><br>
- What (O que será feito?)<br>
- Why (Por que será feito?)<br>
- Where (Onde será feito?)<br>
- When (Quando será feito?)<br>
- Who (Por quem será feito?)<br>
- How (Como será feito?)<br>
- How much (Quanto custará?)`,
  'PDCA': `<b>PDCA:</b><br>
- Plan (Planejar)<br>
- Do (Executar)<br>
- Check (Verificar)<br>
- Act (Agir)`,
  'PERSONALIZADA': ''
};

const RichTextEditor = ({ content, onChange }) => {
    const editorRef = React.useRef(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    const handleContentChange = (event) => {
        if (onChange) {
            onChange(event.target.innerHTML);
        }
    };

    const formatDoc = (command, value = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            if (onChange) {
                onChange(editorRef.current.innerHTML);
            }
        }
    };

    const editorButtons = [
        { icon: Bold, action: () => formatDoc('bold') },
        { icon: Italic, action: () => formatDoc('italic') },
        { icon: Underline, action: () => formatDoc('underline') },
        { icon: List, action: () => formatDoc('insertUnorderedList') },
    ];

    return (
        <div class="border border-gray-300 rounded-lg">
            <div class="flex flex-wrap items-center p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div class="flex items-center space-x-1">
                    {editorButtons.map(({ icon: Icon, action }, index) => (
                        <button key={index} type="button" onClick={action} class="p-2 text-gray-600 rounded-md hover:bg-gray-200">
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                dangerouslySetInnerHTML={{ __html: content }}
                class="w-full p-4 h-64 overflow-y-auto focus:outline-none rounded-b-lg"
            ></div>
        </div>
    );
};

const TabButton = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-3 -mb-px text-sm font-semibold whitespace-nowrap transition-colors border-b-2
            ${isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`
        }
    >
        {label}
    </button>
);

const InputWithActions = ({ placeholder, value, actions, onClick, disabled }) => (
    <div class="relative flex items-center" onClick={!disabled ? onClick : undefined}>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            disabled={disabled}
            className={`w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors 
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer'}`
            }
        />
        <div class="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

const TabCapa = ({ onFileChange, previewUrl }) => {
    const fileInputRef = React.useRef(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            onFileChange(file);
        }
    };

    const handleRemoveImage = () => {
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileSelect = () => fileInputRef.current.click();

    return (
        <div class="space-y-6">
            <p class="text-sm text-gray-600">Selecione uma imagem para a capa do documento.</p>
            <div
                class="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
                onClick={triggerFileSelect}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Pré-visualização da Capa" class="max-h-full max-w-full object-contain" />
                ) : (
                    <div class="text-gray-500">
                        <ImageIcon size={48} class="mx-auto mb-2" />
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
                    class="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                >
                    <Trash2 size={16} />
                    Remover Imagem
                </button>
            )}
        </div>
    );
};

const SimpleTextarea = ({ value, onChange, placeholder }) => (
    <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows="10"
        class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    ></textarea>
);

const TabTermoValidacao = ({ content, onContentChange, selectedEngenheiro, onEngenheiroSelect, onEngenheiroClear }) => (
    <div class="space-y-6">
        <p class="text-sm text-gray-600">Personalize o termo de validação do seu documento preenchendo o campo abaixo</p>
        <SimpleTextarea 
            value={content}
            onChange={onContentChange}
            placeholder="Os profissionais abaixo assinados reconhecem o teor de todas as páginas contidas neste documento..."
        />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="text-sm font-medium text-gray-600">Responsável PGR</label>
                <InputWithActions
                    placeholder="Nenhum engenheiro selecionado"
                    value={selectedEngenheiro?.nome || ''}
                    onClick={onEngenheiroSelect}
                    actions={<><button type="button" onClick={(e) => { e.stopPropagation(); onEngenheiroSelect(); }} class="p-2.5 text-white bg-green-500 hover:bg-green-600"><Search size={18}/></button><button type="button" onClick={(e) => { e.stopPropagation(); onEngenheiroClear(); }} class="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><Trash2 size={18}/></button></>}
                />
            </div>
        </div>
    </div>
);

const TabDocumentoBase = ({ content, onContentChange }) => {
  return (
    <div class="space-y-6">
      <p class="text-sm text-gray-600">Personalize o documento base preenchendo o campo abaixo</p>
      <RichTextEditor
        content={content}
        onChange={onContentChange}
      />
    </div>
  );
};
const TabDadosEmpresa = ({ dataDocumento, onDataDocumentoChange, responsavel, onResponsavelChange, termo, onTermoChange, dataRevisao, onDataRevisaoChange }) => (
    <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label class="text-sm font-medium text-gray-600">Nome do Responsável da Empresa</label>
                <input 
                    type="text" 
                    value={responsavel}
                    onChange={(e) => onResponsavelChange(e.target.value)}
                    class="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/>
            </div>
            <div>
                <label class="text-sm font-medium text-gray-600">Data do Documento *</label>
                <input
                    type="date"
                    value={dataDocumento}
                    onChange={(e) => onDataDocumentoChange(e.target.value)}
                    class="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                />
            </div>
            <div>
                <label class="text-sm font-medium text-gray-600">Data de Revisão</label>
                <input type="date" value={dataRevisao} onChange={(e) => onDataRevisaoChange(e.target.value)} class="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/>
            </div>
        </div>
        <p class="text-sm text-gray-600">Personalize o termo de ciência do responsável preenchendo o campo abaixo</p>
        <SimpleTextarea 
            value={termo}
            onChange={onTermoChange}
            placeholder="O Responsável pela Empresa declara ter ciência do conteúdo integral do presente documento e se compromete em prover todos os recursos necessários para que o PGR atinja seus objetivos em prol da segurança e saúde dos seus trabalhadores."
        />
    </div>
);

const TabConsideracoesFinais = ({ content, onContentChange }) => (
    <div class="space-y-6">
        <p class="text-sm text-gray-600">Personalize a conclusão preenchendo o campo abaixo</p>
        <RichTextEditor 
            content={content}
            onChange={onContentChange}
        
        />
    </div>
);

const TabPlanoDeAcao = ({
    metodologia, onMetodologiaChange, texto, onTextoChange,
    riscos, onRemoverRisco, onPlanoAcaoChange, hasSetorSelecionado,
}) => {
    return (
        <div class="space-y-8">
            <div class="space-y-6">
                <div>
                    <label htmlFor="metodologia-select" class="block text-sm font-medium text-gray-700 mb-2">
                        Metodologia
                    </label>
                    <select
                        id="metodologia-select"
                        value={metodologia}
                        onChange={onMetodologiaChange}
                        class="w-full max-w-md py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="5W2H_PDCA">5W2H + PDCA</option>
                        <option value="5W2H">5W2H</option>
                        <option value="PDCA">PDCA</option>
                        <option value="PERSONALIZADA">Personalizada</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Orientações da Metodologia
                    </label>
                    <RichTextEditor
                        content={texto}
                        onChange={onTextoChange}
                    />
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center pb-2 border-b">
                    <h3 class="text-lg font-semibold text-gray-800">Ações de Controle de Risco</h3>
                    
                </div>

                {!hasSetorSelecionado && (
                    <div class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        <p>Selecione um setor na aba 'Mapa de Risco' para visualizar e gerenciar as ações de controle.</p>
                    </div>
                )}

                {hasSetorSelecionado && (
                    <div class="overflow-x-auto bg-white rounded-lg shadow">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O que será feito?</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                {riscos.length > 0 ? riscos.map((item, index) => (
                                    <tr key={item.id}>
                                        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.risco.descricao}</td>
                                        <td class="px-4 py-4">
                                            <input type="text" value={item.acao} onChange={(e) => onPlanoAcaoChange(index, 'acao', e.target.value)} class="w-full border-gray-300 rounded-md shadow-sm"/>
                                        </td>
                                        <td class="px-4 py-4">
                                            <input type="text" value={item.responsavel} onChange={(e) => onPlanoAcaoChange(index, 'responsavel', e.target.value)} class="w-full border-gray-300 rounded-md shadow-sm"/>
                                        </td>
                                        <td class="px-4 py-4">
                                            <input type="date" value={item.prazo} onChange={(e) => onPlanoAcaoChange(index, 'prazo', e.target.value)} class="w-full border-gray-300 rounded-md shadow-sm"/>
                                        </td>
                                        <td class="px-4 py-4">
                                            <select value={item.status} onChange={(e) => onPlanoAcaoChange(index, 'status', e.target.value)} class="w-full border-gray-300 rounded-md shadow-sm">
                                                <option value="A Fazer">A Fazer</option>
                                                <option value="Em Andamento">Em Andamento</option>
                                                <option value="Concluído">Concluído</option>
                                            </select>
                                        </td>
                                        <td class="px-4 py-4 text-right">
                                            <button type="button" onClick={() => onRemoverRisco(index)} class="p-2 text-red-600 hover:text-red-800">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" class="px-6 py-8 text-center text-gray-500">Nenhum risco identificado para este setor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function EditarPGR() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('capa');
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isPrestadorModalOpen, setIsPrestadorModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [selectedEngenheiro, setSelectedEngenheiro] = useState(null);
    const [dataDocumento, setDataDocumento] = useState('');
    const [dataRevisao, setDataRevisao] = useState('');
    const [riscosDoSetor, setRiscosDoSetor] = useState([]);
    const [loadingRiscos, setLoadingRiscos] = useState(false);
    const [metodologiaSelecionada, setMetodologiaSelecionada] = useState('5W2H_PDCA');
    const [textoMetodologia, setTextoMetodologia] = useState(metodologias['5W2H_PDCA']);
    const [planoAcaoRiscos, setPlanoAcaoRiscos] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [capaFile, setCapaFile] = useState(null);
    const [capaPreview, setCapaPreview] = useState(null);
    const [termoValidacaoContent, setTermoValidacaoContent] = useState('Os profissionais abaixo assinados reconhecem o teor de todas as páginas contidas neste documento por meio de sua assinatura de próprio punho e/ou digitalizada.');
    const [documentoBaseContent, setDocumentoBaseContent] = useState('');
    const [dadosEmpresaResponsavel, setDadosEmpresaResponsavel] = useState('');
    const [termoCienciaResponsavel, setTermoCienciaResponsavel] = useState('O Responsável pela Empresa declara ter ciência do conteúdo integral do presente documento e se compromete em prover todos os recursos necessários para que o PGR atinja seus objetivos em prol da segurança e saúde dos seus trabalhadores.');
    const [consideracoesFinaisContent, setConsideracoesFinaisContent] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [status, setStatus] = useState('ATIVO');

    useEffect(() => {
        const fetchPgr = async () => {
            try {

                const data = await pgrService.getPgrById(id);
                setSelectedEmpresa(data.unidadeOperacional.empresa);
                setSelectedUnidade(data.unidadeOperacional);
                const setor = data.unidadeOperacional?.setores?.[0] || null;
                setSelectedSetor(setor);
                
                // Configurar o prestador de serviço (responsável PGR)
                if (data.prestadorServico) {
                    setSelectedEngenheiro({
                        id: data.prestadorServico.id,
                        nome: data.prestadorServico.nome || ''
                    });
                }
                setDataDocumento(data.dataDocumento.split('T')[0]);
                setDataRevisao(data.dataRevisao ? data.dataRevisao.split('T')[0] : '');
                setMetodologiaSelecionada(data.planoAcaoMetodologia);
                setTextoMetodologia(data.planoAcaoOrientacoes);
                setPlanoAcaoRiscos(data.planoAcaoRiscos || []);
                setTermoValidacaoContent(data.termoValidacao);
                setDocumentoBaseContent(data.documentoBase);
                setDadosEmpresaResponsavel(data.responsavelEmpresa);
                setTermoCienciaResponsavel(data.termoCiencia);
                setConsideracoesFinaisContent(data.consideracoesFinais);
                setStatus(data.status || 'ATIVO');
                // Verificar diferentes propriedades possíveis para a capa
                const capaProperty = data.conteudoCapa || data.capaUrl || data.imagemCapa || data.capa || data.capaPath;

                if (capaProperty) {
                    // Construir URL base
                    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

                    // Se conteudoCapa é apenas o nome do arquivo, construir o caminho completo
                    let fullUrl;
                    if (capaProperty.startsWith('http')) {
                        // URL já completa
                        fullUrl = capaProperty;
                    } else if (capaProperty.startsWith('/')) {
                        // Caminho relativo completo
                        fullUrl = apiBaseUrl + capaProperty;
                    } else {
                        // Apenas nome do arquivo - assumir que está em /uploads/pgr-capas/
                        fullUrl = `${apiBaseUrl}/uploads/pgr-capas/${capaProperty}`;
                    }
                    setCapaPreview(fullUrl);
                }
            } catch (err) {
                setSaveError('Falha ao carregar dados do PGR.');
                console.error(err);
            }
        };
        fetchPgr();
    }, [id]);

    const handlePlanoAcaoChange = (index, field, value) => {
        const novosRiscos = [...planoAcaoRiscos];
        novosRiscos[index][field] = value;
        setPlanoAcaoRiscos(novosRiscos);
    };

    const handleRemoverRisco = (index) => {
        const novosRiscos = planoAcaoRiscos.filter((_, i) => i !== index);
        setPlanoAcaoRiscos(novosRiscos);
    };

    useEffect(() => {
        const novoTexto = metodologias[metodologiaSelecionada];
        if (textoMetodologia !== novoTexto) {
            setTextoMetodologia(novoTexto);
        }
    }, [metodologiaSelecionada]);

    const handleMetodologiaChange = (event) => {
        setMetodologiaSelecionada(event.target.value);
    };

    const handleTextoMetodologiaChange = (content) => {
        setTextoMetodologia(content);
    };

    const handleUnidadeSelect = (unidade) => {
        setSelectedUnidade(unidade);
        setIsUnidadeModalOpen(false);
    };

    const handleEmpresaSelect = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedSetor(null);
        setSelectedUnidade(null);
        setIsEmpresaModalOpen(false);
    };

    const handleSetorSelect = (setor) => {
        setSelectedSetor(setor);
        setIsSetorModalOpen(false);
    };

    const handleEngenheiroSelect = (prestador) => {
        setSelectedEngenheiro(prestador);
        setIsPrestadorModalOpen(false);
    };

    useEffect(() => {
        if (selectedSetor && selectedSetor.id) {
            setLoadingRiscos(true);
            funcoesService.getFuncoesBySetorId(selectedSetor.id)
                .then(response => {
                    const funcoesArray = response.data.content || response.data;
                    if (!Array.isArray(funcoesArray)) {
                        console.error("A resposta da API de funções não é um array:", funcoesArray);
                        setRiscosDoSetor([]);
                        return;
                    }
                    const todosOsRiscos = funcoesArray.flatMap(funcao =>
                        (funcao.riscosPGR || []).map(riscoPGR => ({
                            id: riscoPGR.riscoCatalogo.id,
                            grupo: riscoPGR.riscoCatalogo.grupo,
                            descricao: riscoPGR.riscoCatalogo.descricao
                        }))
                    );
                    const riscosUnicos = Array.from(new Map(todosOsRiscos.map(risco => [risco.id, risco])).values());
                    setRiscosDoSetor(riscosUnicos);
                })
                .catch(error => {
                    console.error("Falha ao buscar riscos:", error);
                    setRiscosDoSetor([]);
                })
                .finally(() => {
                    setLoadingRiscos(false);
                });
        } else {
            setRiscosDoSetor([]);
        }
    }, [selectedSetor]);

    useEffect(() => {
        const riscosAtuais = new Set(planoAcaoRiscos.map(r => r.risco.id));
        const novasAcoes = riscosDoSetor
            .filter(risco => !riscosAtuais.has(risco.id))
            .map(risco => ({
                id: `${risco.id}-${Date.now()}`,
                risco: risco,
                acao: '',
                responsavel: '',
                prazo: '',
                status: 'A Fazer'
            }));
        if (novasAcoes.length > 0) {
            setPlanoAcaoRiscos(prev => [...prev, ...novasAcoes]);
        }
    }, [riscosDoSetor]);

    const handleUpdate = async () => {
        setSaveError(null);
        setSaveSuccess(false);
        setIsSaving(true);

        const pgrData = {
            empresaId: selectedEmpresa?.id,
            unidadeOperacionalId: selectedUnidade?.id,
            setorId: selectedSetor?.id,
            prestadorServicoId: selectedEngenheiro?.id,
            dataDocumento,
            dataRevisao,
            planoAcaoMetodologia: metodologiaSelecionada,
            planoAcaoOrientacoes: textoMetodologia,
            planoAcaoRiscos: planoAcaoRiscos.map(acao => ({
                riscoId: acao.risco.id,
                acao: acao.acao,
                responsavel: acao.responsavel,
                prazo: acao.prazo,
                status: acao.status
            })),
            termoValidacao: termoValidacaoContent,
            documentoBase: documentoBaseContent,
            responsavelEmpresa: dadosEmpresaResponsavel,
            termoCiencia: termoCienciaResponsavel,
            consideracoesFinais: consideracoesFinaisContent,
            status: status
        };

        try {
            await pgrService.updatePgr(id, pgrData, capaFile);
            setShowSuccessModal(true);
            setTimeout(() => {
                navigate("/seguranca/listar-pgr");
            }, 1500);
        } catch (error) {
            setSaveError(error.message);
            console.error("Erro detalhado:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (!isSaving) {
            navigate("/seguranca/pgr");
        }
    };

    const handleCapaFileChange = (file) => {
        setCapaFile(file);
        if (file) {
            setCapaPreview(URL.createObjectURL(file));
        } else {
            setCapaPreview(null);
        }
    };


    const tabs = [
        { id: 'capa', label: 'Capa' },
        { id: 'termo', label: 'Termo de Validação' },
        { id: 'base', label: 'Documento Base' },
        { id: 'dados', label: 'Dados da Empresa' },
        { id: 'mapa', label: 'Mapa de Risco' },
        { id: 'plano_acao', label: 'PLANO DE AÇÃO' },
        { id: 'finais', label: 'Considerações Finais' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'capa':
                return <TabCapa onFileChange={handleCapaFileChange} previewUrl={capaPreview} />; 
            case 'termo': 
                return (
                    <TabTermoValidacao
                        content={termoValidacaoContent}
                        onContentChange={setTermoValidacaoContent}
                        selectedEngenheiro={selectedEngenheiro}
                        onEngenheiroSelect={() => setIsPrestadorModalOpen(true)}
                        onEngenheiroClear={() => setSelectedEngenheiro(null)}
                    />
                );
            case 'base': 
                return <TabDocumentoBase content={documentoBaseContent} onContentChange={setDocumentoBaseContent} />; 
            case 'dados': 
                return (
                    <TabDadosEmpresa 
                        dataDocumento={dataDocumento} 
                        onDataDocumentoChange={setDataDocumento}
                        responsavel={dadosEmpresaResponsavel}
                        onResponsavelChange={setDadosEmpresaResponsavel}
                        termo={termoCienciaResponsavel}
                        onTermoChange={setTermoCienciaResponsavel}
                        dataRevisao={dataRevisao}
                        onDataRevisaoChange={setDataRevisao}
                    />
                );
            case 'mapa':
                return (
                    <div class="space-y-6">
                        <div class="p-4 border border-blue-500 rounded-lg bg-blue-50">
                            <h4 class="font-semibold text-blue-800 mb-4">Mapa de Riscos por Setor</h4>
                            <p class="text-sm text-gray-600 mb-4">Para visualizar os riscos, escolha o setor desejado.</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputWithActions
                                    placeholder="Selecione um setor..."
                                    value={selectedSetor ? selectedSetor.nome : ''}
                                    onClick={() => setIsSetorModalOpen(true)}
                                    actions={<button type="button" class="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                        <Search size={18} /></button>}
                                />
                            </div>
                        </div>
                        {selectedSetor && (
                            <div class="mt-6">
                                <h5 class="font-semibold text-gray-800 mb-4">Riscos Identificados para o Setor: <span class="text-blue-600">{selectedSetor.nome}</span></h5>
                                {loadingRiscos ? (
                                    <p class="text-gray-500">Carregando riscos...</p>
                                ) : (
                                    <div class="overflow-x-auto bg-white rounded-lg shadow">
                                        <table class="min-w-full divide-y divide-gray-200">
                                            <thead class="bg-gray-50">
                                                <tr>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo de Risco</th>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição do Risco</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-200">
                                                {riscosDoSetor.length > 0 ? riscosDoSetor.map(risco => (
                                                    <tr key={risco.id}>
                                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{risco.grupo}</td>
                                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risco.descricao}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="2" class="px-6 py-4 text-center text-sm text-gray-500">Nenhum risco encontrado para este setor.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'plano_acao': return (
                <TabPlanoDeAcao
                    metodologia={metodologiaSelecionada}
                    onMetodologiaChange={handleMetodologiaChange}
                    texto={textoMetodologia}
                    onTextoChange={handleTextoMetodologiaChange}
                    riscos={planoAcaoRiscos}
                    onRemoverRisco={handleRemoverRisco}
                    onPlanoAcaoChange={handlePlanoAcaoChange}
                    hasSetorSelecionado={!!selectedSetor}
                />
            );
            case 'finais': 
                return <TabConsideracoesFinais content={consideracoesFinaisContent} onContentChange={setConsideracoesFinaisContent} />;

            default: return <div class="p-6 text-center text-gray-500">Conteúdo para {activeTab}</div>;
        }
    }

    return (
        <>
            <div class="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
                <div class="container mx-auto">
                    <header class="mb-6">
                        <h1 class="text-3xl font-bold text-gray-900">Editar/Revisar PGR</h1>
                    </header>
                    <form>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Empresa *</label>
                                    <InputWithActions
                                        value={selectedEmpresa?.razaoSocial || ""}
                                        onClick={() => setIsEmpresaModalOpen(true)}
                                        disabled={true}
                                        actions={
                                            <>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setIsEmpresaModalOpen(true); }} class="p-2.5 text-white bg-green-500 hover:bg-green-600"><Search size={18} /></button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedEmpresa(null); setSelectedUnidade(null); }} class="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><Trash2 size={18} /></button>
                                            </>
                                        }
                                    />
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Unidade Operacional *</label>
                                    <InputWithActions
                                        placeholder="Selecione uma empresa primeiro"
                                        value={selectedUnidade?.nome || ""}
                                        onClick={() => setIsUnidadeModalOpen(true)}
                                        disabled={!selectedEmpresa || true}
                                        actions={
                                            <>
                                                <button type="button" disabled={!selectedEmpresa} onClick={(e) => { e.stopPropagation(); setIsUnidadeModalOpen(true); }} class="p-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"><Search size={18} /></button>
                                                <button type="button" disabled={!selectedEmpresa} onClick={(e) => { e.stopPropagation(); setSelectedUnidade(null); }} class="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md disabled:bg-gray-400"><Trash2 size={18} /></button>
                                            </>
                                        }
                                    />
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-600">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        class="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ATIVO">ATIVO</option>
                                        <option value="INATIVO">INATIVO</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg shadow-md">
                            <div class="border-b border-gray-200 overflow-x-auto">
                                <nav class="flex space-x-2 px-4">
                                    {tabs.map(tab => (
                                        <TabButton key={tab.id} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
                                    ))}
                                </nav>
                            </div>
                            <div class="p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </form>

                    {/* Feedback de Salvamento */}
                    {saveError && (
                        <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{saveError}</span>
                        </div>
                    )}
                    {saveSuccess && (
                        <div class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                            <CheckCircle size={20} />
                            <span>PGR atualizado com sucesso! Redirecionando...</span>
                        </div>
                    )}

                    {/* Botões Salvar e Cancelar */}
                    <div class="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSaving}
                            class="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={16} />
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={isSaving || saveSuccess}
                            class="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 class="animate-spin" size={16} /> : <Save size={16} />}
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
                 {showSuccessModal && (
                    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div class="bg-white p-6 rounded-lg shadow-lg">
                            <div class="text-center">
                                <div class="text-green-600 text-6xl mb-4">✓</div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">PGR atualizado com sucesso!</h3>
                                <p class="text-gray-600">Redirecionando...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isEmpresaModalOpen && (
                <EmpresaSearchModal
                    isOpen={isEmpresaModalOpen}
                    onSelect={handleEmpresaSelect}
                    onClose={() => setIsEmpresaModalOpen(false)}
                />
            )}
            {isSetorModalOpen && (
                <SetorSearchModal
                    isOpen={isSetorModalOpen}
                    onSelect={handleSetorSelect}
                    onClose={() => setIsSetorModalOpen(false)}
                    empresaId={selectedEmpresa?.id}
                />
            )}
            {isPrestadorModalOpen && (
                <PrestadorServicoModal
                    isOpen={isPrestadorModalOpen}
                    onClose={() => setIsPrestadorModalOpen(false)}
                    onSelect={handleEngenheiroSelect}
                />
            )}
            {isUnidadeModalOpen && (
                <UnidadesOperacionaisModal
                    isOpen={isUnidadeModalOpen}
                    onClose={() => setIsUnidadeModalOpen(false)}
                    onSelect={handleUnidadeSelect}
                    empresaId={selectedEmpresa?.id}
                />
            )}
        </>
    );
}