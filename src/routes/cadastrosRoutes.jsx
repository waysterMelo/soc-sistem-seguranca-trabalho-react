import { Route } from 'react-router-dom';
import EmpresaListPage from "../features/cadastros/empresa/EmpresaListPage.jsx";
import CadastrarEmpresa from "../features/cadastros/empresa/CadastrarEmpresa.jsx";
import ListarUnidades from "../features/cadastros/empresa/ListarUnidades.jsx";
import CadastrarUnidade from "../features/cadastros/empresa/CadastrarUnidade.jsx";
import ListarSetores from "../features/cadastros/empresa/ListarSetores.jsx";
import CadastrarSetor from "../features/cadastros/empresa/CadastrarSetor.jsx";
import ListarFuncoes from "../features/cadastros/funcao/ListarFuncoes.jsx";
import CadastrarFuncao from "../features/cadastros/funcao/CadastrarFuncao.jsx";
import ListarFuncionarios from "../features/cadastros/funcionarios/ListarFuncionarios.jsx";
import CadastrarFuncionario from "../features/cadastros/funcionarios/CadastrarFuncionarios.jsx";
import ListarPrestadores from "../features/cadastros/Prestador/ListarPrestadorServicos.jsx";
import CadastrarPrestador from "../features/cadastros/Prestador/CadastrarPrestador.jsx";
import ListarEpiEpc from "../features/cadastros/Epi/ListarEpi.jsx";
import CadastrarEquipamento from "../features/cadastros/Epi/CadastrarEpi.jsx";
import ListarAparelhos from "../features/cadastros/aparelho/ListarAparelhos.jsx";
import EditarEmpresa from "../features/cadastros/empresa/EditarEmpresa.jsx";
import EditarUnidade from "../features/cadastros/empresa/EditarUnidade.jsx";
import EditarFuncionario from "../features/cadastros/funcionarios/EditarFuncionario.jsx";
import EditarFuncao from "../features/cadastros/funcao/EditarFuncao.jsx";
import EditarPrestador from "../features/cadastros/Prestador/EditarPrestadorModal.jsx";
import EditarAparelho from '../features/cadastros/aparelho/EditarAparelho.jsx';

const CadastrosRoutes = (
    <>
        <Route path="cadastros/listar/empresas" element={<EmpresaListPage />} />
        <Route path="cadastros/nova-empresa" element={<CadastrarEmpresa />} />
        <Route path="/cadastros/editar-empresa/:id" element={<EditarEmpresa />} />
        <Route path="cadastros/listar/unidades" element={<ListarUnidades />} />
        <Route path="/cadastros/editar-unidade/:id" element={<EditarUnidade />} />
        <Route path="cadastros/nova-unidade" element={<CadastrarUnidade />} />
        <Route path="cadastros/listar/setores" element={<ListarSetores />} />
        <Route path="cadastros/novo-setor" element={<CadastrarSetor />} />
        <Route path="cadastros/listar/funcao" element={<ListarFuncoes />} />
        <Route path="cadastros/funcao" element={<CadastrarFuncao />} />
        <Route path="cadastros/listar/funcionarios" element={<ListarFuncionarios />} />
        <Route path="cadastros/novo-funcionario" element={<CadastrarFuncionario />} />
        <Route path="cadastros/prestador-servico" element={<ListarPrestadores />} />
        <Route path="cadastros/editar-prestador/:id" element={<EditarPrestador />} />
        <Route path="cadastros/novo-prestador" element={<CadastrarPrestador />} />
        <Route path="cadastros/epi-epc" element={<ListarEpiEpc />} />
        <Route path="cadastros/novo-epi" element={<CadastrarEquipamento />} />
        <Route path="cadastros/aparelhos" element={<ListarAparelhos />} />
        <Route path="cadastros/editar-funcionario/:id" element={<EditarFuncionario />} />
        <Route path="cadastros/editar/funcao/:id" element={<EditarFuncao />} />
        <Route path="/cadastros/aparelhos" element={<ListarAparelhos />} />
        <Route path="/cadastros/editar-aparelho/:id" element={<EditarAparelho />} />
    </>
);

export default CadastrosRoutes;