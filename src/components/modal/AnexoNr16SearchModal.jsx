import React, { useState, useEffect } from 'react';
import nr16Service from '../../api/services/nr16/nr16Service.js';
import { Search } from 'lucide-react';

export default function AnexoNr16SearchModal({ isOpen, onClose, onSelect }) {
    const [anexos, setAnexos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            nr16Service.getAnexos()
            
                .then(data => {
                    setAnexos(data || []);
                })
                .catch(err => {
                    console.error("Erro ao buscar anexos:", err);
                    setAnexos([]);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen]);
    
    const filteredAnexos = anexos.filter(anexo =>
        anexo && anexo.anexos && anexo.anexos.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (anexo) => {
        // Mapeia o objeto da API para o formato que o formulário espera
        onSelect({
            id: anexo.id,
            titulo: anexo.anexos, // DE: anexo.anexos, PARA: anexo.titulo
            avaliacao: '' 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b"><h3 className="text-xl font-semibold">Selecionar Anexo da NR-16</h3></div>
                <div className="p-4">
                    <div className="relative">
                        <input type="text" placeholder="Pesquisar anexo..." className="w-full py-2 pl-10 pr-4 border rounded-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>
                <div className="overflow-y-auto flex-grow p-4">
                    {loading ? <p>Carregando...</p> : (
                        <ul className="space-y-2">
                            {filteredAnexos.map(anexo => (
                                <li key={anexo.id} className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(anexo)}>
                                    {/* Exibe a propriedade correta 'anexos' */}
                                    {anexo.anexos}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Fechar</button>
                </div>
            </div>
        </div>
    );
}