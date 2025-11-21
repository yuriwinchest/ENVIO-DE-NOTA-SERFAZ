import React, { useState, useEffect } from 'react';
import { Settings, Upload, CheckCircle, AlertCircle, FileKey, Info, Save, Trash2 } from 'lucide-react';
import axios from 'axios';

const ConfigPage = () => {
    const [config, setConfig] = useState({
        certPath: '',
        certPassword: '',
        sefazUrl: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao.asmx',
        hasCertificate: false
    });

    const [formData, setFormData] = useState({
        certPassword: '',
        sefazUrl: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao.asmx'
    });

    const [certificateFile, setCertificateFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showInstructions, setShowInstructions] = useState(true);

    // Carregar configuração atual
    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/config');
            setConfig(response.data);
            if (response.data.sefazUrl) {
                setFormData(prev => ({ ...prev, sefazUrl: response.data.sefazUrl }));
            }
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.pfx') || file.name.endsWith('.p12')) {
                setCertificateFile(file);
                setMessage({ type: 'success', text: `Arquivo selecionado: ${file.name}` });
            } else {
                setMessage({ type: 'error', text: 'Apenas arquivos .pfx ou .p12 são permitidos' });
            }
        }
    };

    const handleUploadCertificate = async () => {
        if (!certificateFile) {
            setMessage({ type: 'error', text: 'Selecione um arquivo de certificado' });
            return;
        }

        setLoading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('certificate', certificateFile);

        try {
            await axios.post('http://localhost:3000/api/config/certificate', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'Certificado enviado com sucesso!' });
            loadConfig();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao enviar certificado' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        if (!formData.certPassword) {
            setMessage({ type: 'error', text: 'Digite a senha do certificado' });
            return;
        }

        if (!config.hasCertificate) {
            setMessage({ type: 'error', text: 'Faça o upload do certificado primeiro' });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/config', formData);
            setMessage({ type: 'success', text: response.data.message });
            loadConfig();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao salvar configuração' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCertificate = async () => {
        if (!confirm('Tem certeza que deseja remover o certificado?')) return;

        setLoading(true);
        try {
            await axios.delete('http://localhost:3000/api/config/certificate');
            setMessage({ type: 'success', text: 'Certificado removido com sucesso' });
            setCertificateFile(null);
            loadConfig();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao remover certificado' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-slide-in max-w-5xl mx-auto">
            <div className="card-header">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-3 rounded-xl shadow-lg animate-pulse-glow">
                        <Settings className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Configuração do Sistema</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Configure o certificado digital A1 para integração com SEFAZ</p>
                    </div>
                </div>
            </div>

            <div className="card-body space-y-6">
                {/* Mensagem de feedback */}
                {message.text && (
                    <div className={`p-5 rounded-xl border-2 ${message.type === 'success'
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800'
                        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800'
                        } animate-slide-in shadow-lg`}>
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-6 w-6 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                            )}
                            <p className="font-bold text-base">{message.text}</p>
                        </div>
                    </div>
                )}

                {/* Upload de Certificado */}
                <div className="form-section">
                    <div className="form-section-header">
                        <div className="form-section-icon bg-gradient-to-br from-blue-600 to-cyan-600">
                            <Upload className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="form-section-title">1. Upload do Certificado Digital</h3>
                            <p className="text-sm text-gray-500 mt-1">Envie seu certificado A1 (.pfx ou .p12)</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="label">Arquivo do Certificado (.pfx ou .p12) *</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="file"
                                    accept=".pfx,.p12"
                                    onChange={handleFileChange}
                                    className="input flex-1"
                                />
                                <button
                                    onClick={handleUploadCertificate}
                                    disabled={!certificateFile || loading}
                                    className="btn btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <Upload className="h-4 w-4" />
                                    Enviar Certificado
                                </button>
                            </div>
                        </div>

                        {config.hasCertificate && (
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 text-green-700">
                                    <CheckCircle className="h-6 w-6 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold text-base">Certificado carregado com sucesso</span>
                                        <p className="text-xs text-green-600 mt-0.5">Pronto para configuração</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDeleteCertificate}
                                    className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                                    title="Remover certificado"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Configurações */}
                <div className="form-section">
                    <div className="form-section-header">
                        <div className="form-section-icon bg-gradient-to-br from-purple-600 to-pink-600">
                            <FileKey className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="form-section-title">2. Configurar Credenciais</h3>
                            <p className="text-sm text-gray-500 mt-1">Defina a senha e URL da SEFAZ</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="form-group">
                            <label className="label">Senha do Certificado *</label>
                            <input
                                type="password"
                                value={formData.certPassword}
                                onChange={(e) => setFormData({ ...formData, certPassword: e.target.value })}
                                placeholder="Digite a senha do certificado digital"
                                className="input"
                            />
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                A senha será armazenada de forma segura no servidor
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="label">URL da SEFAZ (Homologação) *</label>
                            <input
                                type="text"
                                value={formData.sefazUrl}
                                onChange={(e) => setFormData({ ...formData, sefazUrl: e.target.value })}
                                className="input"
                                placeholder="https://nfe-homologacao.svrs.rs.gov.br/..."
                            />
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Brasília-DF utiliza SVRS (Sefaz Virtual Rio Grande do Sul)
                            </p>
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            disabled={loading || !config.hasCertificate}
                            className="btn btn-success w-full flex items-center justify-center gap-2 text-base py-3.5"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Salvar Configuração
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Instruções */}
                {showInstructions && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Info className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-bold text-yellow-900 mb-3 text-base">📋 Instruções de Configuração</h4>
                                <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside ml-1">
                                    <li className="font-medium">Selecione e envie seu certificado digital (.pfx ou .p12)</li>
                                    <li className="font-medium">Digite a senha do certificado</li>
                                    <li className="font-medium">Verifique a URL da SEFAZ (já configurada para Brasília-DF)</li>
                                    <li className="font-medium">Clique em "Salvar Configuração"</li>
                                    <li className="font-medium">As mudanças entram em vigor imediatamente após salvar</li>
                                </ol>
                            </div>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="text-yellow-600 hover:text-yellow-800 font-bold text-sm px-3 py-1 hover:bg-yellow-100 rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Segurança */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-red-900 mb-3 text-base flex items-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        🔒 Avisos de Segurança
                    </h4>
                    <ul className="text-sm text-red-800 space-y-2 list-disc list-inside ml-1">
                        <li className="font-medium">Nunca compartilhe seu certificado digital ou senha</li>
                        <li className="font-medium">O certificado é armazenado localmente no servidor</li>
                        <li className="font-medium">Use sempre o ambiente de homologação para testes</li>
                        <li className="font-medium">Verifique se o certificado está válido e dentro do prazo</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ConfigPage;
