import {Route} from "react-router-dom";
import ListarPcmso from "../features/medicina/listarPcmso.jsx";
import PcmsoAnalitico from "../features/medicina/pcmsoAnalitico.jsx";

const medicinaRoutes = (
    <>
        <Route path="medicina/pcmso" element={<ListarPcmso />} />
        <Route path="medicina/pcmso-analitico" element={<PcmsoAnalitico />} />
    </>
);

export default medicinaRoutes;