import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import catService from '../../api/services/Cat/catService.js';
import funcionarioService from '../../api/services/cadastros/funcionariosServices.js';
import FuncionarioSearchModal from '../../components/modal/funcionarioSearchModal.jsx';
import PrestadorServico from '../../components/modal/PrestadorServico.jsx';
import CidSearchModal from '../../components/modal/CidSearchModal.jsx';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import SetorSearchModalEmpresa from '../../components/modal/SetorSearchModal.jsx';
import ParteCorpoSearchModal from '../../components/modal/ParteCorpoSearchModal.jsx';
import AgenteCausadorSearchModal from '../../components/modal/AgenteCausadorSearchModal.jsx';
import SituacaoGeradoraSearchModal from '../../components/modal/SituacaoGeradoraSearchModal.jsx';
import NaturezaLesaoSearchModal from '../../components/modal/NaturezaLesaoSearchModal.jsx';

// Ícones
import {
    AlertCircle, Building, Check, FileText, HeartPulse, Stethoscope,
    User, Search, Trash2, Plus, Clock, RefreshCw, Upload, Calendar,
    MapPin, Camera, UserCheck, Shield, Activity, Briefcase
} from 'lucide-react';

const FormSection = ({ title, children, className = '', icon }) => (
    <div className={`bg-white p-6 rounded-lg shadow-xs border border-gray-100 ${className}`}>
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
            {icon && <div className="text-blue-600">{icon}</div>}
            {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
        </div>
        {children}
    </div>
);

const FormField = ({ label, required, children, className = '', error, description }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
        <div className={error ? "border-red-500 rounded-md" : ""}>
            {children}
        </div>
        {error && <p className="flex items-center gap-1 mt-1 text-xs text-red-500"><AlertCircle size={14}/> {error}</p>}
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

const RadioGroup = ({ name, options, selected, onChange, className = "" }) => (
    <div className={`flex flex-wrap gap-4 ${className}`}>
        {options.map(opt => (
            <label
                key={opt.value}
                className="flex items-center text-sm cursor-pointer"
            >
                <div className="relative">
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={selected === opt.value}
                        onChange={onChange}
                        className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selected === opt.value
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                    }`}>
                        {selected === opt.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                    </div>
                </div>
                <span className="ml-2 text-gray-700">{opt.label}</span>
            </label>
        ))}
    </div>
);

const TabButton = ({ label, isActive, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-5 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
            isActive
                ? 'text-blue-600 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 border-transparent'
        }`}
    >
        {icon && <span>{icon}</span>}
        {label}
    </button>
);

const TabEmpregador = ({ funcionario }) => (
    <div className="space-y-6">
        {funcionario ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField label="Razão Social">
                    <input
                        type="text"
                        value={funcionario.empresa?.razaoSocial || ''}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
                <FormField label="Nome Fantasia">
                    <input
                        type="text"
                        value={funcionario.empresa?.nomeFantasia || ''}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
                <FormField label="CNPJ">
                    <input
                        type="text"
                        value={funcionario.empresa?.cpfOuCnpj ?
                            funcionario.empresa.cpfOuCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : ''
                        }
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Building size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Dados do Empregador</h3>
                <p className="text-gray-500 text-center max-w-md">
                    Informações serão carregadas automaticamente após selecionar o funcionário
                </p>
            </div>
        )}
    </div>
);

const TabAcidentado = ({ funcionario, onFuncionarioSearch }) => (
    <div className="space-y-6">
        <FormField label="Funcionário Acidentado" required>
            <InputWithActions
                placeholder="Pesquisar funcionário..."
                value={funcionario ? `${funcionario.nome} ${funcionario.sobrenome} - ${funcionario.cpf}` : ''}
                onClick={onFuncionarioSearch}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={onFuncionarioSearch}
                            className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                        >
                            <Search size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {}}
                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                }
            />
        </FormField>

        {funcionario && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField label="Nome Completo">
                    <input
                        type="text"
                        value={`${funcionario.nome} ${funcionario.sobrenome}`}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
                <FormField label="CPF">
                    <input
                        type="text"
                        value={funcionario.cpf || ''}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
                <FormField label="Data de Nascimento">
                    <input
                        type="date"
                        value={funcionario.dataNascimento || ''}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
                <FormField label="Função">
                    <input
                        type="text"
                        value={funcionario.funcao?.nome || ''}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
                <FormField label="Setor">
                    <input
                        type="text"
                        value={funcionario.setor?.nome || ''}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
                <FormField label="Data de Admissão">
                    <input
                        type="date"
                        value={funcionario.dataAdmissao || ''}
                        readOnly
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </FormField>
            </div>
        )}
    </div>
);

const TabAcidente = ({
    formData,
    handleChange,
    handleInputChange,
    handleEnderecoChange,
    selectedParteCorpo,
    selectedAgenteCausador,
    selectedSituacaoGeradora,
    selectedNaturezaLesao,
    onParteCorpoSearch,
    onAgenteCausadorSearch,
    onSituacaoGeradoraSearch,
    onNaturezaLesaoSearch,
    onParteCorpoClear,
    onAgenteCausadorClear,
    onSituacaoGeradoraClear,
    onNaturezaLesaoClear
}) => (
    <div className="space-y-8">
        {/* Dados do Acidente */}
        <FormSection title="Dados do Acidente" icon={<AlertCircle size={20}/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField label="Tipo da CAT" required>
                    <select
                        name="tipoCat"
                        value={formData.tipoCat}
                        onChange={handleInputChange}
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione...</option>
                        <option value="INICIAL">Inicial</option>
                        <option value="REABERTURA">Reabertura</option>
                        <option value="COMUNICACAO_OBITO">Comunicação de Óbito</option>
                    </select>
                </FormField>

                {/* Campo condicional para Número CAT de Origem */}
                {(formData.tipoCat === 'REABERTURA' || formData.tipoCat === 'COMUNICACAO_OBITO') && (
                    <FormField label="Número CAT de Origem" required>
                        <input
                            type="text"
                            name="numeroCatOrigem"
                            value={formData.numeroCatOrigem}
                            onChange={handleInputChange}
                            placeholder="Ex: CAT-2024-001234"
                            className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </FormField>
                )}

                <FormField label="Iniciativa da CAT" required>
                    <select
                        name="iniciativaCat"
                        value={formData.iniciativaCat}
                        onChange={handleInputChange}
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione...</option>
                        <option value="INICIATIVA_DO_EMPREGADOR">Iniciativa do Empregador</option>
                        <option value="ORDEM_JUDICIAL">Ordem Judicial</option>
                        <option value="DETERMINACAO_ORGAO_FISCALIZADOR">Determinação de Órgão Fiscalizador</option>
                    </select>
                </FormField>

                <FormField label="Data do Acidente" required>
                    <input
                        type="date"
                        name="dataAcidente"
                        value={formData.dataAcidente}
                        onChange={handleInputChange}
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </FormField>

                <FormField label="Hora do Acidente" required>
                    <input
                        type="time"
                        name="horaAcidente"
                        value={formData.horaAcidente}
                        onChange={handleInputChange}
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </FormField>

                <FormField label="Horas Trabalhadas" required>
                    <input
                        type="number"
                        name="horasTrabalhadas"
                        value={formData.horasTrabalhadas}
                        onChange={handleInputChange}
                        min="0"
                        max="24"
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </FormField>

                <FormField label="Último Dia Trabalhado">
                    <input
                        type="date"
                        name="ultimoDiaTrabalhado"
                        value={formData.ultimoDiaTrabalhado}
                        onChange={handleInputChange}
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </FormField>

                <FormField label="Tipo de Acidente" required>
                    <RadioGroup
                        name="tipoAcidente"
                        options={[
                            { value: 'TIPICO', label: 'Típico' },
                            { value: 'TRAJETO', label: 'Trajeto' },
                            { value: 'DOENCA_TRABALHO', label: 'Doença do Trabalho' }
                        ]}
                        selected={formData.tipoAcidente}
                        onChange={handleChange}
                    />
                </FormField>

                <FormField label="Houve Afastamento?" required>
                    <RadioGroup
                        name="houveAfastamento"
                        options={[
                            { value: true, label: 'Sim' },
                            { value: false, label: 'Não' }
                        ]}
                        selected={formData.houveAfastamento}
                        onChange={(e) => handleInputChange({
                            target: {
                                name: 'houveAfastamento',
                                type: 'radio',
                                value: e.target.value === 'true'
                            }
                        })}
                    />
                </FormField>
            </div>
        </FormSection>

        {/* Local do Acidente */}
        <FormSection title="Local do Acidente" icon={<MapPin size={20}/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Tipo do Local" required>
                    <select
                        name="tipoLocalAcidente"
                        value={formData.tipoLocalAcidente}
                        onChange={handleInputChange}
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione...</option>
                        <option value="ESTABELECIMENTO_DO_EMPREGADOR_NO_BRASIL">Estabelecimento do Empregador no Brasil</option>
                        <option value="ESTABELECIMENTO_DO_EMPREGADOR_NO_EXTERIOR">Estabelecimento do Empregador no Exterior</option>
                        <option value="ESTABELECIMENTO_DE_TERCEIROS">Estabelecimento de Terceiros</option>
                        <option value="VIA_PUBLICA">Via Pública</option>
                        <option value="AREA_RURAL">Área Rural</option>
                        <option value="EMBARCACAO">Embarcação</option>
                        <option value="OUTROS">Outros</option>
                    </select>
                </FormField>

                <FormField label="Especificação do Local">
                    <input
                        type="text"
                        name="localAcidenteEspecificacao"
                        value={formData.localAcidenteEspecificacao}
                        onChange={handleInputChange}
                        placeholder="Ex: Almoxarifado Central, Setor de Produção..."
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </FormField>
            </div>
        </FormSection>

        <FormSection title="Endereço do Local do Acidente" icon={<MapPin size={20}/>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="CEP">
                    <input type="text" name="cep" value={formData.localAcidenteEndereco.cep} onChange={handleEnderecoChange} className="w-full py-2.5 px-4 border border-gray-300 rounded-lg" />
                </FormField>
                <FormField label="Logradouro" className="md:col-span-2">
                    <input type="text" name="logradouro" value={formData.localAcidenteEndereco.logradouro} onChange={handleEnderecoChange} className="w-full py-2.5 px-4 border border-gray-300 rounded-lg" />
                </FormField>
                <FormField label="Número">
                    <input type="text" name="numero" value={formData.localAcidenteEndereco.numero} onChange={handleEnderecoChange} className="w-full py-2.5 px-4 border border-gray-300 rounded-lg" />
                </FormField>
                <FormField label="Bairro" className="md:col-span-2">
                    <input type="text" name="bairro" value={formData.localAcidenteEndereco.bairro} onChange={handleEnderecoChange} className="w-full py-2.5 px-4 border border-gray-300 rounded-lg" />
                </FormField>
                <FormField label="Cidade">
                    <input type="text" name="cidade" value={formData.localAcidenteEndereco.cidade} onChange={handleEnderecoChange} className="w-full py-2.5 px-4 border border-gray-300 rounded-lg" />
                </FormField>
                <FormField label="Estado (UF)">
                    <input type="text" name="estado" value={formData.localAcidenteEndereco.estado} onChange={handleEnderecoChange} maxLength="2" className="w-full py-2.5 px-4 border border-gray-300 rounded-lg" />
                </FormField>
            </div>
        </FormSection>

        {/* Detalhes da Lesão */}
        <FormSection title="Detalhes da Lesão e Acidente" icon={<Activity size={20}/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Parte do Corpo Atingida" required>
                    <InputWithActions
                        placeholder="Pesquisar parte do corpo..."
                        value={selectedParteCorpo ? `${selectedParteCorpo.codigo ? selectedParteCorpo.codigo + ' - ' : ''}${selectedParteCorpo.nome || selectedParteCorpo.descricao}` : ''}
                        onClick={onParteCorpoSearch}
                        actions={
                            <>
                                <button type="button" onClick={onParteCorpoSearch} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700"><Search size={18} /></button>
                                {selectedParteCorpo && <button type="button" onClick={onParteCorpoClear} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"><Trash2 size={18} /></button>}
                            </>
                        }
                    />
                </FormField>
                <FormField label="Agente Causador do Acidente" required>
                    <InputWithActions
                        placeholder="Pesquisar agente causador..."
                        value={selectedAgenteCausador ? `${selectedAgenteCausador.codigo ? selectedAgenteCausador.codigo + ' - ' : ''}${selectedAgenteCausador.nome || selectedAgenteCausador.descricao}` : ''}
                        onClick={onAgenteCausadorSearch}
                        actions={
                            <>
                                <button type="button" onClick={onAgenteCausadorSearch} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700"><Search size={18} /></button>
                                {selectedAgenteCausador && <button type="button" onClick={onAgenteCausadorClear} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"><Trash2 size={18} /></button>}
                            </>
                        }
                    />
                </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormField label="Natureza da Lesão" required>
                    <InputWithActions
                        placeholder="Pesquisar natureza da lesão..."
                        value={selectedNaturezaLesao ? `${selectedNaturezaLesao.codigo ? selectedNaturezaLesao.codigo + ' - ' : ''}${selectedNaturezaLesao.nome || selectedNaturezaLesao.descricao}` : ''}
                        onClick={onNaturezaLesaoSearch}
                        actions={
                            <>
                                <button type="button" onClick={onNaturezaLesaoSearch} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700"><Search size={18} /></button>
                                {selectedNaturezaLesao && <button type="button" onClick={onNaturezaLesaoClear} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"><Trash2 size={18} /></button>}
                            </>
                        }
                    />
                </FormField>
                <FormField label="Situação Geradora do Acidente" required>
                    <InputWithActions
                        placeholder="Pesquisar situação geradora..."
                        value={selectedSituacaoGeradora ? `${selectedSituacaoGeradora.codigo ? selectedSituacaoGeradora.codigo + ' - ' : ''}${selectedSituacaoGeradora.nome || selectedSituacaoGeradora.descricao}` : ''}
                        onClick={onSituacaoGeradoraSearch}
                        actions={
                            <>
                                <button type="button" onClick={onSituacaoGeradoraSearch} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700"><Search size={18} /></button>
                                {selectedSituacaoGeradora && <button type="button" onClick={onSituacaoGeradoraClear} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"><Trash2 size={18} /></button>}
                            </>
                        }
                    />
                </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormField label="Lateralidade (Parte do Corpo Atingida)">
                    <RadioGroup
                        name="lateralidade"
                        options={[
                            { value: 'NAO_APLICAVEL', label: 'Não Aplicável' },
                            { value: 'ESQUERDA', label: 'Esquerda' },
                            { value: 'DIREITA', label: 'Direita' },
                            { value: 'AMBAS', label: 'Ambas' },
                        ]}
                        selected={formData.lateralidade}
                        onChange={handleChange}
                    />
                </FormField>
            </div>
        </FormSection>

        {/* Informações Adicionais */}
        <FormSection title="Informações Adicionais" icon={<Plus size={20}/>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Houve Registro Policial?">
                    <RadioGroup
                        name="houveRegistroPolicial"
                        options={[
                            { value: true, label: 'Sim' },
                            { value: false, label: 'Não' }
                        ]}
                        selected={formData.houveRegistroPolicial}
                        onChange={(e) => handleInputChange({
                            target: {
                                name: 'houveRegistroPolicial',
                                type: 'radio',
                                value: e.target.value === 'true'
                            }
                        })}
                    />
                </FormField>

                <FormField label="Houve Óbito?">
                    <RadioGroup
                        name="houveObito"
                        options={[
                            { value: true, label: 'Sim' },
                            { value: false, label: 'Não' }
                        ]}
                        selected={formData.houveObito}
                        onChange={(e) => handleInputChange({
                            target: {
                                name: 'houveObito',
                                type: 'radio',
                                value: e.target.value === 'true'
                            }
                        })}
                    />
                </FormField>

                {formData.houveObito && (
                    <FormField label="Data do Óbito" required>
                        <input
                            type="date"
                            name="dataObito"
                            value={formData.dataObito}
                            onChange={handleInputChange}
                            className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </FormField>
                )}
            </div>

            <div className="mt-6">
                <FormField label="Observações">
                    <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Descreva como o acidente aconteceu, as circunstâncias, etc..."
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </FormField>
            </div>
        </FormSection>
    </div>
);

const TabAtestado = ({ formData, handleInputChange, onAtestadoSearch, onAtestadoClear, atestadoMedico }) => (
    <div className="space-y-6">
        <FormField label="Médico Responsável Atestado" required>
            <InputWithActions
                placeholder="Selecionar médico responsável..."
                value={atestadoMedico ? `${atestadoMedico.nome} ${atestadoMedico.sobrenome} - ${atestadoMedico.conselho}` : ''}
                onClick={onAtestadoSearch}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={onAtestadoSearch}
                            className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                            title="Pesquisar médico"
                        >
                            <Search size={18} />
                        </button>
                        {atestadoMedico && (
                            <button
                                type="button"
                                onClick={onAtestadoClear}
                                className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                                title="Remover médico selecionado"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        {!atestadoMedico && (
                            <div className="p-2.5 bg-gray-300 rounded-r-lg">
                                <Trash2 size={18} className="text-gray-500" />
                            </div>
                        )}
                    </>
                }
            />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Data do Atendimento" required>
                <input
                    type="date"
                    name="dataAtendimento"
                    value={formData.dataAtendimento}
                    onChange={handleInputChange}
                    className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </FormField>

            <FormField label="Hora do Atendimento" required>
                <input
                    type="time"
                    name="horaAtendimento"
                    value={formData.horaAtendimento}
                    onChange={handleInputChange}
                    className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Duração do Tratamento (dias)">
                <input
                    type="number"
                    name="duracaoTratamentoDias"
                    value={formData.duracaoTratamentoDias}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </FormField>

            <FormField label="Houve Internação?">
                <RadioGroup
                    name="houveInternacao"
                    options={[
                        { value: true, label: 'Sim' },
                        { value: false, label: 'Não' }
                    ]}
                    selected={formData.houveInternacao}
                    onChange={(e) => handleInputChange({
                        target: {
                            name: 'houveInternacao',
                            type: 'radio',
                            value: e.target.value === 'true'
                        }
                    })}
                />
            </FormField>
        </div>

        <FormField label="Diagnóstico Provável">
            <textarea
                name="diagnosticoProvavel"
                value={formData.diagnosticoProvavel}
                onChange={handleInputChange}
                rows={3}
                placeholder="Descreva o diagnóstico médico..."
                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </FormField>
    </div>
);

const TabCid = ({ onCidSearch, selectedCid, onCidClear }) => (
    <div className="space-y-6">
        <FormField label="CID - Classificação Internacional de Doenças" required>
            <InputWithActions
                placeholder="Clique para selecionar CID..."
                value={selectedCid ? `${selectedCid.codigo} - ${selectedCid.descricao}` : ""}
                onClick={onCidSearch}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={onCidSearch}
                            className="p-2.5 text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Search size={18} />
                        </button>
                        {selectedCid && (
                            <button
                                type="button"
                                onClick={onCidClear}
                                className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg"
                                title="Remover CID selecionado"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </>
                }
            />
        </FormField>

        {selectedCid && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">CID Selecionado</h4>
                <p className="text-sm text-blue-700">
                    <span className="font-medium">Código:</span> {selectedCid.codigo}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                    <span className="font-medium">Descrição:</span> {selectedCid.descricao}
                </p>
            </div>
        )}
    </div>
);

// Componente Principal
const CATForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('empregador');

    // Estados dos modais
    const [isFuncionarioModalOpen, setIsFuncionarioModalOpen] = useState(false);
    const [isPrestadorServicoModalOpen, setIsPrestadorServicoModalOpen] = useState(false);
    const [isCidModalOpen, setIsCidModalOpen] = useState(false);
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isParteCorpoModalOpen, setIsParteCorpoModalOpen] = useState(false);
    const [isAgenteCausadorModalOpen, setIsAgenteCausadorModalOpen] = useState(false);
    const [isSituacaoGeradoraModalOpen, setIsSituacaoGeradoraModalOpen] = useState(false);
    const [isNaturezaLesaoModalOpen, setIsNaturezaLesaoModalOpen] = useState(false);

    // Estados das seleções
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [selectedAtestado, setSelectedAtestado] = useState(null);
    const [selectedCid, setSelectedCid] = useState(null);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedParteCorpo, setSelectedParteCorpo] = useState(null);
    const [selectedAgenteCausador, setSelectedAgenteCausador] = useState(null);
    const [selectedSituacaoGeradora, setSelectedSituacaoGeradora] = useState(null);
    const [selectedNaturezaLesao, setSelectedNaturezaLesao] = useState(null);

    // Estado para lista de funcionários do setor
    const [funcionariosSetor, setFuncionariosSetor] = useState([]);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);

    // Estados dos modais de feedback
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState('save');

    const [formData, setFormData] = useState({
        tipoCat: 'INICIAL',
        iniciativaCat: 'INICIATIVA_DO_EMPREGADOR',
        numeroCatOrigem: '',
        numeroReciboCat: '',
        dataAcidente: '',
        horaAcidente: '',
        horasTrabalhadas: 8,
        tipoAcidente: 'TIPICO',
        houveAfastamento: false,
        ultimoDiaTrabalhado: '',
        tipoLocalAcidente: 'ESTABELECIMENTO_DO_EMPREGADOR_NO_BRASIL',
        localAcidenteEspecificacao: '',
        tipoInscricaoLocalAcidente: 'CNPJ',
        inscricaoLocalAcidente: '',
        lateralidade: 'NAO_APLICAVEL',
        houveRegistroPolicial: false,
        houveObito: false,
        dataObito: '',
        observacoes: '',
        dataAtendimento: '',
        horaAtendimento: '',
        houveInternacao: false,
        duracaoTratamentoDias: 0,
        provavelAfastamento: false,
        diagnosticoProvavel: '',
        localAcidenteEndereco: {
            cep: '',
            logradouro: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: ''
        }
    });

    // Carregar dados se editando
    useEffect(() => {
        if (id) {
            const fetchCatData = async () => {
                try {
                    const response = await catService.getCatById(id);
                    const cat = response.data || response;

                    if (!cat) {
                        throw new Error("Dados da CAT não encontrados");
                    }

                    // Carregar dados do formulário
                    setFormData(prevData => ({
                        ...prevData,
                        ...cat,
                        // Garantir que os booleanos sejam tratados corretamente
                        houveAfastamento: cat.houveAfastamento === true,
                        houveRegistroPolicial: cat.houveRegistroPolicial === true,
                        houveObito: cat.houveObito === true,
                        houveInternacao: cat.houveInternacao === true,
                        provavelAfastamento: cat.provavelAfastamento === true,
                        // Tratar especificamente o endereço do local do acidente
                        localAcidenteEndereco: {
                            cep: cat.localAcidenteEndereco?.cep || '',
                            logradouro: cat.localAcidenteEndereco?.logradouro || '',
                            numero: cat.localAcidenteEndereco?.numero || '',
                            bairro: cat.localAcidenteEndereco?.bairro || '',
                            cidade: cat.localAcidenteEndereco?.cidade || '',
                            estado: cat.localAcidenteEndereco?.estado || ''
                        }
                    }));

                    // Carregar seleções
                    if (cat.acidentado) {
                        setSelectedFuncionario(cat.acidentado);

                        // Se já tem funcionário, carregar empresa e setor dele
                        if (cat.acidentado.empresa) {
                            setSelectedEmpresa(cat.acidentado.empresa);
                        }
                        if (cat.acidentado.setor) {
                            setSelectedSetor(cat.acidentado.setor);
                        }
                    }

                    if (cat.atestadoMedico) {
                        setSelectedAtestado(cat.atestadoMedico);
                    }

                    if (cat.cid) {
                        setSelectedCid(cat.cid);
                    }

                    if (cat.partesCorpoAtingidas && cat.partesCorpoAtingidas.length > 0) {
                        setSelectedParteCorpo(cat.partesCorpoAtingidas[0]);
                    }

                    if (cat.agenteCausador) {
                        setSelectedAgenteCausador(cat.agenteCausador);
                    }

                    if (cat.situacaoGeradora) {
                        setSelectedSituacaoGeradora(cat.situacaoGeradora);
                    }

                    if (cat.naturezaLesao) {
                        setSelectedNaturezaLesao(cat.naturezaLesao);
                    }

                } catch (error) {
                    console.error("Erro ao carregar dados da CAT:", error);
                    toast.error("Erro ao carregar dados da CAT.");
                }
            };
            fetchCatData();
        }
    }, [id]);

    // Função para buscar funcionários por setor
    const fetchFuncionariosPorSetor = async (setorId) => {
        if (!setorId) {
            setFuncionariosSetor([]);
            return;
        }

        setLoadingFuncionarios(true);
        try {
            const response = await funcionarioService.buscarFuncionariosPorSetor(setorId, {
                page: 0,
                size: 100,
                sort: 'nome,asc'
            });

            if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    setFuncionariosSetor(response.data.content);
                } else if (Array.isArray(response.data)) {
                    setFuncionariosSetor(response.data);
                } else {
                    setFuncionariosSetor([]);
                }
            } else {
                setFuncionariosSetor([]);
            }
        } catch (error) {
            console.error("Erro ao buscar funcionários do setor:", error);
            toast.error("Erro ao carregar funcionários do setor.");
            setFuncionariosSetor([]);
        } finally {
            setLoadingFuncionarios(false);
        }
    };

    // Buscar funcionários automaticamente quando setor é selecionado
    useEffect(() => {
        if (selectedSetor && selectedSetor.id) {
            fetchFuncionariosPorSetor(selectedSetor.id);
        } else {
            setFuncionariosSetor([]);
        }
    }, [selectedSetor]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Trata o valor booleano do radio button
        const valorFinal = type === 'radio' ? (value === 'true') : (type === 'checkbox' ? checked : value);

        setFormData(prev => ({
            ...prev,
            [name]: valorFinal
        }));
    };

    const handleEnderecoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            localAcidenteEndereco: {
                ...prev.localAcidenteEndereco,
                [name]: value
            }
        }));
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!selectedFuncionario) {
            setErrorMessage("Funcionário é obrigatório.");
            setShowErrorModal(true);
            return;
        }

        // Validação para Número CAT de Origem em casos de reabertura ou comunicação de óbito
        if ((formData.tipoCat === 'REABERTURA' || formData.tipoCat === 'COMUNICACAO_OBITO') && !formData.numeroCatOrigem) {
            setErrorMessage("Número CAT de Origem é obrigatório para Reabertura ou Comunicação de Óbito.");
            setShowErrorModal(true);
            return;
        }

        const { lateralidade, ...restOfFormData } = formData;

        const catPayload = {
            ...restOfFormData,
            acidentadoFuncionarioId: selectedFuncionario.id,
            cidId: selectedCid?.id,
            atestadoMedicoId: selectedAtestado?.id,
            partesCorpoAtingidasIds: selectedParteCorpo ? [selectedParteCorpo.id] : [],
            agenteCausadorId: selectedAgenteCausador?.id,
            situacaoGeradoraId: selectedSituacaoGeradora?.id,
            naturezaLesaoId: selectedNaturezaLesao?.id
        };

        try {
            if (id) {
                await catService.updateCat(id, catPayload);
                toast.success("CAT atualizada com sucesso!");
            } else {
                await catService.createCat(catPayload);
            }
            setShowSuccessModal(true);
            setTimeout(() => navigate('/seguranca/cat'), 1500);
        } catch (error) {
            console.error("Erro ao salvar CAT:", error);
            setErrorType('save');
            setErrorMessage("Erro ao salvar a CAT. Tente novamente.");
            setShowErrorModal(true);
        }
    };

    const handleDelete = async () => {
        try {
            await catService.deleteCat(id);
            setShowDeleteModal(false);
            setShowDeleteSuccessModal(true);
            setTimeout(() => navigate('/seguranca/cat'), 1500);
        } catch (error) {
            console.error("Erro ao excluir CAT:", error);
            setShowDeleteModal(false);
            setErrorType('delete');
            setErrorMessage("Erro ao excluir a CAT. Tente novamente.");
            setShowErrorModal(true);
        }
    };

    const tabs = [
        { id: 'empregador', label: 'Empregador', icon: <Building size={18} /> },
        { id: 'acidentado', label: 'Acidentado', icon: <User size={18} /> },
        { id: 'acidente', label: 'Acidente', icon: <AlertCircle size={18} /> },
        { id: 'atestado', label: 'Atestado', icon: <FileText size={18} /> },
        { id: 'cid', label: 'CID', icon: <HeartPulse size={18} /> }
    ];

    const handleCidClear = () => {
        setSelectedCid(null);
        toast.info("CID removido com sucesso!");
    };

    const handleParteCorpoClear = () => {
        setSelectedParteCorpo(null);
        toast.info("Parte do corpo removida com sucesso!");
    };

    const handleAgenteCausadorClear = () => {
        setSelectedAgenteCausador(null);
        toast.info("Agente causador removido com sucesso!");
    };

    const handleSituacaoGeradoraClear = () => {
        setSelectedSituacaoGeradora(null);
        toast.info("Situação geradora removida com sucesso!");
    };

    const handleNaturezaLesaoClear = () => {
        setSelectedNaturezaLesao(null);
        toast.info("Natureza da lesão removida com sucesso!");
    };

    const handleAtestadoClear = () => {
        setSelectedAtestado(null);
        toast.info("Médico removido com sucesso!");
    };

    const handleAtestadoSave = (novoAtestado) => {
        setSelectedAtestado(novoAtestado);
        toast.success("Médico cadastrado e selecionado com sucesso!");
    };

    const tabContents = {
        empregador: <TabEmpregador funcionario={selectedFuncionario} />,
        acidentado: (
            <TabAcidentado
                funcionario={selectedFuncionario}
                onFuncionarioSearch={() => setIsFuncionarioModalOpen(true)}
            />
        ),
        acidente: (
            <TabAcidente
                formData={formData}
                handleChange={handleChange}
                handleInputChange={handleInputChange}
                handleEnderecoChange={handleEnderecoChange}
                selectedParteCorpo={selectedParteCorpo}
                selectedAgenteCausador={selectedAgenteCausador}
                selectedSituacaoGeradora={selectedSituacaoGeradora}
                selectedNaturezaLesao={selectedNaturezaLesao}
                onParteCorpoSearch={() => setIsParteCorpoModalOpen(true)}
                onAgenteCausadorSearch={() => setIsAgenteCausadorModalOpen(true)}
                onSituacaoGeradoraSearch={() => setIsSituacaoGeradoraModalOpen(true)}
                onNaturezaLesaoSearch={() => setIsNaturezaLesaoModalOpen(true)}
                onParteCorpoClear={handleParteCorpoClear}
                onAgenteCausadorClear={handleAgenteCausadorClear}
                onSituacaoGeradoraClear={handleSituacaoGeradoraClear}
                onNaturezaLesaoClear={handleNaturezaLesaoClear}
            />
        ),
        atestado: (
            <TabAtestado
                formData={formData}
                handleInputChange={handleInputChange}
                onAtestadoSearch={() => setIsPrestadorServicoModalOpen(true)}
                onAtestadoClear={handleAtestadoClear}
                atestadoMedico={selectedAtestado}
            />
        ),
        cid: (
            <TabCid
                onCidSearch={() => setIsCidModalOpen(true)}
                selectedCid={selectedCid}
                onCidClear={handleCidClear}
            />
        )
    };

    return (
        <div className=" mx-auto p-4 bg-gray-50 min-h-screen">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
            />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {id ? `Editar CAT #${id}` : 'Nova Comunicação de Acidente de Trabalho (CAT)'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Preencha todos os campos obrigatórios para emissão do documento
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            {id && (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2.5 bg-red-600 border border-red-700 rounded-lg text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Excluir
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Seção de Pesquisa do Funcionário Acidentado */}
                <div className="bg-white border-b p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User size={20} className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Funcionário Acidentado</h3>
                        <span className="text-red-500">*</span>
                    </div>

                    {!selectedFuncionario ? (
                        <div className="space-y-6">
                            {/* Seleção de Empresa e Setor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Campo Empresa */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Empresa/Unidade *
                                    </label>
                                    <InputWithActions
                                        placeholder="Clique para selecionar empresa/unidade..."
                                        value={selectedEmpresa ? `${selectedEmpresa.razaoSocial} - ${selectedEmpresa.nomeFantasia || selectedEmpresa.cpfOuCnpj}` : ''}
                                        onClick={() => setIsEmpresaModalOpen(true)}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEmpresaModalOpen(true)}
                                                    className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                                >
                                                    <Search size={18} />
                                                </button>
                                                {selectedEmpresa && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedEmpresa(null);
                                                            setSelectedSetor(null);
                                                            toast.info("Empresa removida. Selecione novamente.");
                                                        }}
                                                        className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </>
                                        }
                                    />
                                </div>

                                {/* Campo Setor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Setor *
                                    </label>
                                    <InputWithActions
                                        placeholder={!selectedEmpresa ? "Primeiro selecione uma empresa..." : "Clique para selecionar setor..."}
                                        value={selectedSetor ? selectedSetor.nome : ''}
                                        onClick={() => {
                                            if (selectedEmpresa) {
                                                setIsSetorModalOpen(true);
                                            } else {
                                                toast.warning("Selecione primeiro uma empresa.");
                                            }
                                        }}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedEmpresa) {
                                                            setIsSetorModalOpen(true);
                                                        } else {
                                                            toast.warning("Selecione primeiro uma empresa.");
                                                        }
                                                    }}
                                                    disabled={!selectedEmpresa}
                                                    className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <Search size={18} />
                                                </button>
                                                {selectedSetor && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedSetor(null);
                                                            toast.info("Setor removido. Selecione novamente.");
                                                        }}
                                                        className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </>
                                        }
                                    />
                                </div>
                            </div>

                            {/* Tabela de Funcionários */}
                            {selectedSetor && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Funcionários do Setor "{selectedSetor.nome}" *
                                    </label>

                                    {loadingFuncionarios ? (
                                        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">Carregando funcionários...</span>
                                        </div>
                                    ) : funcionariosSetor.length > 0 ? (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="max-h-80 overflow-y-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Nome
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            CPF
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Função
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Ação
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                    {funcionariosSetor.map((funcionario) => (
                                                        <tr
                                                            key={funcionario.id}
                                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                                                selectedFuncionario?.id === funcionario.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedFuncionario(funcionario);
                                                                toast.success("Funcionário selecionado com sucesso!");
                                                            }}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-10 w-10">
                                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                            <User className="h-5 w-5 text-blue-600" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {funcionario.nome} {funcionario.sobrenome}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {funcionario.email || 'Email não informado'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {funcionario.cpf || 'Não informado'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {funcionario.funcao?.nome || 'Não informado'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedFuncionario(funcionario);
                                                                        toast.success("Funcionário selecionado com sucesso!");
                                                                    }}
                                                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                                                        selectedFuncionario?.id === funcionario.id
                                                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
                                                                    }`}
                                                                >
                                                                    {selectedFuncionario?.id === funcionario.id ? 'Selecionado' : 'Selecionar'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <User size={48} className="text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum funcionário encontrado</h3>
                                            <p className="text-gray-500 text-center">
                                                Não há funcionários cadastrados neste setor.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nome Completo</label>
                                            <p className="text-sm font-semibold text-gray-800 mt-1">
                                                {selectedFuncionario.nome} {selectedFuncionario.sobrenome}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">CPF</label>
                                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedFuncionario.cpf}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Função</label>
                                            <p className="text-sm font-semibold text-gray-800 mt-1">
                                                {selectedFuncionario.funcao?.nome || 'Não informado'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedSetor) {
                                                setIsFuncionarioModalOpen(true);
                                            } else {
                                                toast.warning("Selecione primeiro a empresa e o setor.");
                                            }
                                        }}
                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                                        title="Alterar funcionário"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFuncionario(null);
                                            toast.info("Funcionário removido. Selecione novamente.");
                                        }}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                                        title="Remover funcionário"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto no-scrollbar border-b">
                    <div className="flex min-w-max">
                        {tabs.map(tab => (
                            <TabButton
                                key={tab.id}
                                label={tab.label}
                                icon={tab.icon}
                                isActive={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="px-8 py-4 bg-blue-50 flex items-center">
                    <div className="flex-1">
                        <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{
                                    width: `${Math.round(((selectedFuncionario ? 20 : 0) +
                                        (formData.dataAcidente ? 20 : 0) +
                                        (formData.tipoAcidente ? 20 : 0) +
                                        (selectedAtestado ? 20 : 0) +
                                        (selectedCid ? 20 : 0)))}%`
                                }}
                            />
                        </div>
                    </div>
                    <span className="ml-4 text-sm font-medium text-blue-700">
                        {Math.round(((selectedFuncionario ? 20 : 0) +
                            (formData.dataAcidente ? 20 : 0) +
                            (formData.tipoAcidente ? 20 : 0) +
                            (selectedAtestado ? 20 : 0) +
                            (selectedCid ? 20 : 0)))}% preenchido
                    </span>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    {tabContents[activeTab]}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-5 border-t flex flex-col sm:flex-row justify-between gap-4">
                    <div className="text-sm text-gray-600 flex items-center">
                        <AlertCircle size={16} className="mr-2 text-yellow-500" />
                        Todos os campos marcados com * são obrigatórios
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                                if (currentIndex > 0) {
                                    setActiveTab(tabs[currentIndex - 1].id);
                                }
                            }}
                            disabled={activeTab === 'empregador'}
                            className="px-4 py-2.5 bg-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Voltar
                        </button>
                        {activeTab === 'cid' ? (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="px-4 py-2.5 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Check size={18} />
                                {id ? 'Atualizar CAT' : 'Salvar CAT'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                                    if (currentIndex < tabs.length - 1) {
                                        setActiveTab(tabs[currentIndex + 1].id);
                                    }
                                }}
                                className="px-4 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors"
                            >
                                Próxima Etapa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modais */}
            <FuncionarioSearchModal
                isOpen={isFuncionarioModalOpen}
                onClose={() => setIsFuncionarioModalOpen(false)}
                onSelect={(funcionario) => {
                    setSelectedFuncionario(funcionario);
                    setIsFuncionarioModalOpen(false);
                    toast.success("Funcionário selecionado com sucesso!");
                }}
                empresaId={selectedEmpresa?.id}
                setorId={selectedSetor?.id}
            />

            <CidSearchModal
                isOpen={isCidModalOpen}
                onClose={() => setIsCidModalOpen(false)}
                onSelect={(cid) => {
                    setSelectedCid(cid);
                    setIsCidModalOpen(false);
                    toast.success("CID selecionado com sucesso!");
                }}
            />

            <EmpresaSearchModal
                isOpen={isEmpresaModalOpen}
                onClose={() => setIsEmpresaModalOpen(false)}
                onSelect={(empresa) => {
                    setSelectedEmpresa(empresa);
                    setSelectedSetor(null); // Reset setor quando empresa muda
                    setIsEmpresaModalOpen(false);
                }}
            />
            <SetorSearchModalEmpresa
                isOpen={isSetorModalOpen}
                onClose={() => setIsSetorModalOpen(false)}
                onSelect={(setor) => {
                    setSelectedSetor(setor);
                    setIsSetorModalOpen(false);
                    toast.success("Setor selecionado com sucesso!");
                }}
                empresaId={selectedEmpresa?.id}
            />

            <ParteCorpoSearchModal
                isOpen={isParteCorpoModalOpen}
                onClose={() => setIsParteCorpoModalOpen(false)}
                onSelect={(parteCorpo) => {
                    setSelectedParteCorpo(parteCorpo);
                    setIsParteCorpoModalOpen(false);
                    toast.success("Parte do corpo selecionada com sucesso!");
                }}
            />

            <AgenteCausadorSearchModal
                isOpen={isAgenteCausadorModalOpen}
                onClose={() => setIsAgenteCausadorModalOpen(false)}
                onSelect={(agente) => {
                    setSelectedAgenteCausador(agente);
                    setIsAgenteCausadorModalOpen(false);
                    toast.success("Agente causador selecionado com sucesso!");
                }}
            />

            <SituacaoGeradoraSearchModal
                isOpen={isSituacaoGeradoraModalOpen}
                onClose={() => setIsSituacaoGeradoraModalOpen(false)}
                onSelect={(situacao) => {
                    setSelectedSituacaoGeradora(situacao);
                    setIsSituacaoGeradoraModalOpen(false);
                    toast.success("Situação geradora selecionada com sucesso!");
                }}
            />

            <NaturezaLesaoSearchModal
                isOpen={isNaturezaLesaoModalOpen}
                onClose={() => setIsNaturezaLesaoModalOpen(false)}
                onSelect={(natureza) => {
                    setSelectedNaturezaLesao(natureza);
                    setIsNaturezaLesaoModalOpen(false);
                    toast.success("Natureza da lesão selecionada com sucesso!");
                }}
            />

            <PrestadorServico
                isOpen={isPrestadorServicoModalOpen}
                onClose={() => setIsPrestadorServicoModalOpen(false)}
                onSelect={(medico) => {
                    setSelectedAtestado(medico);
                    setIsPrestadorServicoModalOpen(false);
                    toast.success("Médico selecionado com sucesso!");
                }}
                tipo="MEDICO"
            />

            {/* Modal de Sucesso */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                            <div className="text-green-600 text-6xl mb-4">✓</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                CAT {id ? 'atualizada' : 'cadastrada'} com sucesso
                            </h3>
                            <p className="text-gray-600">Redirecionando...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-red-600 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
                            <p className="text-gray-600 mb-6">
                                Tem certeza que deseja excluir esta CAT? Esta ação não pode ser desfeita.
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

            {/* Modal de Sucesso da Exclusão */}
            {showDeleteSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                            <div className="text-green-600 text-6xl mb-4">✓</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">CAT excluída com sucesso</h3>
                            <p className="text-gray-600">Redirecionando...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Erro */}
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
};


export default CATForm;
