import { Route } from 'react-router-dom';
import ListarPGR from "../features/seguranca/ListarPGR.jsx";
import NovoPgr from "../features/seguranca/NovoPgr.jsx";
import ListarLTCAT from "../features/seguranca/ListarLTCAT.jsx";
import CadastrarLTCAT from "../features/seguranca/CadastrarLTCAT.jsx";
import ListarLTIP from "../features/seguranca/ListarLtip.jsx";
import CadastrarLTIP from "../features/seguranca/CadastrarLtip.jsx";
import CadastrarCAT from "../features/seguranca/CadastrarCAT.jsx";
import ListarCAT from "../features/seguranca/ListarCAT.jsx";
import ListarTreinamentos from "../features/seguranca/ListarTreinamentos.jsx";
import CadastrarTreinamento from "../features/seguranca/CadastrarTreinamento.jsx";
import MovimentacaoEPI from "../features/seguranca/MovimentacaoEPI.jsx";
import ListarOrdemServico from "../features/seguranca/OrdemDeServico.jsx";
import CriarOrdemDeServico from "../features/seguranca/CriarOrdemServico.jsx";

const SegurancaRoutes = (
    <>
        <Route path="seguranca/pgr" element={<ListarPGR />}/>
        <Route path="seguranca/novo-pgr" element={<NovoPgr />} />
        <Route path="seguranca/ltcat" element={<ListarLTCAT />} />
        <Route path="seguranca/novo-ltcat" element={<CadastrarLTCAT />} />
        <Route path="seguranca/ltip" element={<ListarLTIP />} />
        <Route path="seguranca/novo-ltip" element={<CadastrarLTIP />} />
        <Route path="seguranca/cat" element={<ListarCAT />} />
        <Route path="seguranca/novo-cat" element={<CadastrarCAT />} />
        <Route path="seguranca/treinamentos" element={<ListarTreinamentos />} />
        <Route path="seguranca/novo-treinamento" element={<CadastrarTreinamento />} />
        <Route path="seguranca/epi" element={<MovimentacaoEPI />} />
        <Route path="seguranca/listar/ordem-servico" element={<ListarOrdemServico />} />
        <Route path="seguranca/nova-ordem" element={<CriarOrdemDeServico />} />
    </>
);

export default SegurancaRoutes;