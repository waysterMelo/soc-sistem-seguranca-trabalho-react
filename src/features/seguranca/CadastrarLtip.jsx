import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Serviços e Modais
import ltipService from '../../api/services/Ltip/ltipService.js';
import funcoesService from '../../api/services/cadastros/funcoesService.js'; 
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';
import FuncaoSearchModal from '../../components/modal/funcaoSearchModal.jsx';
import PrestadorServicoSearchModal from '../../components/modal/PrestadorServico.jsx';
import AparelhagemLtcatModal from '../../components/modal/AparelhagemLtcatModal.jsx';
import AnexoNr16SearchModal from '../../components/modal/AnexoNr16SearchModal.jsx'; // Importado

// Ícones
import {
    Search, Trash2, Plus, Clock, Check, RefreshCw, Paperclip, Bold, Italic,
    Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, Link2,
    Image as ImageIcon, Download, ChevronDown
} from 'lucide-react';


const FormSection = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md mt-6 ${className}`}>
        {title && <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>}
        {children}
    </div>
);
const InputWithActions = ({ placeholder, value, actions, className = '', onClick }) => (
    <div className="relative flex items-center">
        <input type="text" placeholder={placeholder} value={value} readOnly onClick={onClick} className={`w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`} />
        <div className="absolute right-0 flex">{actions}</div>
    </div>
);
const RichTextEditor = ({ content, onChange, readOnly = false, heightClass = 'h-96' }) => {
    const editorRef = React.useRef(null);
    const handleContentChange = (event) => { if (!readOnly && onChange) { onChange(event.target.innerHTML); } };
    const formatDoc = (command, value = null) => { if (readOnly || !editorRef.current) return; editorRef.current.focus(); document.execCommand(command, false, value); if (onChange) { onChange(editorRef.current.innerHTML); } };
    React.useEffect(() => { if (editorRef.current && editorRef.current.innerHTML !== content) { editorRef.current.innerHTML = content || ''; } }, [content]);
    const editorButtons = [ { icon: Bold, action: () => formatDoc('bold') }, { icon: Italic, action: () => formatDoc('italic') }, { icon: Underline, action: () => formatDoc('underline') }, { icon: Strikethrough, action: () => formatDoc('strikeThrough') }, { icon: AlignLeft, action: () => formatDoc('justifyLeft') }, { icon: AlignCenter, action: () => formatDoc('justifyCenter') }, { icon: AlignRight, action: () => formatDoc('justifyRight') }, { icon: List, action: () => formatDoc('insertUnorderedList') }, { icon: Link2, action: () => formatDoc('createLink', prompt('Enter URL:')) }, { icon: ImageIcon, action: () => formatDoc('insertImage', prompt('Enter Image URL:')) } ];
    return (
        <div className="border border-gray-300 rounded-lg">
             {!readOnly && ( <div className="flex flex-wrap items-center p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg"> <select className="text-sm border-gray-300 rounded-md mr-2"><option>Normal</option></select> <div className="flex items-center space-x-1"> {editorButtons.map(({ icon: Icon, action }, index) => ( <button key={index} type="button" onClick={action} className="p-2 text-gray-600 rounded-md hover:bg-gray-200"><Icon size={16}/></button> ))} </div> <div className="flex items-center ml-auto space-x-1"> <button type="button" className="p-2 text-blue-600 rounded-md hover:bg-gray-200"><Paperclip size={16}/></button> <button type="button" className="p-2 text-green-600 rounded-md hover:bg-gray-200"><RefreshCw size={16}/></button> </div> </div> )}
            <div ref={editorRef} contentEditable={!readOnly} onInput={handleContentChange} className={`w-full p-4 ${heightClass} overflow-y-auto focus:outline-none rounded-b-lg ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}></div>
        </div>
    );
};
const TabButton = ({ label, isActive, onClick, hasDot = false }) => (
    <button type="button" onClick={onClick} className={`relative px-4 py-3 -mb-px text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
        {label} {hasDot && <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500"></span>}
    </button>
);
const TabCapa = ({ onFileChange, onRemove, previewUrl }) => {
    const fileInputRef = React.useRef(null);
    const [imageError, setImageError] = React.useState(false);

    const handleImageCapaChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageError(false);
            onFileChange(file);
        } else {
            toast.error("Por favor, selecione um arquivo de imagem válido.");
        }
    };

    const handleRemoveImageCapa = () => {
        onRemove();
        setImageError(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileSelect = () => fileInputRef.current.click();

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">
                Selecione uma imagem para a capa do documento.
            </p>
            <div
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
                onClick={triggerFileSelect}
            >
                {previewUrl && !imageError ? (
                    <img 
                        src={previewUrl} 
                        alt="Pré-visualização da Capa" 
                        className="max-h-full max-w-full object-contain"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="text-gray-500">
                        <ImageIcon size={48} className="mx-auto mb-2" />
                        <span>
                            {imageError ? 'Erro ao carregar imagem. Clique para selecionar outra.' : 'Clique para selecionar uma imagem'}
                        </span>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageCapaChange}
                accept="image/*"
                className="hidden"
            />
            {previewUrl && !imageError && (
                <button
                    type='button'
                    onClick={handleRemoveImageCapa}
                    className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                >
                    <Trash2 size={16} /> Remover Imagem
                </button>
            )}
        </div>
    );
};
const TabAgentesNocivos = ({ onCheckboxChange, isChecked, onRecuperar, agentesNocivos, riscos }) => {
    const [subTab, setSubTab] = useState('agentes');
    return (
        <div className="space-y-4">
            <div className="flex justify-center"><div className="flex items-center rounded-lg bg-gray-200 p-1">
                <button type="button" onClick={() => setSubTab('agentes')} className={`px-4 py-1 text-sm rounded-md ${subTab === 'agentes' ? 'bg-green-500 text-white' : 'text-gray-600'}`}>Agentes Nocivos</button>
                <button type="button" onClick={() => setSubTab('riscos')} className={`px-4 py-1 text-sm rounded-md ${subTab === 'riscos' ? 'bg-green-500 text-white' : 'text-gray-600'}`}>Riscos</button>
            </div></div>
            
            <div className="mt-4 p-4 border rounded-md min-h-[200px]">
                {subTab === 'agentes' && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" id="no-insalubres" className="h-4 w-4 rounded text-blue-600" checked={isChecked} onChange={onCheckboxChange} />
                            <label htmlFor="no-insalubres" className="text-sm">Confirmo que as atividades... não são consideradas insalubres.</label>
                        </div>
                        <button type="button" onClick={onRecuperar} className="flex items-center gap-2 w-full justify-center py-2 px-4 rounded-md bg-yellow-400 text-gray-800 hover:bg-yellow-500 mb-4">Agentes Nocivos da Função</button>
                        <h4 className="font-semibold mb-2">Agentes Recuperados:</h4>
                        {agentesNocivos.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-sm">{agentesNocivos.map(agente => <li key={agente.id}>{agente.agenteNocivoCatalogo.descricao}</li>)}</ul>
                        ) : <p className="text-sm text-gray-500">Nenhum agente nocivo recuperado para esta função.</p>}
                    </div>
                )}
                {subTab === 'riscos' && (
                    <div>
                        <h4 className="font-semibold mb-2">Riscos Recuperados:</h4>
                        {riscos.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-sm">{riscos.map(risco => <li key={risco.id}>{risco.riscoCatalogo.descricao}</li>)}</ul>
                        ) : <p className="text-sm text-gray-500">Nenhum risco recuperado para esta função.</p>}
                    </div>
                )}
            </div>

           {agentesNocivos.length === 0 && riscos.length === 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-r-lg">
                    <p>Para criar um LTIP é necessário ao menos um agente nocivo ou risco trabalhista vinculado a função.</p>
                </div>
)}
        </div>
    );
};
const AnexoItem = ({ title, content, onContentChange, onRemove, isReadOnly }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border rounded-md">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-t-md">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-blue-600 font-semibold text-left"><ChevronDown size={20} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />{title}</button>
                {!isReadOnly && <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700 ml-4"><Trash2 size={16}/></button>}
            </div>
            {isOpen && (<div className="p-4 border-t"><label className="text-sm font-medium text-gray-600">Avaliação</label><RichTextEditor content={content} onChange={onContentChange} readOnly={isReadOnly} heightClass="h-48" /></div>)}
        </div>
    )
};
const TabAtividadesPericulosas = ({ onCheckboxChange, isChecked, onSearchAnexos, anexos, onAnexoChange, onRemoveAnexo }) => (
    <div className="space-y-6">
        <p className="text-sm text-gray-600">Atividades e Operações Periculosas no qual a função está exposta.</p>
        <div className="flex items-center gap-2"><input type="checkbox" id="no-periculosas" className="h-4 w-4 rounded text-blue-600" checked={isChecked} onChange={onCheckboxChange} /><label htmlFor="no-periculosas" className="text-sm">Confirmo que as atividades... não são consideradas periculosas.</label></div>
        <div className={isChecked ? 'opacity-50' : ''}><label className="text-sm font-medium text-gray-600">Anexos pertencentes a NR-16...</label><InputWithActions placeholder="Selecione um ou mais anexos da NR-16..." value="" onClick={!isChecked ? onSearchAnexos : undefined} className={isChecked ? 'cursor-not-allowed' : ''} actions={<button type="button" onClick={!isChecked ? onSearchAnexos : undefined} disabled={isChecked} className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md disabled:bg-gray-400"><Search size={18}/></button>} /></div>
        <div className={`space-y-4 ${isChecked ? 'opacity-50' : ''}`}>{anexos.map(anexo => (<AnexoItem key={anexo.id} title={anexo.titulo || anexo.nome || anexo.descricao} content={anexo.avaliacao} onContentChange={(content) => onAnexoChange(anexo.id, content)} onRemove={() => onRemoveAnexo(anexo.id)} isReadOnly={isChecked} />))}</div>
    </div>
);
const TabAparelhos = ({ vinculados, onSearch, onAdd, onRemove }) => (
    <div className="space-y-6">
        <div><label className="text-sm font-medium text-gray-600">Pesquisar Aparelho</label><InputWithActions placeholder="Digite para pesquisar um aparelho..." onClick={onSearch} actions={<><button type="button" onClick={onSearch} className="p-2.5 text-white bg-green-500 hover:bg-green-600"><Search size={18}/></button><button type="button" onClick={onAdd} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-r-md"><Plus size={18}/></button></>} /></div>
        <div><label className="text-sm font-medium text-gray-600">Aparelhos Vinculados</label><div className="mt-2 border rounded-md overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Descrição</th><th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Modelo</th><th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Data da Calibração</th><th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Ações</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{vinculados.map((aparelho) => (<tr key={aparelho.id}><td className="px-4 py-3 font-medium text-gray-800">{aparelho.descricao}</td><td className="px-4 py-3 text-gray-600">{aparelho.modelo}</td><td className="px-4 py-3 text-gray-600">{aparelho.dataCalibracao || 'N/A'}</td><td className="px-4 py-3"><button type="button" onClick={() => onRemove(aparelho.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div></div>
    </div>
);

export default function CadastrarLTIP() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('capa');
    
    // Modais
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isFuncaoModalOpen, setIsFuncaoModalOpen] = useState(false);
    const [isResponsavelTecnicoModalOpen, setIsResponsavelTecnicoModalOpen] = useState(false);
    const [isDemaisElaboradoresModalOpen, setIsDemaisElaboradoresModalOpen] = useState(false);
    const [isAparelhagemModalOpen, setIsAparelhagemModalOpen] = useState(false);
    const [isAnexoNR16ModalOpen, setIsAnexoNR16ModalOpen] = useState(false);

    // Seleções
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncao, setSelectedFuncao] = useState(null);
    const [selectedResponsavelTecnico, setSelectedResponsavelTecnico] = useState(null);
    const [selectedDemaisElaboradores, setSelectedDemaisElaboradores] = useState([]);
    const [selectedAparelhos, setSelectedAparelhos] = useState([]);
    const [anexosPericulosidade, setAnexosPericulosidade] = useState([]);
    const [agentesNocivos, setAgentesNocivos] = useState([]); // Estado para agentes
    const [riscos, setRiscos] = useState([]); // Estado para riscos
    const [capaPreviewUrl, setCapaPreviewUrl] = useState(null);
    const [imagemCapaFile, setImagemCapaFile] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState('save'); // 'save' ou 'delete'

    const handleImageCapaChange = (file) => {
        setImagemCapaFile(file);
        if(file){
            setCapaPreviewUrl(URL.createObjectURL(file));
        }else{
            setCapaPreviewUrl(null);
        }
    }
    const handleRemoveImageCapa = () => {
        setImagemCapaFile(null);
        setCapaPreviewUrl(null);
    }

    const [ltipData, setLtipData] = useState({
        dataLevantamento: '', horaInicial: '', horaFinal: '',
        responsavelEmpresa: '', inicioValidade: '', proximaRevisao: '',
        alertaValidadeDias: 60, naoInsalubre: false, naoPericuloso: false,
        capa: "Crie uma capa personalizada para seu laudo.",
        introducao: `<p>O presente documento representa o <strong>Laudo Técnico de Insalubridade e Periculosidade</strong> da empresa, elaborado com o objetivo de avaliar as condições laborais a que os colaboradores estão expostos no exercício de suas atividades.</p><p>A análise minuciosa das áreas de trabalho, processos produtivos, agentes físicos, químicos e biológicos presentes no ambiente laboral visa identificar possíveis situações de risco que possam comprometer a saúde, a integridade física e a qualidade de vida dos trabalhadores.</p><p>Este laudo foi elaborado em conformidade com as Normas Regulamentadoras (NRs) estabelecidas pelo Ministério do Trabalho e Emprego, bem como com as diretrizes e princípios técnicos da segurança e saúde ocupacional. A sua realização contou com a participação de profissionais especializados e qualificados, visando garantir a precisão das avaliações realizadas e a imparcialidade das conclusões apresentadas.</p>`,
        objetivo: `<p>Este laudo objetiva avaliar as atividades exercidas pelos trabalhadores cuja função denominada é, para fins de constatação de exposição a agentes insalubres contidos na <strong>NR-15</strong> e seus anexos e / ou periculosos enquadrados na <strong>NR-16</strong>.</p><p>Os enquadramentos terão como norteadores normativos portanto, as Normas Regulamentadoras 15 e 16 do Ministério do Trabalho e Emprego da Portaria 1103214, de 08 de junho de 1978.</p><p>O presente trabalho servirá como ponto principal para que o setor de Recursos Humanos possa enfim deliberar ou não sobre os pagamentos desses adicionais.</p>`,
        definicoes: `<h2>Definições, Símbolos e Abreviaturas</h2>
<p>Para o bom entendimento do laudo é necessário que as definições, símbolos e abreviaturas abaixo sejam devidamente compreendidas.</p>

<dl>
    <dt><strong>Nível de Ação:</strong></dt>
    <dd>Situação em que o valor obtido por meio de avaliação quantitativa está próximo do limite de tolerância, porém ainda está abaixo deste.</dd>

    <dt><strong>VCI:</strong></dt>
    <dd>Abreviação para Vibração de Corpo Inteiro.</dd>

    <dt><strong>VMB ou VMS:</strong></dt>
    <dd>Siglas para Vibração de Mãos e Braços ou Vibração de Membros Superiores.</dd>

    <dt><strong>Avaliação:</strong></dt>
    <dd>Conjunto de procedimentos essenciais para realizar uma caracterização abrangente de um determinado ambiente ou da exposição ocupacional dos trabalhadores.</dd>

    <dt><strong>AREN:</strong></dt>
    <dd>Valor resultante da aceleração de exposição normalizada.</dd>

    <dt><strong>VDVR:</strong></dt>
    <dd>Valor da dose de vibração resultante.</dd>

    <dt><strong>Limite de Tolerância:</strong></dt>
    <dd>Concentração ou intensidade máxima ou mínima, associada à natureza e duração da exposição ao agente, que não causará danos à saúde do trabalhador durante sua vida laboral.</dd>

    <dt><strong>CA:</strong></dt>
    <dd>Certificado de Aprovação.</dd>

    <dt><strong>dB(A):</strong></dt>
    <dd>Decibel - é a Unidade Dimensional para "medir" o ruído. A escala "A" é indicada para avaliar a exposição a ruído ocupacional, pois é a que mais se aproxima da resposta do ouvido humano.</dd>

    <dt><strong>dB(C):</strong></dt>
    <dd>A escala "C" é indicada para avaliar a exposição a ruído de impacto ocupacional.</dd>

    <dt><strong>DOSE:</strong></dt>
    <dd>Quantidade % (percentual) indicando se a exposição ao ruído ultrapassa o limite de tolerância. Dose superior a 1(um) significa superação do limite de tolerância.</dd>

    <dt><strong>LAVG:</strong></dt>
    <dd>Nível equivalente - Traduz a "média" da exposição a ruído durante jornada de trabalho.</dd>

    <dt><strong>LT:</strong></dt>
    <dd>Limite de Tolerância.</dd>

    <dt><strong>NR:</strong></dt>
    <dd>Norma Regulamentadora do Ministério do Trabalho.</dd>
</dl>
 
        `,
        descritivoAtividades: `<h2>Metodologia</h2>
          <p>A metodologia adotada para a elaboração do presente laudo teve como base o levantamento das atividades e operações executadas pelos trabalhadores da empresa. Foram conduzidas inspeções nos ambientes de trabalho, observação das atividades desempenhadas, entrevistas informais com os trabalhadores e seus superiores hierárquicos, além do levantamento de documentos, identificação de máquinas, equipamentos, matérias primas e insumos utilizados.</p>

          <h3>Normas e Diretrizes</h3>
          <p>As metodologias de avaliações, seja qualitativa ou quantitativa, estão alinhadas com as <strong>Normas Regulamentadoras do Ministério do Trabalho</strong>, <strong>Normas de Higiene Ocupacional (NHO) da Fundacentro</strong> e, quando aplicável, as diretrizes da <strong>Conferência Norte-Americana de Higienistas Industriais Governamentais (ACGIH)</strong>.</p>

          <h3>Caracterização por Setor</h3>
          <p>Em cada setor, realizou-se a caracterização detalhada de todos os trabalhadores, determinando cargos, funções e descrição das atividades desempenhadas. Em seguida, procedeu-se à caracterização do ambiente de trabalho, identificando principais máquinas/equipamentos, produtos químicos utilizados e avaliando os perigos e riscos. Essas informações foram consolidadas em tabelas de resultados, fornecendo subsídios para a eliminação, neutralização ou minimização dos principais riscos. O reconhecimento pelos menos um ocupante de cada cargo, abrangendo pelo menos um ocupante de cada cargo.</p>

          <h3>Identificação de Riscos e Agentes Nocivos</h3>
          <p>A identificação e caracterização dos <em>Riscos/Agentes Nocivos</em> basearam-se em avaliações qualitativas, sendo avaliados quantitativamente quando identificados, segundo previsões legais e metodológicas. Todos os procedimentos, equipamentos, resultados e julgamentos foram registrados em planilhas e relatórios anexos a este documento.</p>

          <h3>Análise de Grupos de Trabalhadores</h3>
          <p>Após o levantamento, foram identificados os grupos de trabalhadores que desempenham atividades similares na empresa. Posteriormente, realizou-se a análise dos dados levantados e a caracterização da insalubridade, utilizando como referência os critérios estabelecidos no <strong>Art. 189 da CLT</strong> e a <strong>NR-15</strong> e seus anexos. Além dos resultados das avaliações qualitativas e/ou quantitativas, foram consideradas as medidas de controle adotadas pela empresa e sua eficácia na eliminação ou neutralização da insalubridade.</p>

          <h3>Equipamento de Proteção Individual (EPI)</h3>
          <p>No contexto da eficácia do <strong>Equipamento de Proteção Individual (EPI)</strong>, foram levadas em consideração várias dimensões, incluindo:</p>
          <ul>
              <li>O uso adequado e efetivo pelos trabalhadores</li>
              <li>A observância das normas de segurança</li>
              <li>A adequação do equipamento ao risco</li>
              <li>Conformidade com o <strong>Certificado de Aprovação (CA)</strong></li>
              <li>Registro periódico da entrega dos equipamentos, contendo informações essenciais como:
                  <ul>
                      <li>Data</li>
                      <li>Número do CA</li>
                      <li>Especificação do EPI</li>
                      <li>Assinatura do trabalhador</li>
                  </ul>
              </li>
              <li>Realização de treinamentos sobre o uso correto dos equipamentos</li>
            </ul>
        `,
        identificacaoLocal: "<p>Descreva aqui as características do local de trabalho avaliado, incluindo layout, iluminação, ventilação e outros aspectos relevantes.</p>",
        conclusao: "<p>Apresente aqui a conclusão final do laudo, resumindo os principais achados e se há ou não caracterização de insalubridade ou periculosidade.</p>",
    });
    
    useEffect(() => {
    if (id) {
        const fetchLtipData = async () => {
            try {
                const response = await ltipService.getLtipById(id);
                const ltip = response.data || response;

                if (!ltip) {
                    throw new Error("Dados do LTIP não encontrados");
                }

                // Carregar dados básicos
                setLtipData(prevData => ({
                    ...prevData,
                    dataLevantamento: ltip.dataLevantamento || '',
                    horaInicial: ltip.horaInicial || '',
                    horaFinal: ltip.horaFinal || '',
                    responsavelEmpresa: ltip.responsavelEmpresa || '',
                    inicioValidade: ltip.inicioValidade || '',
                    proximaRevisao: ltip.proximaRevisao || '',
                    alertaValidadeDias: ltip.alertaValidadeDias || 60,
                    atividadesNaoInsalubres: ltip.atividadesNaoInsalubres || false,
                    // Remover naoInsalubre e naoPericuloso, usar atividadesNaoInsalubres
                    naoInsalubre: ltip.atividadesNaoInsalubres || false,
                    naoPericuloso: !ltip.atividadesPericulosasAnexos || ltip.atividadesPericulosasAnexos.length === 0,
                    capa: ltip.capa || prevData.capa,
                    introducao: ltip.introducao || prevData.introducao,
                    objetivo: ltip.objetivo || prevData.objetivo,
                    definicoes: ltip.definicoes || prevData.definicoes,
                    descritivoAtividades: ltip.descritivoAtividades || prevData.descritivoAtividades,
                    identificacaoLocal: ltip.identificacaoLocal || prevData.identificacaoLocal,
                    conclusao: ltip.conclusao || prevData.conclusao,
                    metodologia: ltip.metodologia || ltip.descritivoAtividades || prevData.descritivoAtividades,
                    planejamentoAnual: ltip.planejamentoAnual || '',
                    avaliacaoAtividadesPericulosas: ltip.avaliacaoAtividadesPericulosas || ''
                }));

                // Carregar seleções
                if (ltip.funcao) {
                    setSelectedFuncao(ltip.funcao);
                    if (ltip.funcao.setor) {
                        setSelectedSetor(ltip.funcao.setor);
                        if (ltip.funcao.setor.empresa) {
                            setSelectedEmpresa(ltip.funcao.setor.empresa);
                        }
                    }
                }

                if (ltip.responsavelTecnico) {
                    setSelectedResponsavelTecnico(ltip.responsavelTecnico);
                }

                if (ltip.demaisElaboradores && Array.isArray(ltip.demaisElaboradores)) {
                    setSelectedDemaisElaboradores(ltip.demaisElaboradores);
                }

                if (ltip.aparelhos && Array.isArray(ltip.aparelhos)) {
                    setSelectedAparelhos(ltip.aparelhos);
                }

                // Carregar anexos de periculosidade com a estrutura correta
                if (ltip.atividadesPericulosasAnexos && Array.isArray(ltip.atividadesPericulosasAnexos)) {

                    // Mapear anexos do formato da API para o formato do componente
                    const anexosFormatados = ltip.atividadesPericulosasAnexos.map((item, index) => {
                        // item.id = ID do relacionamento na tabela ltip_nr16_anexos
                        // item.anexoId ou item.anexo?.id = ID do anexo NR-16
                        const anexoId = item.anexoId || item.anexo?.id;
                        const titulo = item.anexos || item.anexo?.titulo || item.anexo?.anexos || `Anexo ${item.normaRegulamentadora || 'NR-16'}`;
                        const uniqueId = `${item.id}-${anexoId || index}`; // ID único para o componente

                        return {
                            id: uniqueId,
                            anexoId: anexoId,
                            titulo: `Anexo ${item.normaRegulamentadora || 'NR-16'} - ${titulo}`,
                            nome: titulo,
                            descricao: titulo,
                            avaliacao: item.avaliacao || '',
                            normaRegulamentadora: item.normaRegulamentadora || 'NR-16',
                            anexos: item.anexos || '',
                            ltipAnexoId: item.id // ID do relacionamento na tabela ltip_nr16_anexos
                        };
                    });

                    setAnexosPericulosidade(anexosFormatados);

                    setLtipData(prev => ({
                        ...prev,
                        naoPericuloso: anexosFormatados.length === 0
                    }));
                }

                 if (ltip.imagemCapa) {
                    console.log("Caminho da imagem recebido:", ltip.imagemCapa);
                    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
                    console.log("URL base da API:", apiBaseUrl);
                    const imageUrl = ltip.imagemCapa.startsWith('http')
                        ? ltip.imagemCapa
                        : `${apiBaseUrl}${ltip.imagemCapa}`;
                    console.log("URL final da imagem:", imageUrl);
                    setCapaPreviewUrl(imageUrl);
                }
            } catch (error) {
                console.error("Erro detalhado:", error);
                console.error("Stack trace:", error.stack);
                toast.error("Erro ao carregar dados do LTIP.");
            }
        };
        fetchLtipData();
    }
}, [id]);

    // Efeito para buscar agentes e riscos quando a função é selecionada
    useEffect(() => {
        if (selectedFuncao?.id) {
            const fetchFuncaoDetails = async () => {
                try {
                    const funcaoCompleta = await funcoesService.getById(selectedFuncao.id);
                    setAgentesNocivos(funcaoCompleta.data.agentesNocivosEsocial || []);
                    setRiscos(funcaoCompleta.data.riscosPGR || []);
                    if (!id) { // Só mostra toast se não estiver editando
                        toast.success("Agentes e Riscos da função foram carregados.");
                    }
                } catch (error) {
                    toast.error("Não foi possível buscar os detalhes da função.");
                    console.error("Erro ao buscar detalhes da função:", error);
                }
            };
            fetchFuncaoDetails();
        } else {
            setAgentesNocivos([]);
            setRiscos([]);
        }
    }, [selectedFuncao]);


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLtipData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleRichTextChange = (field, content) => {
        setLtipData(prev => ({ ...prev, [field]: content }));
    };
    
    const handleAnexoAvaliacaoChange = (anexoId, newContent) => {
        setAnexosPericulosidade(prev => prev.map(anexo => anexo.id === anexoId ? { ...anexo, avaliacao: newContent } : anexo));
    };

      const handleSelectAnexoNr16 = (anexo) => {
    if (!anexosPericulosidade.some(a => a.id === anexo.id)) {
        // Adicionar o anexo com a estrutura esperada
        const novoAnexo = {
            ...anexo,
            anexoId: anexo.id, // Garantir que temos o anexoId
            avaliacao: anexo.avaliacao || '' // Garantir que temos o campo avaliacao
        };
        setAnexosPericulosidade(prev => [...prev, novoAnexo]);
    }
    setIsAnexoNR16ModalOpen(false);
};

    const handleDelete = async () => {
        try {
            await ltipService.deleteLtip(id);
            setShowDeleteModal(false);
            setShowDeleteSuccessModal(true);
            setTimeout(() => navigate('/seguranca/ltip'), 1500);
        } catch (error) {
            console.error("Erro ao excluir LTIP:", error);
            setShowDeleteModal(false);
            setErrorType('delete');
            setErrorMessage("Erro ao excluir o LTIP. Tente novamente.");
            setShowErrorModal(true);
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFuncao || !selectedResponsavelTecnico) {
        setErrorMessage("Função e Responsável Técnico são obrigatórios.");
        setShowErrorModal(true);
        return;
    }

    // Preparar o array de anexos de periculosidade no formato esperado pela API
    const atividadesPericulosasAnexosFormatado = anexosPericulosidade.map(anexo => {
        const anexoPayload = {
            anexoId: anexo.anexoId || anexo.id, // ID do anexo NR-16
            avaliacao: anexo.avaliacao || ''
        };

        // Se estamos editando um LTIP existente e este anexo já existia, incluir o ID do relacionamento
        if (id && anexo.ltipAnexoId) {
            anexoPayload.id = anexo.ltipAnexoId; // ID do relacionamento na tabela ltip_nr16_anexos
        }

        return anexoPayload;
    });

    // Preparar avaliação consolidada (opcional, se a API aceitar)
    const avaliacaoAtividadesPericulosas = anexosPericulosidade
        .map(anexo => `<h3>${anexo.titulo}</h3>${anexo.avaliacao || ''}`)
        .join('\n\n');

    const ltipPayload = {
        funcaoId: selectedFuncao.id,
        dataLevantamento: ltipData.dataLevantamento,
        horaInicial: ltipData.horaInicial,
        horaFinal: ltipData.horaFinal,
        responsavelTecnicoId: selectedResponsavelTecnico.id,
        demaisElaboradoresIds: selectedDemaisElaboradores.map(p => p.id),
        responsavelEmpresa: ltipData.responsavelEmpresa,
        inicioValidade: ltipData.inicioValidade,
        proximaRevisao: ltipData.proximaRevisao,
        alertaValidadeDias: ltipData.alertaValidadeDias,
        introducao: ltipData.introducao,
        objetivo: ltipData.objetivo,
        definicoes: ltipData.definicoes,
        metodologia: ltipData.metodologia || ltipData.descritivoAtividades,
        descritivoAtividades: ltipData.descritivoAtividades,
        identificacaoLocal: ltipData.identificacaoLocal,
        conclusao: ltipData.conclusao,
        planejamentoAnual: ltipData.planejamentoAnual || '',
        atividadesNaoInsalubres: ltipData.naoInsalubre,
        atividadesPericulosasAnexos: atividadesPericulosasAnexosFormatado, // Array no formato correto
        avaliacaoAtividadesPericulosas: avaliacaoAtividadesPericulosas,
        bibliografiasIds: [], // Adicionar se tiver bibliografia
        aparelhosIds: selectedAparelhos.map(a => a.id)
    };



    try {
        if (id) {
            await ltipService.updateLtip(id, ltipPayload, imagemCapaFile);
            setShowSuccessModal(true);
            setTimeout(() => navigate('/seguranca/ltip'), 1500)
        } else {
            await ltipService.createLtip(ltipPayload, imagemCapaFile);
              setShowSuccessModal(true);
            setTimeout(() => navigate('/seguranca/ltip'), 1500)
        }
        setTimeout(() => navigate('/seguranca/ltip'), 1500);
    } catch (error) {
        setErrorType('save');
        setErrorMessage("Erro ao salvar o LTIP. Tente novamente.");
        setShowErrorModal(true);
    }
};

    const tabContents = {
      capa: (
        <TabCapa onFileChange={handleImageCapaChange} 
        onRemove={handleRemoveImageCapa} 
        previewUrl={capaPreviewUrl} />
      ),
      introducao: (
        <RichTextEditor
          content={ltipData.introducao}
          onChange={(c) => handleRichTextChange("introducao", c)}
        />
      ),
      objetivo: (
        <RichTextEditor
          content={ltipData.objetivo}
          onChange={(c) => handleRichTextChange("objetivo", c)}
        />
      ),
      definicoes: (
        <RichTextEditor
          content={ltipData.definicoes}
          onChange={(c) => handleRichTextChange("definicoes", c)}
        />
      ),
      metodologia: (
        <RichTextEditor
          content={ltipData.descritivoAtividades}
          onChange={(c) => handleRichTextChange("descritivoAtividades", c)}
        />

      ),
      aparelhos: (
        <TabAparelhos
          vinculados={selectedAparelhos}
          onSearch={() => setIsAparelhagemModalOpen(true)}
          onAdd={() =>
            alert("Função para adicionar novo aparelho não implementada.")
          }
          onRemove={(aparelhoId) =>
            setSelectedAparelhos((prev) =>
              prev.filter((a) => a.id !== aparelhoId)
            )
          }
        />
      ),
      identificacao_local: (
        <RichTextEditor
          content={ltipData.identificacaoLocal}
          onChange={(c) => handleRichTextChange("identificacaoLocal", c)}
        />
      ),
      agentes: (
        <TabAgentesNocivos
          isChecked={ltipData.naoInsalubre}
          onCheckboxChange={(e) =>
            handleInputChange({
              target: {
                name: "naoInsalubre",
                type: "checkbox",
                checked: e.target.checked,
              },
            })
          }
          onRecuperar={() =>
            toast.info(
              "A busca de agentes já é automática ao selecionar a função."
            )
          }
          agentesNocivos={agentesNocivos}
          riscos={riscos}
        />
      ),
      avaliacao_atividades_periculosas: (
        <TabAtividadesPericulosas
          isChecked={ltipData.naoPericuloso}
          onCheckboxChange={(e) =>
            handleInputChange({
              target: {
                name: "naoPericuloso",
                type: "checkbox",
                checked: e.target.checked,
              },
            })
          }
          anexos={anexosPericulosidade}
          onAnexoChange={handleAnexoAvaliacaoChange}
          onSearchAnexos={() => setIsAnexoNR16ModalOpen(true)}
          onRemoveAnexo={(anexoId) =>
            setAnexosPericulosidade((prev) =>
              prev.filter((a) => a.id !== anexoId)
            )
          }
        />
      ),
      conclusao: (
        <RichTextEditor
          content={ltipData.conclusao}
          onChange={(c) => handleRichTextChange("conclusao", c)}
        />
      ),
    };

    const tabLabels = [
        { id: 'capa', label: 'Capa' },
        { id: 'introducao', label: 'Introdução' }, 
        { id: 'objetivo', label: 'Objetivo' },
        { id: 'definicoes', label: 'Definições' }, 
        { id: 'metodologia', label: 'Metodologia e Descritivos das Atividades' },
        { id: 'aparelhos', label: 'Aparelhos' },
        { id: 'identificacao_local', label: 'Identificação do Local' }, 
        { id: 'agentes', label: 'Agentes Nocivos/Riscos' },
        { id: 'avaliacao_atividades_periculosas', label: 'Atividades e Operações Periculosas', hasDot: anexosPericulosidade.length > 0 },
        { id: 'conclusao', label: 'Conclusão' },
    ];

    return (
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
        />
        <div className="container mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? `Editar LTIP #${id}` : "Cadastrar LTIP"}
            </h1>
          </header>
          <form onSubmit={handleSubmit}>
            <FormSection title="Dados Empresa">
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Empresa *
                  </label>
                  <InputWithActions
                    value={selectedEmpresa?.razaoSocial || ""}
                    onClick={() => setIsEmpresaModalOpen(true)}
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEmpresaModalOpen(true)}
                          className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmpresa(null);
                            setSelectedSetor(null);
                            setSelectedFuncao(null);
                          }}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
                <div></div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Setores
                  </label>
                  <InputWithActions
                    value={selectedSetor?.nome || ""}
                    onClick={() => selectedEmpresa && setIsSetorModalOpen(true)}
                    actions={
                      <>
                        <button
                          type="button"
                          disabled={!selectedEmpresa}
                          onClick={() => setIsSetorModalOpen(true)}
                          className="p-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSetor(null);
                            setSelectedFuncao(null);
                          }}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Funções
                  </label>
                  <InputWithActions
                    value={selectedFuncao?.nome || ""}
                    onClick={() => selectedSetor && setIsFuncaoModalOpen(true)}
                    actions={
                      <>
                        <button
                          type="button"
                          disabled={!selectedSetor}
                          onClick={() => setIsFuncaoModalOpen(true)}
                          className="p-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFuncao(null)}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Data/Horário do Levantamento de Dados">
              <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Data do Levantamento *
                  </label>
                  <input
                    type="date"
                    name="dataLevantamento"
                    value={ltipData.dataLevantamento}
                    onChange={handleInputChange}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Hora Inicial *
                  </label>
                  <input
                    type="time"
                    name="horaInicial"
                    value={ltipData.horaInicial}
                    onChange={handleInputChange}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Hora Final *
                  </label>
                  <input
                    type="time"
                    name="horaFinal"
                    value={ltipData.horaFinal}
                    onChange={handleInputChange}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Sobre o documento">
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Responsável Técnico/Elaborador *
                  </label>
                  <InputWithActions
                    value={selectedResponsavelTecnico?.nome || ""}
                    onClick={() => setIsResponsavelTecnicoModalOpen(true)}
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => setIsResponsavelTecnicoModalOpen(true)}
                          className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedResponsavelTecnico(null)}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Demais Elaboradores
                  </label>
                  <InputWithActions
                    value={selectedDemaisElaboradores.map(elaborador => elaborador.nome).join(', ') || ''}
                    placeholder="Selecione outros elaboradores"
                    onClick={() => setIsDemaisElaboradoresModalOpen(true)}
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => setIsDemaisElaboradoresModalOpen(true)}
                          className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDemaisElaboradores([])}
                          className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    }
                  />
                </div>
              </div>
              <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Responsável pela empresa *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="responsavelEmpresa"
                      value={ltipData.responsavelEmpresa}
                      onChange={handleInputChange}
                      className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                    />
                    <Check
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Início da validade *
                  </label>
                  <input
                    type="date"
                    name="inicioValidade"
                    value={ltipData.inicioValidade}
                    onChange={handleInputChange}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Próxima revisão *
                  </label>
                  <input
                    type="date"
                    name="proximaRevisao"
                    value={ltipData.proximaRevisao}
                    onChange={handleInputChange}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Alerta de validade do laudo *
                  </label>
                  <select
                    name="alertaValidadeDias"
                    value={ltipData.alertaValidadeDias}
                    onChange={handleInputChange}
                    className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="60">60 dias antes do vencimento</option>
                    <option value="30">30 dias antes do vencimento</option>
                    <option value="15">15 dias antes do vencimento</option>
                  </select>
                </div>
              </div>
            </FormSection>

            <div className="bg-white rounded-lg shadow-md mt-6">
              <h3 className="text-xl font-semibold text-gray-800 p-6">
                Dados do LTIP
              </h3>
              <div className="border-y border-gray-200 overflow-x-auto">
                <nav className="flex space-x-2 px-4">
                  {tabLabels.map((tab) => (
                    <TabButton
                      key={tab.id}
                      label={tab.label}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      hasDot={tab.hasDot}
                    />
                  ))}
                </nav>
              </div>
              <div className="p-6" key={activeTab}>
                {tabContents[activeTab]}
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mt-8">
              {id && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors"
                >
                  Excluir LTIP
                </button>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-500 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        </div>

        <EmpresaSearchModal
          isOpen={isEmpresaModalOpen}
          onClose={() => setIsEmpresaModalOpen(false)}
          onSelect={(empresa) => {
            setSelectedEmpresa(empresa);
            setIsEmpresaModalOpen(false);
          }}
        />
        {selectedEmpresa && (
          <SetorSearchModal
            isOpen={isSetorModalOpen}
            onClose={() => setIsSetorModalOpen(false)}
            onSelect={(setor) => {
              setSelectedSetor(setor);
              setIsSetorModalOpen(false);
            }}
            empresaId={selectedEmpresa.id}
          />
        )}
        {selectedSetor && (
          <FuncaoSearchModal
            isOpen={isFuncaoModalOpen}
            onClose={() => setIsFuncaoModalOpen(false)}
            onSelect={(funcao) => {
              setSelectedFuncao(funcao);
              setIsFuncaoModalOpen(false);
            }}
            empresaId={selectedEmpresa.id}
            setorId={selectedSetor.id}
          />
        )}
        <PrestadorServicoSearchModal
          isOpen={isResponsavelTecnicoModalOpen}
          onClose={() => setIsResponsavelTecnicoModalOpen(false)}
          onSelect={(p) => {
            setSelectedResponsavelTecnico(p);
            setIsResponsavelTecnicoModalOpen(false);
          }}
        />
        <PrestadorServicoSearchModal
          isOpen={isDemaisElaboradoresModalOpen}
          onClose={() => setIsDemaisElaboradoresModalOpen(false)}
          onSelect={(p) => {
            if (!selectedDemaisElaboradores.some((el) => el.id === p.id))
              setSelectedDemaisElaboradores((prev) => [...prev, p]);
            setIsDemaisElaboradoresModalOpen(false);
          }}
        />
        <AparelhagemLtcatModal
          isOpen={isAparelhagemModalOpen}
          onClose={() => setIsAparelhagemModalOpen(false)}
          onSelect={(aparelho) => {
            if (!selectedAparelhos.some((a) => a.id === aparelho.id))
              setSelectedAparelhos((prev) => [...prev, aparelho]);
            setIsAparelhagemModalOpen(false);
          }}
        />
        <AnexoNr16SearchModal
          isOpen={isAnexoNR16ModalOpen}
          onClose={() => setIsAnexoNR16ModalOpen(false)}
          onSelect={handleSelectAnexoNr16}
        />
      
             {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">LTIP salva com sucesso</h3>
                                <p className="text-gray-600">Redirecionando...</p>
                            </div>
                        </div>
                    </div>
                )}

             {showDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
                                <p className="text-gray-600 mb-6">
                                    Tem certeza que deseja excluir este LTIP? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

             {showDeleteSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">LTIP excluído com sucesso</h3>
                                <p className="text-gray-600">Redirecionando...</p>
                            </div>
                        </div>
                    </div>
                )}

             {showErrorModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="text-red-600 text-6xl mb-4">❌</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {errorType === 'delete' ? 'Erro na Exclusão' : 'Erro ao Salvar'}
                                </h3>
                                <p className="text-gray-600 mb-6">{errorMessage}</p>
                                <button
                                    type="button"
                                    onClick={() => setShowErrorModal(false)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
      </div>
    );
}