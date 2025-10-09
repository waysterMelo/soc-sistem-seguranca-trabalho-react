import {Route, Routes, Navigate, Outlet} from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import CadastrosRoutes from "./routes/cadastrosRoutes.jsx";
import SegurancaRoutes from "./routes/segurancaRoutes.jsx";
import MediciasRoutes from "./routes/medicinaRoutes.jsx";
import configuracoesRoutes from "./routes/configuracoesRoutes.jsx";
import {ToastContainer} from "react-toastify";
import LoginPage from './features/auth/LoginPage.jsx';
import authService from './api/services/auth/authService.js';


function NotFound() {
    return <div className="p-6 text-center"><h2>404 - Página Não Encontrada</h2></div>;
}

const ProtectedRoute = () => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};


function App() {
    return (
        <>
            <ToastContainer position="top-right" newestOnTop />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<DashboardPage />} />
                        {CadastrosRoutes}
                        {SegurancaRoutes}
                        {MediciasRoutes}
                        {configuracoesRoutes}
                    </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;