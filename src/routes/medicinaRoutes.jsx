import {Route} from "react-router-dom";
import ListarPcmso from "../features/medicina/listarPcmso.jsx";
import PcmsoAnalitico from "../features/medicina/pcmsoAnalitico.jsx";
import AsoApp from "../features/medicina/aso.jsx";
import AfastamentoApp from "../features/medicina/afastamento.jsx";
import ExameToxicologicoApp from "../features/medicina/toxicológico.jsx";
import AcuidadeVisualApp from "../features/medicina/acuidadeVisual.jsx";
import CadastrarPcmso from "../features/medicina/CadastrarPcmso.jsx";
import CadastrarEspirometria from "../features/medicina/CadastrarEspirometria.jsx";
import ListarEspirometria from "../features/medicina/ListarEspirometria.jsx";

const medicinaRoutes = (
    <>
        <Route path="medicina/pcmso" element={<ListarPcmso />} />
        <Route path="medicina/pcmso/novo" element={<CadastrarPcmso />} />
        <Route path="medicina/editar-pcmso/:id" element={<CadastrarPcmso />} />

        <Route path="medicina/espirometria" element={<ListarEspirometria />} />
        <Route path="medicina/cadastrar-espirometria" element={<CadastrarEspirometria />} />
        <Route path="medicina/editar-espirometria/:id" element={<CadastrarEspirometria />} />


        <Route path="medicina/aso" element={<AsoApp />} />
        <Route path="medicina/afastamento" element={<AfastamentoApp />} />
        <Route path="medicina/toxicológico" element={<ExameToxicologicoApp />} />
        <Route path="medicina/acuidade-visual" element={<AcuidadeVisualApp />} />
    </>
);

export default medicinaRoutes;