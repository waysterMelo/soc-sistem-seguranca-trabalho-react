import React, { useState, useEffect } from 'react';
import afastamentoService from '../../api/services/medicina/afastamentoService';
import { toast } from 'react-toastify';
import { User, Calendar, Briefcase } from 'lucide-react';

// Componente de Card Genérico do Dashboard
const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">{title}</h3>}
        {children}
    </div>
);

export default function AfastamentosRecentesCard() {
    const [afastamentos, setAfastamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAfastamentos = async () => {
            try {
                const response = await afastamentoService.getRecentes();
                if (Array.isArray(response)) {
                    setAfastamentos(response);
                }
            } catch (error) {
                toast.error('Não foi possível carregar os afastamentos recentes.');
            } finally {
                setLoading(false);
            }
        };
        fetchAfastamentos();
    }, []);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    return (
        <DashboardCard title="Afastamentos Recentes">
            {loading ? (
                <div className="text-center text-gray-500 py-10">Carregando...</div>
            ) : afastamentos.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Nenhum afastamento recente registrado.</div>
            ) : (
                <div className="space-y-4">
                    {afastamentos.map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                            <div>
                                <p className="font-medium flex items-center gap-2"><User size={14} /> {item.funcionarioNome}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-2"><Briefcase size={14} /> Motivo: {item.motivo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold">{item.totalDias} dia(s)</p>
                                <p className="text-xs text-gray-500">{formatDate(item.dataInicio)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="text-right mt-4">
                <a href="#" className="text-sm text-green-600 hover:underline font-medium">ver todos os afastamentos</a>
            </div>
        </DashboardCard>
    );
}
