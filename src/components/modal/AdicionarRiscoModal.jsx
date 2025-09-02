import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { funcaoService } from '../../api/services/cadastros/funcoesService';

const AdicionarRiscoModal = ({ isOpen, onClose, onSaveSuccess }) => {
    const [grupo, setGrupo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const gruposDeRisco = [
        { value: 'GRUPO_1_FISICOS', label: 'Físico' },
        { value: 'GRUPO_2_QUIMICOS', label: 'Químico' },
        { value: 'GRUPO_3_BIOLOGICOS', label: 'Biológico' },
        { value: 'GRUPO_4_ERGONOMICOS', label: 'Ergonômico' },
        { value: 'GRUPO_5_ACIDENTES', label: 'Acidentes' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!grupo || !descricao) {
            setError('Ambos os campos são obrigatórios.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const riscoData = {
                grupo,
                descricao
            };
            const response = await funcaoService.createRiscoCatalogo(riscoData);
            onSaveSuccess(response.data);
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Erro ao criar risco:', err);
            setError(err.response?.data?.message || 'Ocorreu um erro ao salvar o risco.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setGrupo('');
        setDescricao('');
        setError(null);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-xl font-semibold text-gray-900">Adicionar Novo Risco</h3>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="grupo-risco" className="block text-sm font-medium text-gray-700 mb-1">
                                Grupo de Risco
                            </label>
                            <select
                                id="grupo-risco"
                                value={grupo}
                                onChange={(e) => setGrupo(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione um grupo</option>
                                {gruposDeRisco.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="descricao-risco" className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição do Risco
                            </label>
                            <textarea
                                id="descricao-risco"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                rows="4"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: Ruído contínuo ou intermitente"
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center bg-gray-50 px-6 py-3 border-t space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                        >
                            {loading && <Loader className="animate-spin mr-2" size={16} />}
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <div className="text-green-600 text-6xl mb-4">✓</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Risco salvo com sucesso!</h3>
                        <button
                            onClick={handleClose}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdicionarRiscoModal;