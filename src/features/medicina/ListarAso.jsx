import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Settings, Printer
} from 'lucide-react';

// Mock Data - will be replaced by API calls
const mockAsoList = [
    { id: 1, idRegistro: 101, dataAso: '2025-07-15', tipo: 'Admissional', nomeEmpresa: 'WAYSTER HENRIQUE CRUZ DE MELO', nomeFuncionario: 'MARINA GARCIA LOPES', vencimento: '2026-07-15' },
    { id: 2, idRegistro: 102, dataAso: '2025-07-14', tipo: 'Periódico', nomeEmpresa: 'Construtora Segura Ltda.', nomeFuncionario: 'JOÃO DA SILVA', vencimento: '2026-07-14' },
];

// Mock Components - will be replaced by real ones or removed
const SearchableSelect = ({ label, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
            <option>{placeholder}</option>
        </select>
    </div>
);
const SelectField = ({ label, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
            {options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
    </div>
);

export default function ListarAso() {
    const navigate = useNavigate();

    const handleCreateNew = () => {
        navigate('/medicina/cadastrar-aso'); // Placeholder route
    };

    // Placeholder handlers
    const onEdit = (aso) => {
        navigate(`/medicina/editar-aso/${aso.id}`); // Placeholder route
    };

    const onDelete = (id) => {
        alert(`Deleting ASO with id: ${id}`);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Atestado de Saúde Ocupacional</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <SearchableSelect label="Filtrar por Empresa" options={[]} placeholder="Selecione uma empresa para filtrar" />
                        <SearchableSelect label="Filtrar por Unidade Operacional" options={[]} placeholder="Nenhuma Unidade Operacional selecionada" />
                        <SelectField label="Filtrar pelo tipo de ASO" options={['Todos', 'Admissional', 'Periódico', 'Demissional']} />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder="Procure por algum registro..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                            
                
                            <button onClick={handleCreateNew} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                                <Plus size={18} /> Novo ASO
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                {['Id Registro', 'Data do Aso', 'Tipo', 'Nome da Empresa', 'Nome do Funcionário', 'Vencimento', 'Ações'].map(header => (
                                    <th key={header} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{header}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {mockAsoList.length > 0 ? mockAsoList.map(aso => (
                                <tr key={aso.id}>
                                    <td className="py-3 px-4 text-sm text-gray-700">{aso.idRegistro}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{aso.dataAso}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{aso.tipo}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{aso.nomeEmpresa}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{aso.nomeFuncionario}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{aso.vencimento}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">...</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500">Nenhum registro encontrado!</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};