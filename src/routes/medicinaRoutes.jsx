import {Route} from "react-router-dom";
import ListarPcmso from "../features/medicina/listarPcmso.jsx";
import CadastrarPcmso from "../features/medicina/CadastrarPcmso.jsx";
import CadastrarEspirometria from "../features/medicina/CadastrarEspirometria.jsx";
import ListarEspirometria from "../features/medicina/ListarEspirometria.jsx";
import ListarAso from "../features/medicina/ListarAso.jsx";
import CadastrarAso from "../features/medicina/CadastrarAso.jsx";
import CadastrarAfastamento from "../features/medicina/CadastrarAfastamento.jsx";
import ListarAfastamento from "../features/medicina/ListarAfastamento.jsx";

const medicinaRoutes = (
    <>
        <Route path="medicina/pcmso" element={<ListarPcmso />} />
        <Route path="medicina/pcmso/novo" element={<CadastrarPcmso />} />
        <Route path="medicina/editar-pcmso/:id" element={<CadastrarPcmso />} />

        <Route path="medicina/espirometria" element={<ListarEspirometria />} />
        <Route path="medicina/cadastrar-espirometria" element={<CadastrarEspirometria />} />
        <Route path="medicina/editar-espirometria/:id" element={<CadastrarEspirometria />} />

        <Route path="medicina/aso" element={<ListarAso />} />
        <Route path="medicina/cadastrar-aso" element={<CadastrarAso />} />
        <Route path="medicina/editar-aso/:id" element={<CadastrarAso />} />

        <Route path="medicina/cadastrar-afastamento" element={<CadastrarAfastamento />} />
        <Route path="medicina/afastamentos" element={<ListarAfastamento />} />
        <Route path="medicina/editar-afastamento/:id" element={<CadastrarAfastamento />} />
  
    </>
);

export default medicinaRoutes;