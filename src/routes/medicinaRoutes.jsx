import {Route} from "react-router-dom";
import ListarPcmso from "../features/medicina/listarPcmso.jsx";
import PcmsoAnalitico from "../features/medicina/pcmsoAnalitico.jsx";
import EspirometriaApp from "../features/medicina/EspirometriaApp.jsx";
import AsoApp from "../features/medicina/aso.jsx";
import AfastamentoApp from "../features/medicina/afastamento.jsx";
import ExameToxicologicoApp from "../features/medicina/toxicológico.jsx";
import AcuidadeVisualApp from "../features/medicina/acuidadeVisual.jsx";

const medicinaRoutes = (
    <>
        <Route path="medicina/pcmso" element={<ListarPcmso />} />
        <Route path="medicina/pcmso-analitico" element={<PcmsoAnalitico />} />
        <Route path="medicina/espirometria" element={<EspirometriaApp />} />
        <Route path="medicina/aso" element={<AsoApp />} />
        <Route path="medicina/afastamento" element={<AfastamentoApp />} />
        <Route path="medicina/toxicológico" element={<ExameToxicologicoApp />} />
        <Route path="medicina/acuidade-visual" element={<AcuidadeVisualApp />} />
    </>
);

export default medicinaRoutes;