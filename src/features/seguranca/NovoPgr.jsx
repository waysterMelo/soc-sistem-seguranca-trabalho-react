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
import { useNavigate } from 'react-router-dom';
import pgrService from '../../api/services/pgr/pgrService.js';

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
        // 1. Devolve o foco para o editor de texto
        editorRef.current.focus(); 
        
        // 2. Aplica o comando (negrito, itálico, etc.)
        document.execCommand(command, false, value);
        
        // 3. Garante que o estado do React seja atualizado imediatamente
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
        <div className="border border-gray-300 rounded-lg">
            <div className="flex flex-wrap items-center p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center space-x-1">
                    {editorButtons.map(({ icon: Icon, action }, index) => (
                        <button key={index} type="button" onClick={action} className="p-2 text-gray-600 rounded-md hover:bg-gray-200">
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
                className="w-full p-4 h-64 overflow-y-auto focus:outline-none rounded-b-lg"
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
    <div className="relative flex items-center" onClick={!disabled ? onClick : undefined}>
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
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

const TabCapa = ({ onFileChange }) => { 
    const fileInputRef = React.useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
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

const SimpleTextarea = ({ value, onChange, placeholder }) => (
    <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows="10"
        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    ></textarea>
);

const TabTermoValidacao = ({ content, onContentChange, selectedEngenheiro, onEngenheiroSelect, onEngenheiroClear }) => (
    <div className="space-y-6">
        <p className="text-sm text-gray-600">Personalize o termo de validação do seu documento preenchendo o campo abaixo</p>
        <SimpleTextarea 
            value={content}
            onChange={onContentChange}
            placeholder="Os profissionais abaixo assinados reconhecem o teor de todas as páginas contidas neste documento..."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-sm font-medium text-gray-600">Responsável PGR</label>
                <InputWithActions
                    placeholder="Nenhum engenheiro selecionado"
                    value={selectedEngenheiro?.nome || ''}
                    onClick={onEngenheiroSelect}
                    actions={<><button type="button" onClick={(e) => { e.stopPropagation(); onEngenheiroSelect(); }} className="p-2.5 text-white bg-green-500 hover:bg-green-600"><Search size={18}/></button><button type="button" onClick={(e) => { e.stopPropagation(); onEngenheiroClear(); }} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><Trash2 size={18}/></button></>}
                />
            </div>
        </div>
    </div>
);

const TabDocumentoBase = ({ content, onContentChange }) => {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">Personalize o documento base preenchendo o campo abaixo</p>
      <RichTextEditor
        content={content}
        onChange={onContentChange}
      />
    </div>
  );
};
const TabDadosEmpresa = ({ dataDocumento, onDataDocumentoChange, responsavel, onResponsavelChange, termo, onTermoChange }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="text-sm font-medium text-gray-600">Nome do Responsável da Empresa</label>
                <input 
                    type="text" 
                    value={responsavel}
                    onChange={(e) => onResponsavelChange(e.target.value)}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"/>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600">Data do Documento *</label>
                <input
                    type="date"
                    value={dataDocumento}
                    onChange={(e) => onDataDocumentoChange(e.target.value)}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600">Data de Revisão</label>
                <input type="text" placeholder="dd/mm/aaaa" className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-100" disabled/>
            </div>
        </div>
        <p className="text-sm text-gray-600">Personalize o termo de ciência do responsável preenchendo o campo abaixo</p>
        <SimpleTextarea 
            value={termo}
            onChange={onTermoChange}
            placeholder="O Responsável pela Empresa declara ter ciência do conteúdo integral do presente documento..."
        />
    </div>
);

const TabConsideracoesFinais = ({ content, onContentChange }) => (
    <div className="space-y-6">
        <p className="text-sm text-gray-600">Personalize a conclusão preenchendo o campo abaixo</p>
        <RichTextEditor 
            content={content}
            onChange={onContentChange}
        />
    </div>
);

const TabPlanoDeAcao = ({
    metodologia, onMetodologiaChange, texto, onTextoChange,
    riscos, onRemoverRisco, onPlanoAcaoChange, hasSetorSelecionado
}) => {
    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div>
                    <label htmlFor="metodologia-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Metodologia
                    </label>
                    <select
                        id="metodologia-select"
                        value={metodologia}
                        onChange={onMetodologiaChange}
                        className="w-full max-w-md py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="5W2H_PDCA">5W2H + PDCA</option>
                        <option value="5W2H">5W2H</option>
                        <option value="PDCA">PDCA</option>
                        <option value="PERSONALIZADA">Personalizada</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orientações da Metodologia
                    </label>
                    <RichTextEditor
                        content={texto}
                        onChange={onTextoChange}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Ações de Controle de Risco</h3>
                </div>

                {!hasSetorSelecionado && (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        <p>Selecione um setor na aba 'Mapa de Risco' para visualizar e gerenciar as ações de controle.</p>
                    </div>
                )}

                {hasSetorSelecionado && (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O que será feito?</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {riscos.length > 0 ? riscos.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.risco.descricao}</td>
                                        <td className="px-4 py-4">
                                            <input type="text" value={item.acao} onChange={(e) => onPlanoAcaoChange(index, 'acao', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                        </td>
                                        <td className="px-4 py-4">
                                            <input type="text" value={item.responsavel} onChange={(e) => onPlanoAcaoChange(index, 'responsavel', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                        </td>
                                        <td className="px-4 py-4">
                                            <input type="date" value={item.prazo} onChange={(e) => onPlanoAcaoChange(index, 'prazo', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm"/>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select value={item.status} onChange={(e) => onPlanoAcaoChange(index, 'status', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                                <option value="A Fazer">A Fazer</option>
                                                <option value="Em Andamento">Em Andamento</option>
                                                <option value="Concluído">Concluído</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button type="button" onClick={() => onRemoverRisco(index)} className="p-2 text-red-600 hover:text-red-800">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Nenhum risco identificado para este setor.</td>
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


export default function CadastrarPGR() {
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
    const [riscosDoSetor, setRiscosDoSetor] = useState([]);
    const [loadingRiscos, setLoadingRiscos] = useState(false);
    const [metodologiaSelecionada, setMetodologiaSelecionada] = useState('5W2H_PDCA');
    const [textoMetodologia, setTextoMetodologia] = useState(metodologias['5W2H_PDCA']);
    const [planoAcaoRiscos, setPlanoAcaoRiscos] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [capaFile, setCapaFile] = useState(null);
    const [termoValidacaoContent, setTermoValidacaoContent] = useState('Os profissionais abaixo assinados reconhecem o teor de todas as páginas contidas neste documento por meio de sua assinatura de próprio punho e/ou digitalizada.');
    const textoPadraoDocumentoBase = `
    <p><strong>O PGR - PROGRAMA DE GESTÃO DE RISCOS -</strong> está regulamentado pela <strong>NR01</strong> 
  (PORTARIA 6.730 de 9 DE MARÇO DE 2020).</p>

  <p>Tem por objetivo estabelecer as disposições gerais, o campo de aplicação, os termos e as definições 
  comuns às Normas Regulamentadoras - NR - relativas à segurança e saúde no trabalho; às diretrizes e 
  aos requisitos para o gerenciamento de riscos ocupacionais e às medidas de prevenção em 
  Segurança e Saúde no Trabalho - SST.</p>

  <p><strong>ABRANGÊNCIA</strong></p>

  <p>Este programa abrange as instalações, os processos de trabalho e as respectivas atividades e 
  operações desenvolvidas na empresa, e, conforme NR-01, devem ser considerados os seguintes riscos:</p>

  <ul>
    <li>Físico</li>
    <li>Químico</li>
    <li>Biológico</li>
    <li>Ergonômico</li>
    <li>Acidental</li>
  </ul>
`;
    const [documentoBaseContent, setDocumentoBaseContent] = useState(textoPadraoDocumentoBase);
    const [dadosEmpresaResponsavel, setDadosEmpresaResponsavel] = useState('');
    const [termoCienciaResponsavel, setTermoCienciaResponsavel] = useState('O Responsável pela Empresa declara ter ciência do conteúdo integral do presente documento e se compromete em prover todos os recursos necessários para que o PGR atinja seus objetivos em prol da segurança e saúde dos seus trabalhadores.');
    const textoConsideracoesFinaisPadrao = `<p>
    O presente <strong>Programa de Gerenciamento de Riscos (PGR)</strong> foi elaborado com base na 
    <strong>Norma Regulamentadora nº 01 (NR-01)</strong>, conforme estabelecido pela 
    <strong>Portaria MTPS nº 1.474, de 6 de julho de 2023</strong>, e representa o 
    <strong>compromisso institucional da empresa</strong> com a prevenção de acidentes e doenças ocupacionais, 
    promovendo a <strong>saúde e segurança dos trabalhadores</strong>.
  </p>

  <p>
    As ações aqui definidas foram planejadas a partir da <strong>identificação de riscos</strong>, 
    <strong>avaliação de riscos</strong> e <strong>estabelecimento de medidas de controle</strong>, 
    considerando a <strong>hierarquia de controles</strong> prevista na legislação 
    (eliminação, substituição, controles de engenharia, administrativos e EPIs).
  </p>

  <p>
    A <strong>implementação efetiva deste PGR</strong> será monitorada periodicamente por meio de 
    <strong>auditorias internas</strong>, <strong>atualizações de riscos</strong>, 
    <strong>programas de conscientização</strong>, <strong>treinamentos</strong> e 
    <strong>participação dos trabalhadores</strong>, por meio das 
    <strong>Comissões Internas de Prevenção de Acidentes (CIPAs)</strong> e dos 
    <strong>Serviços Especializados em Engenharia de Segurança e em Medicina do Trabalho (SESMT)</strong>.
  </p>

  <p>
    A empresa se compromete a <strong>revisar este PGR sempre que ocorrerem alterações significativas</strong> 
    nas condições de trabalho, nos processos, nos equipamentos ou na legislação aplicável, 
    garantindo sua <strong>contínua eficácia</strong> e <strong>melhoria contínua</strong> do 
    <strong>Sistema de Gestão de Segurança e Saúde no Trabalho</strong>.
  </p>`;
    const [consideracoesFinaisContent, setConsideracoesFinaisContent] = useState(textoConsideracoesFinaisPadrao);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    // Efeito para buscar riscos quando o setor muda
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

    // Efeito para sincronizar riscos do setor com o plano de ação
    useEffect(() => {
        const novasAcoes = riscosDoSetor.map(risco => ({
            id: `${risco.id}-${Date.now()}`,
            risco: risco,
            acao: '',
            responsavel: '',
            prazo: '',
            status: 'A Fazer'
        }));
        setPlanoAcaoRiscos(novasAcoes);
    }, [riscosDoSetor]);

    const handleSave = async () => {
        setSaveError(null);
        setSaveSuccess(false);
        setIsSaving(true);

        const pgrData = {
            empresaId: selectedEmpresa?.id,
            unidadeOperacionalId: selectedUnidade?.id,
            setorId: selectedSetor?.id,
            prestadorServicoId: selectedEngenheiro?.id,
            dataDocumento,
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
        };

        try {
            await pgrService.savePGR(pgrData, capaFile);
            setShowSuccessModal(true);
            setTimeout(() => {
                navigate("/seguranca/pgr");
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
                return <TabCapa onFileChange={setCapaFile}/>;
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
                    />
                );
            case 'mapa':
                return (
                    <div className="space-y-6">
                        <div className="p-4 border border-blue-500 rounded-lg bg-blue-50">
                            <h4 className="font-semibold text-blue-800 mb-4">Mapa de Riscos por Setor</h4>
                            <p className="text-sm text-gray-600 mb-4">Para visualizar os riscos, escolha o setor desejado.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputWithActions
                                    placeholder="Selecione um setor..."
                                    value={selectedSetor ? selectedSetor.nome : ''}
                                    onClick={() => setIsSetorModalOpen(true)}
                                    actions={<button type="button" className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                        <Search size={18} /></button>}
                                />
                            </div>
                        </div>
                        {selectedSetor && (
                            <div className="mt-6">
                                <h5 className="font-semibold text-gray-800 mb-4">Riscos Identificados para o Setor: <span className="text-blue-600">{selectedSetor.nome}</span></h5>
                                {loadingRiscos ? (
                                    <p className="text-gray-500">Carregando riscos...</p>
                                ) : (
                                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo de Risco</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição do Risco</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {riscosDoSetor.length > 0 ? riscosDoSetor.map(risco => (
                                                    <tr key={risco.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{risco.grupo}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risco.descricao}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">Nenhum risco encontrado para este setor.</td>
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

            default: return <div className="p-6 text-center text-gray-500">Conteúdo para {activeTab}</div>;
        }
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
                <div className="container mx-auto">
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Cadastrar PGR</h1>
                    </header>
                    <form>
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Empresa *</label>
                                    <InputWithActions
                                        value={selectedEmpresa?.razaoSocial || ""}
                                        onClick={() => setIsEmpresaModalOpen(true)}
                                        actions={
                                            <>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setIsEmpresaModalOpen(true); }} className="p-2.5 text-white bg-green-500 hover:bg-green-600"><Search size={18} /></button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedEmpresa(null); setSelectedUnidade(null); }} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><Trash2 size={18} /></button>
                                            </>
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Unidade Operacional *</label>
                                    <InputWithActions
                                        placeholder="Selecione uma empresa primeiro"
                                        value={selectedUnidade?.nome || ""}
                                        onClick={() => setIsUnidadeModalOpen(true)}
                                        disabled={!selectedEmpresa}
                                        actions={
                                            <>
                                                <button type="button" disabled={!selectedEmpresa} onClick={(e) => { e.stopPropagation(); setIsUnidadeModalOpen(true); }} className="p-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"><Search size={18} /></button>
                                                <button type="button" disabled={!selectedEmpresa} onClick={(e) => { e.stopPropagation(); setSelectedUnidade(null); }} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md disabled:bg-gray-400"><Trash2 size={18} /></button>
                                            </>
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md">
                            <div className="border-b border-gray-200 overflow-x-auto">
                                <nav className="flex space-x-2 px-4">
                                    {tabs.map(tab => (
                                        <TabButton key={tab.id} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
                                    ))}
                                </nav>
                            </div>
                            <div className="p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </form>

                    {/* Feedback de Salvamento */}
                    {saveError && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{saveError}</span>
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                            <CheckCircle size={20} />
                            <span>PGR salvo com sucesso! Redirecionando...</span>
                        </div>
                    )}

                    {/* Botões Salvar e Cancelar */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={16} />
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || saveSuccess}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
                 {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pgr salva com sucesso!</h3>
                                <p className="text-gray-600">Redirecionando...</p>
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

