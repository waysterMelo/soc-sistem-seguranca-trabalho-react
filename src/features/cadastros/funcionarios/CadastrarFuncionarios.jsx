import React, {useEffect, useState} from 'react';
import {
    Check,
    HelpCircle, Search, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import funcionariosService from '../../../api/services/cadastros/funcionariosServices.js';
import { useNavigate } from 'react-router-dom';
import EmpresaSearchModal from "../../../components/modal/empresaSearchModal.jsx";
import FuncaoSearchModal from "../../../components/modal/funcaoSearchModal.jsx";

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
export default function CadastrarFuncionario() {
    const navigate = useNavigate();
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
        dataAdmissao: ''
    });
    const [empresa, setEmpresa] = useState(null);
    const [funcao, setFuncao] = useState(null);
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showFuncaoModal, setShowFuncaoModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Calcular idade automaticamente quando a data de nascimento mudar
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

    // Função para formatar telefone
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

    // Função para formatar CEP
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
        }else if (name === 'telefone') {
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

        // Validação dos campos obrigatórios
        if (!funcionario.matricula.trim()) {
            toast.error('Matrícula é obrigatória');
            return;
        }
        if (!funcionario.empresaId) {
            toast.error('Empresa é obrigatória');
            return;
        }
        if (!funcionario.funcaoId) {
            toast.error('Função é obrigatória');
            return;
        }
        if (!funcionario.dataAdmissao) {
            toast.error('Data de admissão é obrigatória');
            return;
        }
        if (!funcionario.cpf.trim()) {
            toast.error('CPF é obrigatório');
            return;
        }

        // Validar se o CPF está no formato correto
        const cpfFormatado = funcionario.cpf.trim();
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

        if (!cpfRegex.test(cpfFormatado)) {
            toast.error('CPF deve estar no formato XXX.XXX.XXX-XX');
            return;
        }

        console.log('Dados antes do envio:', JSON.stringify(funcionario, null, 2));

        try {
            setLoading(true);

            // Criar objeto limpo para envio
            const funcionarioParaEnviar = {
                nome: funcionario.nome?.trim() || '',
                sobrenome: funcionario.sobrenome?.trim() || '',
                cpf: cpfFormatado, // Manter formatação do CPF
                rg: funcionario.rg?.trim() || '',
                dataEmissaoRg: funcionario.dataEmissaoRg || null,
                estadoEmissorRg: funcionario.estadoEmissorRg || '',
                orgaoEmissorRg: funcionario.orgaoEmissorRg || '',
                dataNascimento: funcionario.dataNascimento || null,
                idade: funcionario.idade ? parseInt(funcionario.idade) : null,
                sexo: funcionario.sexo || 'NAO_INFORMADO',
                estadoCivil: funcionario.estadoCivil || 'SOLTEIRO',
                raca: funcionario.raca || 'NAO_INFORMADO',
                nomeMae: funcionario.nomeMae?.trim() || '',
                nomePai: funcionario.nomePai?.trim() || '',
                telefone: funcionario.telefone?.replace(/\D/g, '') || '', // Remove formatação do telefone
                email: funcionario.email?.trim() || '',
                matricula: funcionario.matricula?.trim() || '',
                dataAdmissao: funcionario.dataAdmissao || null,
                status: funcionario.status || 'ATIVO',
                observacoes: funcionario.observacoes?.trim() || '',
                empresaId: funcionario.empresaId ? parseInt(funcionario.empresaId) : null,
                funcaoId: funcionario.funcaoId ? parseInt(funcionario.funcaoId) : null,
                // Endereço como objeto
                endereco: {
                    logradouro: funcionario.endereco?.logradouro?.trim() || '',
                    numero: funcionario.endereco?.numero?.trim() || '',
                    complemento: funcionario.endereco?.complemento?.trim() || '',
                    bairro: funcionario.endereco?.bairro?.trim() || '',
                    cidade: funcionario.endereco?.cidade?.trim() || '',
                    estado: funcionario.endereco?.estado || '',
                    cep: funcionario.endereco?.cep?.replace(/\D/g, '') || '' // Remove formatação do CEP
                }
            };

            console.log('Dados formatados para envio:', JSON.stringify(funcionarioParaEnviar, null, 2));

            const response = await funcionariosService.create(funcionarioParaEnviar);
            console.log('Resposta do servidor:', response);

            setSuccess(true);
            toast.success('Funcionário cadastrado com sucesso!');

            setTimeout(() => {
                navigate('/cadastros/listar/funcionarios');
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            console.error('Resposta do erro:', error.response?.data);

            if (error.response?.data?.message) {
                toast.error(`Erro: ${error.response.data.message}`);
            } else if (error.response?.status === 400) {
                // Tratar erros de validação
                const validationErrors = error.response?.data?.errors || {};
                const firstError = Object.values(validationErrors)[0];
                if (firstError) {
                    toast.error(`Erro de validação: ${firstError}`);
                } else {
                    toast.error('Dados inválidos. Verifique os campos e tente novamente.');
                }
            } else {
                toast.error('Erro ao cadastrar funcionário. Verifique os dados e tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/cadastros/listar/funcionarios');
    };

    const estados = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    const formatarCpf = (valor) => {
        if (!valor) return '';
        const apenasNumeros = valor.replace(/\D/g, '');
        const cpfLimitado = apenasNumeros.slice(0, 11);
        return cpfLimitado
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const handleSelectEmpresa = (selectedEmpresa) => {
        console.log('Empresa selecionada:', selectedEmpresa);
        setEmpresa(selectedEmpresa);
        setFuncionario(prev => ({
            ...prev, 
            empresaId: selectedEmpresa.id
        }));
        setShowEmpresaModal(false);

        if (errors.empresaId) {
            setErrors(prev => {
                const newErros = {...prev};
                delete newErros.empresaId;
                return newErros;
            });
        }
    };

    const handleSelectFuncao = (selectedFuncao) => {
        console.log('Função selecionada:', selectedFuncao);
        
        if (!selectedFuncao || !selectedFuncao.id) {
            console.error('Função selecionada não possui ID!', selectedFuncao);
            toast.error('Erro ao selecionar função. ID não encontrado.');
            return;
        }
        
        setFuncao(selectedFuncao);
        setFuncionario(prev => ({
            ...prev, 
            funcaoId: selectedFuncao.id
        }));
        setShowFuncaoModal(false);
        
        if (errors.funcaoId) {
            setErrors(prev => {
                const newErros = {...prev};
                delete newErros.funcaoId;
                return newErros;
            });
        }
    };

    const limparEmpresa = () => {
        setEmpresa(null);
        setFuncionario(prev => ({
            ...prev,
            empresaId: null
        }));
    };

    const limparFuncao = () => {
        setFuncao(null);
        setFuncionario(prev => ({
            ...prev,
            funcaoId: null
        }));
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Cadastrar Funcionário</h1>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Seção Informações Básicas */}
                    <FormSection title="Informações Pessoais">
                        <FormField label="Nome" required>
                            <InputWithStatus
                                value={funcionario.nome}
                                name="nome"
                                onChange={handleChange}
                                placeholder="Digite o nome"
                            />
                        </FormField>

                        <FormField label="Sobrenome" required>
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

                        <FormField label="Órgão Emissor RG">
                            <InputWithStatus
                                value={funcionario.orgaoEmissorRg}
                                name="orgaoEmissorRg"
                                onChange={handleChange}
                                placeholder="Ex: SSP"
                            />
                        </FormField>

                        <FormField label="Estado Emissor RG">
                            <select
                                name="estadoEmissorRg"
                                value={funcionario.estadoEmissorRg}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione o estado</option>
                                {estados.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Data Emissão RG">
                            <InputWithStatus
                                type="date"
                                value={funcionario.dataEmissaoRg}
                                name="dataEmissaoRg"
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Data de Nascimento">
                            <InputWithStatus
                                type="date"
                                value={funcionario.dataNascimento}
                                name="dataNascimento"
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Idade">
                            <InputWithStatus
                                value={funcionario.idade}
                                name="idade"
                                placeholder="Calculado automaticamente"
                                readOnly
                            />
                        </FormField>

                        <FormField label="Sexo">
                            <select
                                name="sexo"
                                value={funcionario.sexo}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="NAO_INFORMADO">Não Informado</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMININO">Feminino</option>
                            </select>
                        </FormField>

                        <FormField label="Raça">
                            <select
                                name="raca"
                                value={funcionario.raca}
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

                        <FormField label="Estado Civil">
                            <select
                                name="estadoCivil"
                                value={funcionario.estadoCivil}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="SOLTEIRO">Solteiro(a)</option>
                                <option value="CASADO">Casado(a)</option>
                                <option value="DIVORCIADO">Divorciado(a)</option>
                                <option value="VIUVO">Viúvo(a)</option>
                                <option value="SEPARADO">Separado(a)</option>
                            </select>
                        </FormField>

                        <FormField label="Nome da Mãe">
                            <InputWithStatus
                                value={funcionario.nomeMae}
                                name="nomeMae"
                                onChange={handleChange}
                                placeholder="Digite o nome da mãe"
                            />
                        </FormField>

                        <FormField label="Nome do Pai">
                            <InputWithStatus
                                value={funcionario.nomePai}
                                name="nomePai"
                                onChange={handleChange}
                                placeholder="Digite o nome do pai"
                            />
                        </FormField>

                        <FormField label="Telefone">
                            <InputWithStatus
                                value={funcionario.telefone}
                                name="telefone"
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                            />
                        </FormField>

                        <FormField label="Email">
                            <InputWithStatus
                                type="email"
                                value={funcionario.email}
                                name="email"
                                onChange={handleChange}
                                placeholder="email@exemplo.com"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção Endereço */}
                    <FormSection title="Endereço">
                        <FormField label="CEP">
                            <InputWithStatus
                                value={funcionario.endereco.cep}
                                name="cep"
                                onChange={handleEnderecoChange}
                                placeholder="00000-000"
                            />
                        </FormField>

                        <FormField label="Logradouro" className="col-span-2">
                            <InputWithStatus
                                value={funcionario.endereco.logradouro}
                                name="logradouro"
                                onChange={handleEnderecoChange}
                                placeholder="Digite o logradouro"
                            />
                        </FormField>

                        <FormField label="Número">
                            <InputWithStatus
                                value={funcionario.endereco.numero}
                                name="numero"
                                onChange={handleEnderecoChange}
                                placeholder="Nº"
                            />
                        </FormField>

                        <FormField label="Complemento">
                            <InputWithStatus
                                value={funcionario.endereco.complemento}
                                name="complemento"
                                onChange={handleEnderecoChange}
                                placeholder="Apto, Bloco, etc."
                            />
                        </FormField>

                        <FormField label="Bairro">
                            <InputWithStatus
                                value={funcionario.endereco.bairro}
                                name="bairro"
                                onChange={handleEnderecoChange}
                                placeholder="Digite o bairro"
                            />
                        </FormField>

                        <FormField label="Cidade">
                            <InputWithStatus
                                value={funcionario.endereco.cidade}
                                name="cidade"
                                onChange={handleEnderecoChange}
                                placeholder="Digite a cidade"
                            />
                        </FormField>

                        <FormField label="Estado">
                            <select
                                name="estado"
                                value={funcionario.endereco.estado}
                                onChange={handleEnderecoChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione</option>
                                {estados.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </FormField>
                    </FormSection>

                    {/* Seção Informações Profissionais */}
                    <FormSection title="Informações Profissionais">
                        <FormField label="Matrícula" required>
                            <InputWithStatus
                                value={funcionario.matricula}
                                name="matricula"
                                onChange={handleChange}
                                placeholder="Digite a matrícula"
                            />
                        </FormField>

                        <FormField label="Data de Admissão" required>
                            <InputWithStatus
                                type="date"
                                value={funcionario.dataAdmissao}
                                name="dataAdmissao"
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Empresa" required className="col-span-2">
                            <InputWithActions
                                placeholder="Selecione uma empresa"
                                value={empresa ? empresa.razaoSocial || empresa.nome : ''}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmpresaModal(true)}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-l-md border-r border-green-600"
                                        >
                                            <Search size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={limparEmpresa}
                                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                }
                            />
                        </FormField>

                        <FormField label="Função" required className="col-span-2">
                            <InputWithActions
                                placeholder="Selecione uma função"
                                value={funcao ? funcao.nome : ''}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowFuncaoModal(true)}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-l-md border-r border-green-600"
                                        >
                                            <Search size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={limparFuncao}
                                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                }
                            />
                        </FormField>

                        <FormField label="Status" className="col-span-1">
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

                    {/* Seção Observações */}
                    <FormSection title="Observações">
                        <FormField label="Observações" className="col-span-full">
                            <textarea
                                name="observacoes"
                                value={funcionario.observacoes}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Digite observações adicionais..."
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                    </FormSection>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="bg-red-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>

                {/* Modais */}
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

                {/* Mensagem de Sucesso */}
                {success && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="flex items-center space-x-3 text-green-600 mb-4">
                                <Check size={24} />
                                <h3 className="text-lg font-semibold">Sucesso!</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Funcionário cadastrado com sucesso!</p>
                            <p className="text-sm text-gray-500">Redirecionando...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}