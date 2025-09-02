import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import aparelhoService from '../../../api/services/aparelhos/aparelhoService';

export default function EditarAparelho() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null); 
    const [certificadoFile, setCertificadoFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (id) {
            aparelhoService.getById(id)
                .then(data => {
                    setFormData(data);
                })
                .catch(error => {
                    toast.error("Erro ao carregar dados do aparelho.");
                    console.error("Erro ao buscar aparelho:", error);
                });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setCertificadoFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Remove o campo do arquivo do DTO para não ser enviado como JSON
        const { certificado, ...aparelhoData } = formData;

        try {
            await aparelhoService.update(id, aparelhoData, certificadoFile);
           setShowSuccessModal(true);
          setTimeout(() => {
            navigate('/cadastros/aparelhos');
          }, 1500); 
        } catch (error) {
            toast.error("Erro ao atualizar aparelho.", error);
        } finally {
            setSaving(false);
        }
    };

    if (!formData) {
        return <div className="p-8">Carregando...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Editar Aparelho</h1>
                    <button onClick={() => navigate('/cadastros/aparelhos')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                        <ArrowLeft size={20} />
                        <span>Voltar para a Lista</span>
                    </button>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Linha 1 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descrição *</label>
                                <input type="text" name="descricao" value={formData.descricao || ''} onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Modelo *</label>
                                <input type="text" name="modelo" value={formData.modelo || ''} onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Marca *</label>
                                <input type="text" name="marca" value={formData.marca || ''} onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                            </div>

                            {/* Linha 2 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Calibração</label>
                                <input type="text" name="calibracao" value={formData.calibracao || ''} onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Data da Calibração *</label>
                                <input type="date" name="dataCalibracao" value={formData.dataCalibracao || ''} onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Validade da Calibração</label>
                                <input type="date" name="validadeCalibracao" value={formData.validadeCalibracao || ''} onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>

                            {/* Linha 3 */}
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Critérios de avaliação</label>
                                <textarea name="criteriosAvaliacao" value={formData.criteriosAvaliacao || ''} onChange={handleChange}
                                    rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
                            </div>

                            {/* Linha 4 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status || 'ATIVO'} onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Upload do Certificado</label>
                                <input type="file" onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
                            <button type="button" onClick={() => navigate('/cadastros/aparelhos')}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md font-medium hover:bg-gray-300">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                       {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Infotmação salva com sucesso!</h3>
                                <p className="text-gray-600">Redirecionando...</p>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}