import React, { useState } from 'react';
import { Plus, Trash2, Save, Send, Package, User, FileText, CheckCircle, AlertCircle, MapPin, DollarSign, Calculator } from 'lucide-react';
import api from '../services/api';

const InvoiceForm = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        natOp: 'VENDA DE MERCADORIA',
        dest: {
            CNPJ: '',
            xNome: '',
            enderDest: {
                xLgr: '',
                nro: '',
                xBairro: '',
                cMun: '3550308',
                xMun: 'SAO PAULO',
                UF: 'SP',
                CEP: '',
                cPais: '1058',
                xPais: 'BRASIL'
            },
            indIEDest: '1',
            IE: ''
        },
        itens: [
            {
                cProd: '',
                xProd: '',
                NCM: '',
                CFOP: '5102',
                uCom: 'UN',
                qCom: 1,
                vUnCom: 0,
                imposto: {
                    ICMS: {
                        orig: '0',
                        CSOSN: '101',
                        pCredSN: '2.50',
                        vCredICMSSN: '0.00'
                    },
                    PIS: {
                        CST: '01',
                        vBC: '0.00',
                        pPIS: '1.65',
                        vPIS: '0.00'
                    },
                    COFINS: {
                        CST: '01',
                        vBC: '0.00',
                        pCOFINS: '7.60',
                        vCOFINS: '0.00'
                    }
                }
            }
        ]
    });

    const addItem = () => {
        setFormData({
            ...formData,
            itens: [...formData.itens, {
                cProd: '',
                xProd: '',
                NCM: '',
                CFOP: '5102',
                uCom: 'UN',
                qCom: 1,
                vUnCom: 0,
                imposto: {
                    ICMS: { orig: '0', CSOSN: '101', pCredSN: '2.50', vCredICMSSN: '0.00' },
                    PIS: { CST: '01', vBC: '0.00', pPIS: '1.65', vPIS: '0.00' },
                    COFINS: { CST: '01', vBC: '0.00', pCOFINS: '7.60', vCOFINS: '0.00' }
                }
            }]
        });
    };

    const removeItem = (index) => {
        const newItens = formData.itens.filter((_, i) => i !== index);
        setFormData({ ...formData, itens: newItens });
    };

    const updateItem = (index, field, value) => {
        const newItens = [...formData.itens];
        const keys = field.split('.');
        let obj = newItens[index];
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        setFormData({ ...formData, itens: newItens });
    };

    const updateDest = (field, value) => {
        const keys = field.split('.');
        const newDest = { ...formData.dest };
        let obj = newDest;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        setFormData({ ...formData, dest: newDest });
    };

    const calculateTotal = () => {
        return formData.itens.reduce((sum, item) => sum + (item.qCom * item.vUnCom), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const total = calculateTotal();
            const payload = {
                infNFe: {
                    ide: {
                        cUF: '35',
                        cNF: '00462186',
                        natOp: formData.natOp,
                        mod: '55',
                        serie: '1',
                        nNF: String(Math.floor(Math.random() * 10000) + 1000),
                        dhEmi: new Date().toISOString(),
                        tpNF: '1',
                        idDest: '1',
                        cMunFG: '3550308',
                        tpImp: '1',
                        tpEmis: '1',
                        cDV: '0',
                        tpAmb: '2',
                        finNFe: '1',
                        indFinal: '1',
                        indPres: '1',
                        procEmi: '0',
                        verProc: '1.0.0'
                    },
                    emit: {
                        CNPJ: '12345678000195',
                        xNome: 'EMPRESA EMITENTE LTDA',
                        xFant: 'MINHA EMPRESA',
                        enderEmit: {
                            xLgr: 'RUA TESTE',
                            nro: '100',
                            xBairro: 'CENTRO',
                            cMun: '3550308',
                            xMun: 'SAO PAULO',
                            UF: 'SP',
                            CEP: '01001000',
                            cPais: '1058',
                            xPais: 'BRASIL',
                            fone: '1133334444'
                        },
                        IE: '123456789',
                        CRT: '1'
                    },
                    dest: formData.dest,
                    det: formData.itens.map((item, index) => ({
                        prod: {
                            cProd: item.cProd,
                            cEAN: 'SEM GTIN',
                            xProd: item.xProd,
                            NCM: item.NCM,
                            CFOP: item.CFOP,
                            uCom: item.uCom,
                            qCom: item.qCom.toFixed(4),
                            vUnCom: item.vUnCom.toFixed(4),
                            vProd: (item.qCom * item.vUnCom).toFixed(2),
                            cEANTrib: 'SEM GTIN',
                            uTrib: item.uCom,
                            qTrib: item.qCom.toFixed(4),
                            vUnTrib: item.vUnCom.toFixed(4),
                            indTot: '1'
                        },
                        imposto: item.imposto
                    })),
                    total: {
                        ICMSTot: {
                            vBC: '0.00',
                            vICMS: '0.00',
                            vICMSDeson: '0.00',
                            vFCP: '0.00',
                            vBCST: '0.00',
                            vST: '0.00',
                            vFCPST: '0.00',
                            vFCPSTRet: '0.00',
                            vProd: total.toFixed(2),
                            vFrete: '0.00',
                            vSeg: '0.00',
                            vDesc: '0.00',
                            vII: '0.00',
                            vIPI: '0.00',
                            vIPIDevol: '0.00',
                            vPIS: '0.00',
                            vCOFINS: '0.00',
                            vOutro: '0.00',
                            vNF: total.toFixed(2)
                        }
                    },
                    transp: {
                        modFrete: '9'
                    },
                    pag: {
                        detPag: [
                            {
                                tPag: '01',
                                vPag: total.toFixed(2)
                            }
                        ]
                    },
                    infAdic: {
                        infCpl: 'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL'
                    }
                }
            };

            const response = await api.post('/nfe?format=xml', payload);
            setResult({ success: true, message: 'NFe criada e assinada com sucesso!' });
            alert('NFe criada com sucesso! Verifique o Dashboard.');
        } catch (error) {
            console.error(error);
            setResult({ success: false, message: error.response?.data?.details || error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-in">
            {/* Mensagem de resultado */}
            {result && (
                <div className={`p-5 rounded-xl border-2 ${result.success
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800'
                    } animate-slide-in shadow-lg`}>
                    <div className="flex items-center gap-3">
                        {result.success ? (
                            <CheckCircle className="h-6 w-6 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-6 w-6 flex-shrink-0" />
                        )}
                        <p className="font-bold text-lg">{result.message}</p>
                    </div>
                </div>
            )}

            {/* Informações do Destinatário */}
            <div className="form-section">
                <div className="form-section-header">
                    <div className="form-section-icon bg-gradient-to-br from-blue-600 to-cyan-600">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="form-section-title">Dados do Destinatário</h3>
                        <p className="text-sm text-gray-500">Informações do cliente que receberá a nota fiscal</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="label">CNPJ *</label>
                            <input
                                type="text"
                                value={formData.dest.CNPJ}
                                onChange={(e) => updateDest('CNPJ', e.target.value)}
                                placeholder="00.000.000/0000-00"
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Inscrição Estadual</label>
                            <input
                                type="text"
                                value={formData.dest.IE}
                                onChange={(e) => updateDest('IE', e.target.value)}
                                placeholder="000000000"
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Razão Social *</label>
                        <input
                            type="text"
                            value={formData.dest.xNome}
                            onChange={(e) => updateDest('xNome', e.target.value)}
                            placeholder="Nome da empresa destinatária"
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label className="label">Logradouro *</label>
                            <input
                                type="text"
                                value={formData.dest.enderDest.xLgr}
                                onChange={(e) => updateDest('enderDest.xLgr', e.target.value)}
                                placeholder="Rua, Avenida, etc."
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Número *</label>
                            <input
                                type="text"
                                value={formData.dest.enderDest.nro}
                                onChange={(e) => updateDest('enderDest.nro', e.target.value)}
                                placeholder="123"
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Bairro *</label>
                            <input
                                type="text"
                                value={formData.dest.enderDest.xBairro}
                                onChange={(e) => updateDest('enderDest.xBairro', e.target.value)}
                                placeholder="Nome do bairro"
                                className="input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label className="label">Município *</label>
                            <input
                                type="text"
                                value={formData.dest.enderDest.xMun}
                                onChange={(e) => updateDest('enderDest.xMun', e.target.value)}
                                placeholder="Nome da cidade"
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">UF *</label>
                            <input
                                type="text"
                                value={formData.dest.enderDest.UF}
                                onChange={(e) => updateDest('enderDest.UF', e.target.value)}
                                placeholder="SP"
                                maxLength="2"
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">CEP *</label>
                            <input
                                type="text"
                                value={formData.dest.enderDest.CEP}
                                onChange={(e) => updateDest('enderDest.CEP', e.target.value)}
                                placeholder="00000-000"
                                className="input"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Produtos/Serviços */}
            <div className="form-section">
                <div className="form-section-header">
                    <div className="form-section-icon bg-gradient-to-br from-purple-600 to-pink-600">
                        <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="form-section-title">Produtos e Serviços</h3>
                        <p className="text-sm text-gray-500">Adicione os itens que farão parte da nota fiscal</p>
                    </div>
                    <button
                        type="button"
                        onClick={addItem}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Item
                    </button>
                </div>

                <div className="space-y-6">
                    {formData.itens.map((item, index) => (
                        <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                        {index + 1}
                                    </span>
                                    Item {index + 1}
                                </h4>
                                {formData.itens.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                                        title="Remover item"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Código do Produto *</label>
                                        <input
                                            type="text"
                                            value={item.cProd}
                                            onChange={(e) => updateItem(index, 'cProd', e.target.value)}
                                            placeholder="PROD001"
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">NCM *</label>
                                        <input
                                            type="text"
                                            value={item.NCM}
                                            onChange={(e) => updateItem(index, 'NCM', e.target.value)}
                                            placeholder="12345678"
                                            className="input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Descrição do Produto *</label>
                                    <input
                                        type="text"
                                        value={item.xProd}
                                        onChange={(e) => updateItem(index, 'xProd', e.target.value)}
                                        placeholder="Descrição detalhada do produto"
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className="form-row-4">
                                    <div className="form-group">
                                        <label className="label">CFOP *</label>
                                        <input
                                            type="text"
                                            value={item.CFOP}
                                            onChange={(e) => updateItem(index, 'CFOP', e.target.value)}
                                            placeholder="5102"
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Unidade *</label>
                                        <input
                                            type="text"
                                            value={item.uCom}
                                            onChange={(e) => updateItem(index, 'uCom', e.target.value)}
                                            placeholder="UN"
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Quantidade *</label>
                                        <input
                                            type="number"
                                            value={item.qCom}
                                            onChange={(e) => updateItem(index, 'qCom', parseFloat(e.target.value) || 0)}
                                            placeholder="1"
                                            step="0.01"
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Valor Unitário *</label>
                                        <input
                                            type="number"
                                            value={item.vUnCom}
                                            onChange={(e) => updateItem(index, 'vUnCom', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Subtotal do Item:</span>
                                        <span className="text-2xl font-bold text-green-600 flex items-center gap-2">
                                            <DollarSign className="h-6 w-6" />
                                            R$ {(item.qCom * item.vUnCom).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total e Ações */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                                <Calculator className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Valor Total da Nota Fiscal</p>
                                <p className="text-3xl font-bold gradient-text">R$ {calculateTotal().toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-success flex-1 flex items-center justify-center gap-2 text-lg py-4"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Emitir Nota Fiscal
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default InvoiceForm;
