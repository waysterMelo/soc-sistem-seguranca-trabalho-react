import {Route, Routes} from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import CadastrosRoutes from "./routes/cadastrosRoutes.jsx";
import SegurancaRoutes from "./routes/segurancaRoutes.jsx";
import MediciasRoutes from "./routes/medicinaRoutes.jsx";
import {ToastContainer} from "react-toastify";


function NotFound() {
    return <div className="p-6 text-center"><h2>404 - Página Não Encontrada</h2></div>;
}

function App() {
    return (
        <>
            <ToastContainer position="top-right" newestOnTop />
            <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                {CadastrosRoutes}
                {SegurancaRoutes}
                {MediciasRoutes}
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
        </>
    );
}

export default App;