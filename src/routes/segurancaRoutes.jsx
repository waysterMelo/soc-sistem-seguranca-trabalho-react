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
import ListarOrdemServico from "../features/seguranca/OrdemDeServico.jsx";
import CriarOrdemDeServico from "../features/seguranca/CriarOrdemServico.jsx";
import EditarPgr from "../features/seguranca/EditarPgr.jsx";
import CadastrarLtip from "../features/seguranca/CadastrarLtip.jsx";


const SegurancaRoutes = (
    <>
        <Route path="seguranca/pgr" element={<ListarPGR />}/>
        <Route path="seguranca/novo-pgr" element={<NovoPgr />} />
        <Route path="seguranca/editar-pgr/:id" element={<EditarPgr />} />

        <Route path="seguranca/ltcat" element={<ListarLTCAT />} />
        <Route path="seguranca/novo-ltcat" element={<CadastrarLTCAT />} />
        <Route path="/seguranca/ltcat/editar/:id" element={<CadastrarLTCAT />} />

        <Route path="seguranca/ltip" element={<ListarLTIP />} />
        <Route path="seguranca/novo-ltip" element={<CadastrarLTIP />} />
        <Route path="/seguranca/ltip/editar/:id" element={<CadastrarLtip />} />

        <Route path="seguranca/cat" element={<ListarCAT />} />
        <Route path="seguranca/novo-cat" element={<CadastrarCAT />} />
        <Route path="seguranca/editar-cat/:id" element={<CadastrarCAT />} />
        
        <Route path="seguranca/treinamentos" element={<ListarTreinamentos />} />
        <Route path="seguranca/novo-treinamento" element={<CadastrarTreinamento />} />
        <Route path="seguranca/listar/ordem-servico" element={<ListarOrdemServico />} />
        <Route path="seguranca/nova-ordem" element={<CriarOrdemDeServico />} />
    </>
);

export default SegurancaRoutes;