import React, {useEffect, useState} from 'react';
import {
    Check,
    Search, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import funcionariosService from '../../../api/services/cadastros/funcionariosServices.js';
import { useNavigate, useParams } from 'react-router-dom';
import EmpresaSearchModal from "../../../components/modal/empresaSearchModal.jsx";
import empresasService from '../../../api/services/cadastros/serviceEmpresas.js';
import funcoesService from '../../../api/services/cadastros/funcoesService.js';
import setoresService from '../../../api/services/cadastros/serviceSetores.js';
import FuncaoSearchModal from "../../../components/modal/funcaoSearchModal.jsx";
import SetorSearchModal from "../../../components/modal/SetorSearchModal.jsx";

// --- Componentes Reutilizáveis ---
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-4 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-5">
            {children}
        </div>
    </div>
);

const FormField = ({ label, required, children, className = '' }) => (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
        <label className="text-sm font-medium text-slate-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const InputWithStatus = ({ value, status, type = 'text', placeholder, name, onChange }) => (
    <div className="relative">
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            name={name}
            onChange={onChange}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
        {status === 'valid' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Check className="h-5 w-5 text-green-500" />
            </div>
        )}
    </div>
);

const InputWithActions = ({ placeholder, actions, value }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            readOnly
            className="w-full py-2 px-3 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// --- Componente Principal ---
export default function EditarFuncionario() {
    const navigate = useNavigate();
    const { id } = useParams(); // Obter o ID do funcionário a ser editado
    const [funcionario, setFuncionario] = useState({
        nome: '',
        sobrenome: '',
        status: 'ATIVO',
        cpf: '',
        rg: '',
        idade:'',
        orgaoEmissorRg: '',
        dataEmissaoRg: '',
        estadoEmissorRg: '',
        raca: 'AMARELA',
        sexo: 'NAO_INFORMADO',
        estadoCivil: 'SOLTEIRO',
        dataNascimento: '',
        nomeMae: '',
        nomePai: '',
        endereco: {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
        },
        regiao: '',
        telefone: '',
        email: '',
        observacoes: '',
        matricula: '',
        empresaId: null,
        funcaoId: null,
        dataAdmissao: '',
        setorId: null
    });
    const [empresa, setEmpresa] = useState(null);
    const [funcao, setFuncao] = useState(null);
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showFuncaoModal, setShowFuncaoModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [setor, setSetor] = useState(null);
    const [showSetorModal, setShowSetorModal] = useState(false);


    useEffect(() => {
        const carregarFuncionario = async () => {
            try {
                setInitialLoading(true);
                const response = await funcionariosService.getById(id);
                const funcionarioData = response.data;

                console.log("Dados do funcionário carregados:", funcionarioData);

                // Formatação de dados recebidos conforme necessário
                setFuncionario({
                    ...funcionarioData,
                    // Garantir que a estrutura do endereço esteja correta
                    endereco: funcionarioData.endereco || {
                        logradouro: '',
                        numero: '',
                        complemento: '',
                        bairro: '',
                        cidade: '',
                        estado: '',
                        cep: ''
                    },
                    // Adicionar IDs se não existirem mas os objetos embedded existem
                    empresaId: funcionarioData.empresaId || funcionarioData.empresa?.id,
                    funcaoId: funcionarioData.funcaoId || funcionarioData.funcao?.id,
                    setorId: funcionarioData.setorId || funcionarioData.setor?.id
                });

                // Usar dados embedded em vez de chamadas separadas
                if (funcionarioData.empresa) {
                    console.log("Definindo empresa a partir dos dados embedded:", funcionarioData.empresa);
                    setEmpresa(funcionarioData.empresa);
                }

                if (funcionarioData.funcao) {
                    console.log("Definindo função a partir dos dados embedded:", funcionarioData.funcao);
                    setFuncao(funcionarioData.funcao);
                }

                if (funcionarioData.setor) {
                    console.log("Definindo setor a partir dos dados embedded:", funcionarioData.setor);
                    setSetor(funcionarioData.setor);
                }

            } catch (error) {
                console.error("Erro ao carregar dados do funcionário:", error);
                toast.error("Erro ao carregar dados do funcionário");
            } finally {
                setInitialLoading(false);
            }
        };

        if (id) {
            carregarFuncionario();
        }
    }, [id]);

    const handleSelectSetor = (setorSelecionado) => {
        setSetor(setorSelecionado);
        setFuncionario(prevState => ({
            ...prevState,
            setorId: setorSelecionado.id
        }))
    };

    useEffect(() => {
        if (funcionario.dataNascimento) {
            const calcularIdade = (dataNascimento) => {
                const hoje = new Date();
                const nascimento = new Date(dataNascimento);
                let idade = hoje.getFullYear() - nascimento.getFullYear();
                const mes = hoje.getMonth() - nascimento.getMonth();

                if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                    idade--;
                }

                return idade.toString();
            };

            const idade = calcularIdade(funcionario.dataNascimento);
            setFuncionario(prev => ({
                ...prev,
                idade: idade
            }));
        }
    }, [funcionario.dataNascimento]);

    const formatarCpf = (valor) => {
        if (!valor) return '';
        const apenasNumeros = valor.replace(/\D/g, '');
        const cpfLimitado = apenasNumeros.slice(0, 11);
        return cpfLimitado
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const formatarTelefone = (valor) => {
        if (!valor) return '';
        const apenasNumeros = valor.replace(/\D/g, '');
        const telefoneLimitado = apenasNumeros.slice(0, 11);

        if (telefoneLimitado.length <= 10) {
            return telefoneLimitado
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            return telefoneLimitado
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
    };

    const formatarCep = (valor) => {
        if (!valor) return '';
        const apenasNumeros = valor.replace(/\D/g, '');
        const cepLimitado = apenasNumeros.slice(0, 8);
        return cepLimitado.replace(/(\d{5})(\d)/, '$1-$2');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            const cpfFormatado = formatarCpf(value);
            setFuncionario(prev => ({
                ...prev,
                [name]: cpfFormatado
            }));
        } else if (name === 'telefone') {
            const telefoneFormatado = formatarTelefone(value);
            setFuncionario(prev => ({
                ...prev,
                [name]: telefoneFormatado
            }));
        } else {
            setFuncionario(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleEnderecoChange = (e) => {
        const { name, value } = e.target;

        let valorFormatado = value;

        // Formatação específica para CEP
        if (name === 'cep') {
            valorFormatado = formatarCep(value);
        }

        setFuncionario(prev => ({
            ...prev,
            endereco: {
                ...prev.endereco,
                [name]: valorFormatado
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validação dos campos obrigatórios com objeto de erros
        const camposObrigatorios = {
            matricula: 'Matrícula é obrigatória',
            empresaId: 'Empresa é obrigatória',
            funcaoId: 'Função é obrigatória',
            dataAdmissao: 'Data de admissão é obrigatória',
            cpf: 'CPF é obrigatório'
        };

        // Verificar campos obrigatórios
        for (const [campo, mensagem] of Object.entries(camposObrigatorios)) {
            if (!funcionario[campo] || (typeof funcionario[campo] === 'string' && !funcionario[campo].trim())) {
                toast.error(mensagem);
                return;
            }
        }

        // Validar formato do CPF
        const cpfFormatado = funcionario.cpf.trim();
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

        if (!cpfRegex.test(cpfFormatado)) {
            toast.error('CPF deve estar no formato XXX.XXX.XXX-XX');
            return;
        }

        try {
            setLoading(true);

            // Função auxiliar para limpar strings ou retornar valor padrão
            const limparTexto = (texto, padrao = '') => (texto?.trim() || padrao);

            // Função auxiliar para converter para inteiro ou null
            const paraInteiro = (valor) => (valor ? parseInt(valor) : null);

            // Função auxiliar para remover formatação
            const removerFormatacao = (texto) => (texto?.replace(/\D/g, '') || '');

            // Preparar objeto limpo para envio
            const funcionarioParaEnviar = {
                nome: limparTexto(funcionario.nome),
                sobrenome: limparTexto(funcionario.sobrenome),
                cpf: cpfFormatado,
                rg: limparTexto(funcionario.rg),
                dataEmissaoRg: funcionario.dataEmissaoRg || null,
                estadoEmissorRg: limparTexto(funcionario.estadoEmissorRg),
                orgaoEmissorRg: limparTexto(funcionario.orgaoEmissorRg),
                dataNascimento: funcionario.dataNascimento || null,
                idade: paraInteiro(funcionario.idade),
                sexo: funcionario.sexo || 'NAO_INFORMADO',
                estadoCivil: funcionario.estadoCivil || 'SOLTEIRO',
                raca: funcionario.raca || 'NAO_INFORMADO',
                nomeMae: limparTexto(funcionario.nomeMae),
                nomePai: limparTexto(funcionario.nomePai),
                telefone: removerFormatacao(funcionario.telefone),
                email: limparTexto(funcionario.email),
                matricula: limparTexto(funcionario.matricula),
                dataAdmissao: funcionario.dataAdmissao || null,
                status: funcionario.status || 'ATIVO',
                observacoes: limparTexto(funcionario.observacoes),
                empresaId: paraInteiro(funcionario.empresaId),
                funcaoId: paraInteiro(funcionario.funcaoId),
                setorId: paraInteiro(funcionario.setorId),
                endereco: {
                    logradouro: limparTexto(funcionario.endereco?.logradouro),
                    numero: limparTexto(funcionario.endereco?.numero),
                    complemento: limparTexto(funcionario.endereco?.complemento),
                    bairro: limparTexto(funcionario.endereco?.bairro),
                    cidade: limparTexto(funcionario.endereco?.cidade),
                    estado: limparTexto(funcionario.endereco?.estado),
                    cep: removerFormatacao(funcionario.endereco?.cep)
                }
            };

            // Atualizar o funcionário
            await funcionariosService.update(id, funcionarioParaEnviar);

            toast.success('Funcionário atualizado com sucesso!');
            setSuccess(true);

            // Voltar para a lista após sucesso
            navigate('/cadastros/listar/funcionarios');

        } catch (error) {
            console.error("Erro ao atualizar funcionário:", error);
            toast.error(error.message || "Erro ao atualizar funcionário. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmpresa = (empresaSelecionada) => {
        setEmpresa(empresaSelecionada);
        setFuncionario(prevState => ({
            ...prevState,
            empresaId: empresaSelecionada.id
        }));
        setShowEmpresaModal(false);
    };

    const handleSelectFuncao = (funcaoSelecionada) => {
        setFuncao(funcaoSelecionada);
        setFuncionario(prevState => ({
            ...prevState,
            funcaoId: funcaoSelecionada.id
        }));
        setShowFuncaoModal(false);
    };

    const handleVoltar = () => {
        navigate('/cadastros/listar/funcionarios');
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Editar Funcionário</h1>
                    <button
                        onClick={handleVoltar}
                        className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Voltar
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Seção: Informações da Empresa */}
                    <FormSection title="Informações da Empresa">
                        <FormField label="Empresa" required className="col-span-1 xl:col-span-2">
                            <InputWithActions
                                placeholder="Selecione uma empresa"
                                value={empresa ? (empresa.nomeFantasia ? `${empresa.razaoSocial} (${empresa.nomeFantasia})` : empresa.razaoSocial) : ''}
                                actions={
                                    <button
                                        type="button"
                                        className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600 rounded-md"
                                        onClick={() => setShowEmpresaModal(true)}
                                    >
                                        <Search size={18} />
                                    </button>
                                }
                            />
                        </FormField>

                        <FormField label="Função" required>
                            <InputWithActions
                                placeholder="Selecione uma função"
                                value={funcao ? funcao.nome : ''}
                                actions={
                                    <button
                                        type="button"
                                        className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600 rounded-md"
                                        onClick={() => setShowFuncaoModal(true)}
                                    >
                                        <Search size={18} />
                                    </button>
                                }
                            />
                        </FormField>

                        <FormField label="Setor" required>
                            <InputWithActions
                                placeholder="Selecione um setor"
                                value={setor ? setor.nome : ''}
                                actions={
                                    <button
                                        type="button"
                                        className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600 rounded-md"
                                        onClick={() => setShowSetorModal(true)}
                                    >
                                        <Search size={18} />
                                    </button>
                                }
                            />
                        </FormField>

                        <FormField label="Matrícula" required>
                            <InputWithStatus
                                value={funcionario.matricula}
                                name="matricula"
                                onChange={handleChange}
                                placeholder="Digite a matrícula"
                                status={funcionario.matricula ? 'valid' : null}
                            />
                        </FormField>

                        <FormField label="Data de Admissão" required>
                            <InputWithStatus
                                type="date"
                                value={funcionario.dataAdmissao || ''}
                                name="dataAdmissao"
                                onChange={handleChange}
                                status={funcionario.dataAdmissao ? 'valid' : null}
                            />
                        </FormField>

                        <FormField label="Status">
                            <select
                                name="status"
                                value={funcionario.status}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ATIVO">Ativo</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                        </FormField>
                    </FormSection>

                    {/* Seção: Dados Pessoais */}
                    <FormSection title="Dados Pessoais">
                        <FormField label="Nome">
                            <InputWithStatus
                                value={funcionario.nome}
                                name="nome"
                                onChange={handleChange}
                                placeholder="Digite o nome"
                            />
                        </FormField>

                        <FormField label="Sobrenome">
                            <InputWithStatus
                                value={funcionario.sobrenome}
                                name="sobrenome"
                                onChange={handleChange}
                                placeholder="Digite o sobrenome"
                            />
                        </FormField>

                        <FormField label="CPF" required>
                            <InputWithStatus
                                value={funcionario.cpf}
                                name="cpf"
                                onChange={handleChange}
                                placeholder="000.000.000-00"
                                status={funcionario.cpf ? 'valid' : null}
                            />
                        </FormField>

                        <FormField label="RG">
                            <InputWithStatus
                                value={funcionario.rg}
                                name="rg"
                                onChange={handleChange}
                                placeholder="Digite o RG"
                            />
                        </FormField>

                        <FormField label="Órgão Emissor">
                            <InputWithStatus
                                value={funcionario.orgaoEmissorRg}
                                name="orgaoEmissorRg"
                                onChange={handleChange}
                                placeholder="Ex: SSP"
                            />
                        </FormField>

                        <FormField label="Estado Emissor">
                            <InputWithStatus
                                value={funcionario.estadoEmissorRg}
                                name="estadoEmissorRg"
                                onChange={handleChange}
                                placeholder="Ex: SP"
                            />
                        </FormField>

                        <FormField label="Data de Emissão">
                            <InputWithStatus
                                type="date"
                                value={funcionario.dataEmissaoRg || ''}
                                name="dataEmissaoRg"
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Data de Nascimento">
                            <InputWithStatus
                                type="date"
                                value={funcionario.dataNascimento || ''}
                                name="dataNascimento"
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Idade">
                            <InputWithStatus
                                value={funcionario.idade}
                                name="idade"
                                onChange={handleChange}
                                placeholder="Idade"
                                disabled={true}
                            />
                        </FormField>

                        <FormField label="Sexo">
                            <select
                                name="sexo"
                                value={funcionario.sexo || 'NAO_INFORMADO'}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="NAO_INFORMADO">Não Informado</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMININO">Feminino</option>
                            </select>
                        </FormField>

                        <FormField label="Estado Civil">
                            <select
                                name="estadoCivil"
                                value={funcionario.estadoCivil || 'SOLTEIRO'}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="SOLTEIRO">Solteiro(a)</option>
                                <option value="CASADO">Casado(a)</option>
                                <option value="DIVORCIADO">Divorciado(a)</option>
                                <option value="VIUVO">Viúvo(a)</option>
                                <option value="SEPARADO">Separado(a)</option>
                                <option value="UNIAO_ESTAVEL">União Estável</option>
                            </select>
                        </FormField>

                        <FormField label="Raça/Cor">
                            <select
                                name="raca"
                                value={funcionario.raca || 'AMARELA'}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="AMARELA">Amarela</option>
                                <option value="BRANCA">Branca</option>
                                <option value="INDIGENA">Indígena</option>
                                <option value="PARDA">Parda</option>
                                <option value="PRETA">Preta</option>
                                <option value="NAO_INFORMADO">Não Informado</option>
                            </select>
                        </FormField>

                        <FormField label="Nome da Mãe">
                            <InputWithStatus
                                value={funcionario.nomeMae}
                                name="nomeMae"
                                onChange={handleChange}
                                placeholder="Nome completo da mãe"
                            />
                        </FormField>

                        <FormField label="Nome do Pai">
                            <InputWithStatus
                                value={funcionario.nomePai}
                                name="nomePai"
                                onChange={handleChange}
                                placeholder="Nome completo do pai"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção: Informações de Contato */}
                    <FormSection title="Informações de Contato">
                        <FormField label="Telefone">
                            <InputWithStatus
                                value={funcionario.telefone}
                                name="telefone"
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                            />
                        </FormField>

                        <FormField label="E-mail">
                            <InputWithStatus
                                type="email"
                                value={funcionario.email}
                                name="email"
                                onChange={handleChange}
                                placeholder="exemplo@email.com"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção: Endereço */}
                    <FormSection title="Endereço">
                        <FormField label="CEP" className="col-span-1">
                            <InputWithStatus
                                value={funcionario.endereco?.cep || ''}
                                name="cep"
                                onChange={handleEnderecoChange}
                                placeholder="00000-000"
                            />
                        </FormField>

                        <FormField label="Logradouro" className="col-span-1 lg:col-span-2">
                            <InputWithStatus
                                value={funcionario.endereco?.logradouro || ''}
                                name="logradouro"
                                onChange={handleEnderecoChange}
                                placeholder="Rua, Avenida, etc."
                            />
                        </FormField>

                        <FormField label="Número">
                            <InputWithStatus
                                value={funcionario.endereco?.numero || ''}
                                name="numero"
                                onChange={handleEnderecoChange}
                                placeholder="Nº"
                            />
                        </FormField>

                        <FormField label="Complemento">
                            <InputWithStatus
                                value={funcionario.endereco?.complemento || ''}
                                name="complemento"
                                onChange={handleEnderecoChange}
                                placeholder="Apto, Bloco, etc."
                            />
                        </FormField>

                        <FormField label="Bairro">
                            <InputWithStatus
                                value={funcionario.endereco?.bairro || ''}
                                name="bairro"
                                onChange={handleEnderecoChange}
                                placeholder="Bairro"
                            />
                        </FormField>

                        <FormField label="Cidade">
                            <InputWithStatus
                                value={funcionario.endereco?.cidade || ''}
                                name="cidade"
                                onChange={handleEnderecoChange}
                                placeholder="Cidade"
                            />
                        </FormField>

                        <FormField label="Estado">
                            <InputWithStatus
                                value={funcionario.endereco?.estado || ''}
                                name="estado"
                                onChange={handleEnderecoChange}
                                placeholder="UF"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção: Observações */}
                    <FormSection title="Observações">
                        <div className="col-span-full">
                            <textarea
                                name="observacoes"
                                value={funcionario.observacoes || ''}
                                onChange={handleChange}
                                placeholder="Observações adicionais sobre o funcionário..."
                                rows={4}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                        </div>
                    </FormSection>

                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={handleVoltar}
                            className="px-6 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                    Salvando...
                                </>
                            ) : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modais de Busca */}
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleSelectEmpresa}
            />

            <FuncaoSearchModal
                isOpen={showFuncaoModal}
                onClose={() => setShowFuncaoModal(false)}
                onSelect={handleSelectFuncao}
            />

            <SetorSearchModal
                isOpen={showSetorModal}
                onClose={() => setShowSetorModal(false)}
                onSelect={handleSelectSetor}
                empresaId={funcionario.empresaId}
                empresa={empresa}
            />
        </div>
    );
}