import React, {useEffect, useState} from 'react';
import {
    Check,
    HelpCircle, Search, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import funcionariosService from '../../../api/services/cadastros/funcionariosServices.js';
import { useNavigate } from 'react-router-dom';
import EmpresaSearchModal from "../../../components/modal/empresaSearchModal.jsx";

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
        matricula: '', // Campo obrigatório
        empresaId: '', // Campo obrigatório
        dataAdmissao: '' // Campo obrigatório
    });
    const [empresa, setEmpresa] = useState(null);
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
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
            // Formato (XX) XXXX-XXXX
            return telefoneLimitado
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            // Formato (XX) XXXXX-XXXX
            return telefoneLimitado
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
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
        if (!funcionario.dataAdmissao) {
            toast.error('Data de admissão é obrigatória');
            return;
        }
        if (!funcionario.cpf.trim()) {
            toast.error('CPF é obrigatório');
            return;
        }

        // Garantir que o CPF esteja formatado corretamente
        const cpfFormatado = formatarCpf(funcionario.cpf);

        // Garantir que o telefone esteja formatado corretamente
        const telefoneFormatado = formatarTelefone(funcionario.telefone);


        // Garantir que o endereço não seja nulo
        const enderecoParaEnviar = funcionario.endereco || {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
        };

        try {
            const funcionarioParaEnviar = {
                ...funcionario,
                cpf: cpfFormatado,
                telefone: telefoneFormatado,
                endereco: enderecoParaEnviar
            };
            setLoading(true);
            await funcionariosService.create(funcionarioParaEnviar);
            setSuccess(true);
            setTimeout(() => {
                navigate('/cadastros/listar/funcionarios');
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            toast.error('Erro ao cadastrar funcionário. Verifique os dados e tente novamente.');
        }finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/cadastros/listar/funcionarios');
    };

    const estados = [
        'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará',
        'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão',
        'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará',
        'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro',
        'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
        'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
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

    const handleEnderecoChange = (e) => {
        const { name, value } = e.target;
        setFuncionario(prev => ({
            ...prev,
            endereco: {
                ...prev.endereco,
                [name]: value
            }
        }));
    };

    const handleSelectEmpresa = (selectedEmpresa) => {
        setEmpresa(selectedEmpresa);
        setFuncionario(prev => ({
            ...prev, empresaId: selectedEmpresa.id
        }));
        setShowEmpresaModal(false);

        if (errors.empresaId){
            setErrors(prev => {
                const newErros = {...prev};
                delete newErros.empresa.id;
                return newErros;
            })
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-8 font-sans">
            <div className="container mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Cadastrar Funcionário</h1>
                </header>
                <form onSubmit={handleSubmit}>
                    {/* Seção Informações Básicas */}
                    <FormSection title="Informações Básicas">
                        <FormField label="Nome" required className="xl:col-span-2">
                            <InputWithStatus
                                value={funcionario.nome}
                                status="valid"
                                name="nome"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Sobrenome" required className="xl:col-span-2">
                            <InputWithStatus
                                value={funcionario.sobrenome}
                                status="valid"
                                name="sobrenome"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Status" required>
                            <select
                                value={funcionario.status}
                                name="status"
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ATIVO">ATIVO</option>
                                <option value="INATIVO">INATIVO</option>
                                <option value="AFASTADO">AFASTADO</option>
                            </select>
                        </FormField>

                        <FormField label="CPF" required>
                            <input
                                type="text"
                                name="cpf"
                                value={funcionario.cpf || ''}
                                onChange={handleChange}
                                placeholder="000.000.000-00"
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Número do RG">
                            <input
                                type="text"
                                placeholder="Ex: MG-12.345.678"
                                name="rg"
                                value={funcionario.rg || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Orgão Emissor">
                            <input
                                type="text"
                                name="orgaoEmissorRg"
                                value={funcionario.orgaoEmissorRg || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Data Emissão">
                            <input
                                type="date"
                                name="dataEmissaoRg"
                                value={funcionario.dataEmissaoRg || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Estado Emissor">
                            <select
                                name="estadoEmissorRg"
                                value={funcionario.estadoEmissorRg || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione o Estado</option>
                                {estados.map((estado) => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Raça">
                            <select
                                value={funcionario.raca}
                                name="raca"
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="AMARELA">Amarela</option>
                                <option value="BRANCA">Branca</option>
                                <option value="PRETA">Preta</option>
                                <option value="PARDA">Parda</option>
                                <option value="INDIGENA">Indígena</option>
                            </select>
                        </FormField>
                        <FormField label="Sexo">
                            <select
                                value={funcionario.sexo}
                                name="sexo"
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="NAO_INFORMADO">NÃO INFORMADO</option>
                                <option value="MASCULINO">MASCULINO</option>
                                <option value="FEMININO">FEMININO</option>
                                <option value="OUTRO">OUTRO</option>
                            </select>
                        </FormField>
                        <FormField label="Estado Civil">
                            <select
                                value={funcionario.estadoCivil}
                                name="estadoCivil"
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="SOLTEIRO">Solteiro(a)</option>
                                <option value="CASADO">Casado(a)</option>
                                <option value="DIVORCIADO">Divorciado(a)</option>
                                <option value="VIUVO">Viúvo(a)</option>
                            </select>
                        </FormField>
                        <FormField label="Data de Nascimento">
                            <input
                                type="date"
                                name="dataNascimento"
                                value={funcionario.dataNascimento || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Idade">
                            <input
                                type="number"
                                name={"idade"}
                                value={funcionario.idade || ''}
                                readOnly={true}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-slate-100"
                            />
                        </FormField>
                        <FormField label="Nome da Mãe" className="xl:col-span-2">
                            <input
                                type="text"
                                name="nomeMae"
                                value={funcionario.nomeMae || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Nome do Pai" className="xl:col-span-3">
                            <input
                                type="text"
                                name="nomePai"
                                value={funcionario.nomePai || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção Informações Profissionais */}
                    <FormSection title="Informações Profissionais">
                        <FormField label="Selecione a Empresa ao qual o setor irá pertencer" required className="lg:col-span-2" error={errors.empresaId}>
                            <InputWithActions
                                placeholder="Nenhuma Empresa selecionada"
                                value={empresa ? empresa.razaoSocial : ''}
                                actions={
                                    <>
                                        <button
                                            onClick={() => setShowEmpresaModal(true)}
                                            type="button"
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={() => {
                                                setEmpresa(null);
                                                setFuncionario(prev => ({ ...prev, empresaId: null }));
                                            }}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </FormField>
                        <FormField label="Matrícula" required>
                            <input
                                type="text"
                                name="matricula"
                                value={funcionario.matricula || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Data de Admissão" required>
                            <input
                                type="date"
                                name="dataAdmissao"
                                value={funcionario.dataAdmissao || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção Endereço */}
                    <FormSection title="Endereço">
                        <FormField label="CEP" required>
                            <input
                                type="text"
                                name="cep"
                                value={funcionario.endereco?.cep || ''}
                                onChange={handleEnderecoChange}
                                placeholder="00000-000"
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Cidade" required>
                            <input
                                type="text"
                                name="cidade"
                                value={funcionario.endereco?.cidade || ''}
                                onChange={handleEnderecoChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Estado" className="xl:col-span-2">
                            <select
                                name="estado"
                                value={funcionario.endereco?.estado || ''}
                                onChange={handleEnderecoChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione o Estado</option>
                                {estados.map((estado) => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Logradouro">
                            <input
                                type="text"
                                name="logradouro"
                                value={funcionario.endereco?.logradouro || ''}
                                onChange={handleEnderecoChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Número" >
                            <input
                                type="text"
                                name="numero"
                                value={funcionario.endereco?.numero || ''}
                                onChange={handleEnderecoChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Bairro" required>
                            <input
                                type="text"
                                name="bairro"
                                value={funcionario.endereco?.bairro || ''}
                                onChange={handleEnderecoChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Complemento">
                            <input
                                type="text"
                                name="complemento"
                                value={funcionario.endereco?.complemento || ''}
                                onChange={handleEnderecoChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção Informações de Contato */}
                    <FormSection title="Informações de Contato">
                        <FormField label="Número telefone" className="xl:col-span-1">
                            <input
                                type="text"
                                name="telefone"
                                value={funcionario.telefone || ''}
                                onChange={handleChange}
                                placeholder="(XX) XXXXX-XXXX"
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Endereço de E-mail" className="xl:col-span-5">
                            <input
                                type="email"
                                name="email"
                                value={funcionario.email || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção Outras Informações */}
                    <FormSection title="Outras Informações">
                        <FormField label="Observações" className="xl:col-span-5">
                            <textarea
                                rows="3"
                                name="observacoes"
                                value={funcionario.observacoes || ''}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </FormField>
                    </FormSection>

                    {/* Botões de Ação */}
                    <div className="pt-6 mt-2 flex flex-col items-center">
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full sm:w-auto bg-white border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Salvando...' : 'Salvar e Sair'}
                            </button>

                        </div>
                    </div>
                </form>
            </div>
            {/* Feedback de sucesso */}
            {success && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                            <div className="text-green-600 text-6xl mb-4">✓</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Funcionário salvo com sucesso!</h3>
                            <p className="text-gray-600">Redirecionando...</p>
                        </div>
                    </div>
                </div>
            )}
            <EmpresaSearchModal
            isOpen={showEmpresaModal}
            onClose={() => setShowEmpresaModal(false)}
            onSelect={handleSelectEmpresa}
            />

        </div>

    );
}