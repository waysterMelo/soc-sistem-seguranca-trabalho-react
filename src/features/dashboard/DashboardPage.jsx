import React, { useEffect } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bell, TrendingUp, Shield, Users, FileText, AlertTriangle, Calendar } from 'lucide-react';
import ProximosExamesCard from './ProximosExamesCard.jsx';
import AfastamentosRecentesCard from './AfastamentosRecentesCard.jsx';
import DocumentosVencidosCard from './DocumentosVencidosCard.jsx';
import { useState } from 'react';
import dashboardService from '../../api/services/dashboardService.js';

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CompanyStatusChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getEmpresasSummary();
                const empresasData = response.data;
                
                setData({
                    labels: ['Ativo', 'Inativo', 'Revisão'],
                    datasets: [{
                        data: [
                            empresasData.ativo || 0,
                            empresasData.inativo || 0,
                            empresasData.revisao || 0  // Se não tiver revisão, será 0
                        ],
                        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                        borderColor: '#ffffff',
                        borderWidth: 3,
                        hoverOffset: 8,
                    }],
                });
            } catch (error) {
                console.error('Erro ao buscar dados das empresas:', error);
                // Dados de fallback em caso de erro
                setData({
                    labels: ['Ativo', 'Inativo', 'Revisão'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                        borderColor: '#ffffff',
                        borderWidth: 3,
                        hoverOffset: 8,
                    }],
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 15,
                    color: '#374151',
                    font: { 
                        size: window.innerWidth < 640 ? 10 : 12, 
                        weight: '500' 
                    }
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return data ? <Doughnut data={data} options={options} /> : <div className="flex items-center justify-center h-40 text-gray-500">Sem dados</div>;
};


const AsoChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getAsosEmitidosSummary({ periodo: period });
                const asoData = response.data;
                
                setData({
                    labels: asoData.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
                    datasets: [{
                        label: 'ASOs Emitidos',
                        data: asoData.data || [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: window.innerWidth < 640 ? 3 : 6,
                        pointHoverRadius: window.innerWidth < 640 ? 5 : 8,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                    }],
                });
            } catch (error) {
                console.error('Erro ao buscar dados dos ASOs:', error);
                // Dados de fallback em caso de erro
                setData({
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
                    datasets: [{
                        label: 'ASOs Emitidos',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: window.innerWidth < 640 ? 3 : 6,
                        pointHoverRadius: window.innerWidth < 640 ? 5 : 8,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                    }],
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period]); // Recarrega quando o período muda
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
            y: { 
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { font: { size: window.innerWidth < 640 ? 10 : 12 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: window.innerWidth < 640 ? 10 : 12 } }
            }
        },
        plugins: { 
            legend: { display: false },
            tooltip: { titleFont: { size: 12 }, bodyFont: { size: 11 } }
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return data ? <Line data={data} options={options} /> : (
        <div className="flex items-center justify-center h-40 text-gray-500">
            Sem dados disponíveis
        </div>
    );
};

// Gráfico 3: Riscos - Responsivo COM API
const RiskChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getRiscosSummary();
                const riscosData = response.data;
                
                if (Array.isArray(riscosData) && riscosData.length > 0) {
                    // Extrair labels e dados dos riscos
                    const labels = riscosData.map(risco => risco.grupo || risco.nome || 'Sem grupo');
                    const valores = riscosData.map(risco => risco.count || risco.total || 0);
                    const cores = [
                        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
                        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                    ]; // Cores para diferentes grupos
                    
                    setData({
                        labels: [''], // Mantém label vazio para barra horizontal única
                        datasets: riscosData.map((risco, index) => ({
                            label: risco.grupo || risco.nome || `Grupo ${index + 1}`,
                            data: [risco.count || risco.total || 0],
                            backgroundColor: cores[index % cores.length],
                            barPercentage: 0.6,
                            categoryPercentage: 1.0
                        }))
                    });
                } else {
                    // Dados de fallback se não houver riscos
                    setData({
                        labels: [''],
                        datasets: [{
                            label: 'Sem dados',
                            data: [0],
                            backgroundColor: '#d1d5db',
                            barPercentage: 0.6,
                            categoryPercentage: 1.0
                        }]
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar dados dos riscos:', error);
                // Dados de fallback em caso de erro
                setData({
                    labels: [''],
                    datasets: [
                        {
                            label: 'Físicos',
                            data: [0],
                            backgroundColor: '#10b981',
                            barPercentage: 0.6,
                            categoryPercentage: 1.0
                        },
                        {
                            label: 'Acidentes',
                            data: [0],
                            backgroundColor: '#3b82f6',
                            barPercentage: 0.6,
                            categoryPercentage: 1.0
                        }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: {
                    font: { size: window.innerWidth < 640 ? 10 : 12 },
                    callback: function(value) {
                        if (Math.floor(value) === value) return value;
                    },
                }
            },
            y: {
                stacked: true,
                grid: { display: false },
                ticks: { display: false }
            }
        },
        plugins: {
            tooltip: { 
                callbacks: { title: () => null },
                titleFont: { size: 12 }, 
                bodyFont: { size: 11 } 
            },
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: window.innerWidth < 640 ? 15 : 20,
                    color: '#374151',
                    font: { 
                        size: window.innerWidth < 640 ? 10 : 12, 
                        weight: '500' 
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return data ? <Bar data={data} options={options} /> : (
        <div className="flex items-center justify-center h-40 text-gray-500">
            Sem dados de riscos
        </div>
    );
};



// Card Totalmente Responsivo
const DashboardCard = ({ 
    title, 
    children, 
    className = '', 
    icon: Icon, 
    gradient = "from-white to-gray-50",
    fullWidth = false 
}) => (
    <div className={`
        ${fullWidth ? 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-2' : 'col-span-1'}
        bg-gradient-to-br ${gradient} 
        p-3 sm:p-4 md:p-6 
        rounded-xl sm:rounded-2xl 
        shadow-md hover:shadow-lg 
        border border-gray-100/50 
        transition-all duration-300 
        hover:-translate-y-1 
        ${className}
    `}>
        {title && (
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b border-gray-200/50">
                {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />}
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate">{title}</h3>
            </div>
        )}
        {children}
    </div>
);

// Botões de Filtro Responsivos
const TimeFilterButtons = () => (
    <div className="flex bg-gray-100/70 rounded-md sm:rounded-lg p-0.5 sm:p-1">
        {['D', 'S', 'M', 'A'].map((filter, index) => (
            <button 
                key={filter} 
                className={`
                    px-2 sm:px-3 py-1 sm:py-1.5 
                    text-xs font-semibold 
                    rounded-sm sm:rounded-md 
                    transition-all duration-200 
                    ${index === 2 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-white hover:shadow-sm'
                    }
                `}
            >
                {filter}
            </button>
        ))}
    </div>
);

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="hidden sm:block absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 
            viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')] opacity-50"></div>
            
            <div className="relative z-10 w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                
                {/* Cabeçalho Responsivo */}
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-6 sm:mb-8 md:mb-12">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg sm:rounded-xl shadow-lg">
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                                CHECK LIST OPERACIONAL
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2 font-medium">
                                Sistema de Soluções para gestão de SST e eSocial
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end sm:justify-start gap-3">
                        <button className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg">
                            <Bell size={18} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </header>

                {/* Grid de Cards TOTALMENTE RESPONSIVO */}
                <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                    
                    {/* Card 1: Documentos Vencidos */}
                    <DashboardCard 
                        title="Documentos Vencidos" 
                        icon={AlertTriangle}
                        gradient="from-red-50 to-rose-50"
                        className="border-red-100/50"
                    >
                        <div className="min-h-0">
                            <DocumentosVencidosCard />
                        </div>
                    </DashboardCard>

                    {/* Card 2: Empresas */}
                    <DashboardCard 
                        title="Status das Empresas" 
                        icon={Users}
                        gradient="from-green-50 to-emerald-50"
                        className="border-green-100/50"
                    >
                        <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64">
                            <CompanyStatusChart />
                        </div>
                    </DashboardCard>

                    {/* Card 3: ASOs Emitidos */}
                    <DashboardCard 
                        title="ASOs Emitidos" 
                        icon={TrendingUp}
                        gradient="from-blue-50 to-indigo-50"
                        className="border-blue-100/50"
                    >
                        <div className="flex justify-end mb-2 sm:mb-4">
                            <TimeFilterButtons />
                        </div>
                        <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56">
                            <AsoChart />
                        </div>
                    </DashboardCard>

                    {/* Card 4: Próximos Exames */}
                    <DashboardCard 
                        title="Próximos Exames" 
                        icon={Calendar}
                        gradient="from-amber-50 to-orange-50"
                        className="border-amber-100/50"
                    >
                        <div className="min-h-0">
                            <ProximosExamesCard />
                        </div>
                    </DashboardCard>

                    {/* Card 5: Riscos por Grupo */}
                    <DashboardCard 
                        title="Riscos por Grupo" 
                        icon={Shield}
                        gradient="from-purple-50 to-violet-50"
                        className="border-purple-100/50"
                    >
                        <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56 flex items-center justify-center">
                            <RiskChart />
                        </div>
                    </DashboardCard>

                    {/* Card 6: Afastamentos */}
                    <DashboardCard 
                        title="Afastamentos Recentes" 
                        icon={FileText}
                        gradient="from-teal-50 to-cyan-50"
                        className="border-teal-100/50"
                    >
                        <div className="min-h-0">
                            <AfastamentosRecentesCard />
                        </div>
                    </DashboardCard>

                </main>

                {/* Footer Responsivo */}
                <footer className="mt-8 sm:mt-12 md:mt-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200/50">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="hidden sm:inline">Sistema atualizado em tempo real</span>
                        <span className="sm:hidden">Tempo real</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
