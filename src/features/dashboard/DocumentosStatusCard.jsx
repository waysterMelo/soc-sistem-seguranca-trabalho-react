// src/features/dashboard/DocumentosStatusCard.jsx
import React, { useState, useEffect } from 'react';
import dashboardService from '../../api/services/dashboardService';
import { toast } from 'react-toastify';

const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        'Válido': 'bg-green-100 text-green-700',
        'Atenção': 'bg-yellow-100 text-yellow-700',
        'Vencido': 'bg-red-100 text-red-700',
    };
    return <span className={`${styles[status] || 'bg-gray-100 text-gray-700'} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>{status}</span>;
};

export default function DocumentosStatusCard() {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getDocumentosStatus({ limit: 3 });
                if (Array.isArray(response.data)) {
                    setDocumentos(response.data);
                }
            } catch (error) {
                toast.error('Não foi possível carregar o status dos documentos.', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <DashboardCard title="Vencimento de Documento">
            {loading ? (
                <div className="text-center text-gray-500 py-10">Carregando...</div>
            ) : (
                <>
                    <div className="space-y-4">
                        {documentos.length > 0 ? documentos.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{doc.tipo}</p>
                                    <p className="text-sm text-gray-500">{doc.responsavel}</p>
                                </div>
                                <StatusBadge status={doc.status} />
                            </div>
                        )) : <div className="text-center text-gray-500 py-10">Nenhum documento para exibir.</div>}
                    </div>
                    <div className="text-right mt-4">
                        <a href="#" className="text-sm text-green-600 hover:underline font-medium">ver todos os documentos</a>
                    </div>
                </>
            )}
        </DashboardCard>
    );
}
