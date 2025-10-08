import React, { useState, useEffect } from 'react';
import asoService from '../../api/services/aso/asoService';
import { toast } from 'react-toastify';
import { Calendar, User, AlertTriangle } from 'lucide-react';

// Componente de Card Genérico do Dashboard
const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

export default function ProximosExamesCard() {
    const [exames, setExames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExames = async () => {
            try {
                const response = await asoService.getProximosVencimentos();
                if (Array.isArray(response)) {
                    setExames(response);
                }
            } catch (error) {
                toast.error('Não foi possível carregar os próximos exames.');
            } finally {
                setLoading(false);
            }
        };
        fetchExames();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    return (
        <DashboardCard title="Próximos Exames Periódicos (ASO)">
            {loading ? (
                <div className="text-center text-gray-500 py-10">Carregando...</div>
            ) : exames.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Nenhum exame vencendo nos próximos 30 dias.</div>
            ) : (
                <div className="space-y-4">
                    {exames.map(exame => (
                        <div key={exame.id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium flex items-center gap-2"><User size={14} /> {exame.funcionarioNome}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={14} /> Vence em: {formatDate(exame.dataVencimento)}</p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Atenção
                            </span>
                        </div>
                    ))}
                </div>
            )}
            <div className="text-right mt-4">
                <a href="#" className="text-sm text-green-600 hover:underline font-medium">ver todos os ASOs</a>
            </div>
        </DashboardCard>
    );
}
