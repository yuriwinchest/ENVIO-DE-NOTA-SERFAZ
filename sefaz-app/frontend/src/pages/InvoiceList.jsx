import React, { useEffect, useState } from 'react';
import { FileText, Send, RefreshCw, Search, XCircle, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import api from '../services/api';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [cancelModal, setCancelModal] = useState({ show: false, nfe: null });
    const [justificativa, setJustificativa] = useState('');

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/nfe');
            setInvoices(response.data);
        } catch (error) {
            console.error('Erro ao buscar notas:', error);
        } finally {
            setLoading(false);
        }
    };

    const enviarParaSefaz = async (id) => {
        if (!confirm('Deseja enviar esta NFe para a SEFAZ?')) return;

        setActionLoading({ id, action: 'enviar' });
        try {
            const response = await api.post(`/nfe/${id}/enviar`);
            if (response.data.success) {
                alert(`NFe enviada com sucesso!\nChave: ${response.data.resposta.chaveAcesso}\nProtocolo: ${response.data.resposta.protocolo}`);
            } else {
                alert(`Erro: ${response.data.resposta.xMotivo}`);
            }
            fetchInvoices();
        } catch (error) {
            const msg = error.response?.data?.details || error.message;
            alert(`Erro ao enviar para SEFAZ: ${msg}`);
        } finally {
            setActionLoading(null);
        }
    };

    const consultarSefaz = async (id) => {
        setActionLoading({ id, action: 'consultar' });
        try {
            const response = await api.get(`/nfe/${id}/consultar`);
            alert(`Status: ${response.data.resposta.xMotivo}\nProtocolo: ${response.data.resposta.protocolo || 'N/A'}`);
            fetchInvoices();
        } catch (error) {
            const msg = error.response?.data?.details || error.message;
            alert(`Erro ao consultar: ${msg}`);
        } finally {
            setActionLoading(null);
        }
    };

    const abrirModalCancelar = (nfe) => {
        setCancelModal({ show: true, nfe });
        setJustificativa('');
    };

    const cancelarNFe = async () => {
        if (justificativa.length < 15) {
            alert('Justificativa deve ter no mínimo 15 caracteres');
            return;
        }

        setActionLoading({ id: cancelModal.nfe.id, action: 'cancelar' });
        try {
            const response = await api.post(`/nfe/${cancelModal.nfe.id}/cancelar`, { justificativa });
            if (response.data.success) {
                alert('NFe cancelada com sucesso!');
            } else {
                alert(`Erro: ${response.data.resposta.xMotivo}`);
            }
            setCancelModal({ show: false, nfe: null });
            fetchInvoices();
        } catch (error) {
            const msg = error.response?.data?.details || error.message;
            alert(`Erro ao cancelar: ${msg}`);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const getStatusIcon = (status) => {
        const icons = {
            'GERADA': <Clock className="h-4 w-4" />,
            'ASSINADA': <CheckCircle className="h-4 w-4" />,
            'ENVIADA': <Send className="h-4 w-4" />,
            'AUTORIZADA': <CheckCircle className="h-4 w-4" />,
            'REJEITADA': <XCircle className="h-4 w-4" />,
            'CANCELADA': <XCircle className="h-4 w-4" />,
            'ERRO_ENVIO': <AlertCircle className="h-4 w-4" />
        };
        return icons[status] || <Clock className="h-4 w-4" />;
    };

    const getStatusBadge = (status) => {
        const styles = {
            'GERADA': 'badge-gray',
            'ASSINADA': 'badge-success',
            'ENVIADA': 'badge-info',
            'AUTORIZADA': 'badge-success',
            'REJEITADA': 'badge-danger',
            'CANCELADA': 'badge-warning',
            'ERRO_ENVIO': 'badge-danger'
        };

        return (
            <span className={`badge ${styles[status] || 'badge-gray'}`}>
                {getStatusIcon(status)}
                {status}
            </span>
        );
    };

    return (
        <>
            <div className="card animate-slide-in">
                <div className="card-header">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-3 rounded-xl shadow-lg animate-pulse-glow">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold gradient-text">Histórico de Notas Fiscais</h2>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Gerencie e acompanhe suas NFe emitidas</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchInvoices}
                            className="btn btn-secondary flex items-center gap-2"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {loading && invoices.length === 0 ? (
                        <div className="empty-state">
                            <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                            <p className="text-gray-600 font-semibold text-lg">Carregando notas...</p>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="empty-state">
                            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-full inline-block mb-4">
                                <FileText className="h-20 w-20 text-blue-600" />
                            </div>
                            <p className="text-gray-800 font-bold text-xl mb-2">Nenhuma nota emitida ainda</p>
                            <p className="text-gray-600 text-base">Clique em "Nova Nota" para começar a emitir suas NFe</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="text-left">Número</th>
                                        <th className="text-left">Destinatário</th>
                                        <th className="text-left">Valor</th>
                                        <th className="text-left">Data Emissão</th>
                                        <th className="text-left">Status</th>
                                        <th className="text-left">Chave/Protocolo</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((nfe) => (
                                        <tr key={nfe.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                                            <td className="font-medium text-gray-900">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold">{nfe.nNF}</span>
                                                    <span className="text-xs text-gray-400">Série {nfe.serie}</span>
                                                </div>
                                            </td>
                                            <td className="text-gray-700 font-medium">
                                                {nfe.dest}
                                            </td>
                                            <td className="font-bold text-green-600 text-base">
                                                R$ {parseFloat(nfe.valor).toFixed(2)}
                                            </td>
                                            <td className="text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{new Date(nfe.dhEmi).toLocaleDateString('pt-BR')}</span>
                                                    <span className="text-xs text-gray-400">{new Date(nfe.dhEmi).toLocaleTimeString('pt-BR')}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusBadge(nfe.status)}
                                                {nfe.motivoRejeicao && (
                                                    <div className="text-xs text-red-600 mt-1 font-medium" title={nfe.motivoRejeicao}>
                                                        {nfe.motivoRejeicao.substring(0, 30)}...
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-xs text-gray-500">
                                                {nfe.chaveAcesso && (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{nfe.chaveAcesso.substring(0, 20)}...</span>
                                                        {nfe.protocolo && <span className="text-blue-600 font-semibold">Prot: {nfe.protocolo}</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-end gap-2">
                                                    {nfe.xml && (
                                                        <button
                                                            onClick={() => {
                                                                const blob = new Blob([nfe.xml], { type: 'application/xml' });
                                                                const url = URL.createObjectURL(blob);
                                                                window.open(url, '_blank');
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                                                            title="Ver XML"
                                                        >
                                                            <FileText className="h-5 w-5" />
                                                        </button>
                                                    )}

                                                    {nfe.signed && !['ENVIADA', 'AUTORIZADA', 'CANCELADA'].includes(nfe.status) && (
                                                        <button
                                                            onClick={() => enviarParaSefaz(nfe.id)}
                                                            disabled={actionLoading?.id === nfe.id && actionLoading?.action === 'enviar'}
                                                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                                            title="Enviar para SEFAZ"
                                                        >
                                                            {actionLoading?.id === nfe.id && actionLoading?.action === 'enviar' ? (
                                                                <RefreshCw className="h-5 w-5 animate-spin" />
                                                            ) : (
                                                                <Send className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    )}

                                                    {nfe.chaveAcesso && (
                                                        <button
                                                            onClick={() => consultarSefaz(nfe.id)}
                                                            disabled={actionLoading?.id === nfe.id && actionLoading?.action === 'consultar'}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                                            title="Consultar Status"
                                                        >
                                                            {actionLoading?.id === nfe.id && actionLoading?.action === 'consultar' ? (
                                                                <RefreshCw className="h-5 w-5 animate-spin" />
                                                            ) : (
                                                                <Search className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    )}

                                                    {nfe.status === 'AUTORIZADA' && (
                                                        <button
                                                            onClick={() => abrirModalCancelar(nfe)}
                                                            disabled={actionLoading?.id === nfe.id && actionLoading?.action === 'cancelar'}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                                            title="Cancelar NFe"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Cancelamento Premium */}
            {cancelModal.show && (
                <div className="modal-overlay animate-fade-in">
                    <div className="modal-content animate-slide-in">
                        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 px-6 py-5 border-b border-red-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-red-600 to-orange-600 p-2.5 rounded-lg shadow-lg">
                                    <XCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Cancelar NFe</h3>
                                    <p className="text-sm text-gray-600 mt-0.5">NFe #{cancelModal.nfe?.nNF} - Série {cancelModal.nfe?.serie}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-900">Atenção</p>
                                        <p className="text-sm text-yellow-800 mt-1">Esta ação não pode ser desfeita. A NFe será cancelada permanentemente na SEFAZ.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    Justificativa (mínimo 15 caracteres) *
                                </label>
                                <textarea
                                    value={justificativa}
                                    onChange={(e) => setJustificativa(e.target.value)}
                                    className="input resize-none"
                                    rows="5"
                                    placeholder="Digite o motivo do cancelamento da NFe..."
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className={`text-sm font-medium ${justificativa.length >= 15 ? 'text-green-600' : 'text-gray-500'}`}>
                                        {justificativa.length}/15 caracteres
                                    </p>
                                    {justificativa.length >= 15 && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={cancelarNFe}
                                    disabled={justificativa.length < 15 || actionLoading}
                                    className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Cancelando...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4" />
                                            Confirmar Cancelamento
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setCancelModal({ show: false, nfe: null })}
                                    className="btn btn-secondary px-8"
                                    disabled={actionLoading}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InvoiceList;
