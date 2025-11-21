const NFe = require('../models/NFe');
const Emitente = require('../models/Emitente');
const Destinatario = require('../models/Destinatario');
const Item = require('../models/Item');
const impostoService = require('./ImpostoService');

class NFeService {
    /**
     * Gera uma NFe completa a partir dos dados fornecidos
     * @param {Object} data - Dados da NFe (JSON)
     * @returns {NFe} Objeto NFe preenchido
     */
    gerarNFe(data) {
        const nfe = new NFe();

        // Permitir que data venha com ou sem o wrapper infNFe
        const source = data.infNFe || data;

        // 1. Identificação
        nfe.infNFe.ide = source.ide; // TODO: Criar model Ide se necessário

        // 2. Emitente
        nfe.infNFe.emit = new Emitente(source.emit);

        // 3. Destinatário
        nfe.infNFe.dest = new Destinatario(source.dest);

        // 4. Itens e Impostos
        nfe.infNFe.det = source.det.map((itemData, index) => {
            const item = new Item({ ...itemData, nItem: index + 1 });

            // Calcular impostos usando o ImpostoService
            const impostos = impostoService.calcularImpostos(item, nfe.infNFe.emit, nfe.infNFe.dest);
            item.imposto = impostos;

            return item;
        });

        // 5. Totais
        nfe.infNFe.total = this.calcularTotais(nfe.infNFe.det);

        // 6. Outros grupos (Transporte, Pagamento, etc.)
        nfe.infNFe.transp = source.transp;
        nfe.infNFe.pag = source.pag;
        nfe.infNFe.infAdic = source.infAdic;

        return nfe;
    }

    /**
     * Calcula os totais da NFe com base nos itens
     * @param {Array} itens - Lista de itens
     * @returns {Object} Objeto com os totais
     */
    calcularTotais(itens) {
        const total = {
            ICMSTot: {
                vBC: 0,
                vICMS: 0,
                vBCST: 0,
                vST: 0,
                vProd: 0,
                vFrete: 0,
                vSeg: 0,
                vDesc: 0,
                vII: 0,
                vIPI: 0,
                vPIS: 0,
                vCOFINS: 0,
                vOutro: 0,
                vNF: 0,
            },
            ISSQNtot: null,
        };

        itens.forEach(item => {
            total.ICMSTot.vProd += parseFloat(item.prod.vProd || 0);
            total.ICMSTot.vFrete += parseFloat(item.prod.vFrete || 0);
            total.ICMSTot.vSeg += parseFloat(item.prod.vSeg || 0);
            total.ICMSTot.vDesc += parseFloat(item.prod.vDesc || 0);
            total.ICMSTot.vOutro += parseFloat(item.prod.vOutro || 0);

            // ICMS
            if (item.imposto.ICMS) {
                // Depende da estrutura retornada pelo ImpostoService (ICMS00, ICMS10, etc.)
                const icmsValues = Object.values(item.imposto.ICMS)[0]; // Pega o primeiro valor (ex: ICMS00)
                if (icmsValues) {
                    total.ICMSTot.vBC += parseFloat(icmsValues.vBC || 0);
                    total.ICMSTot.vICMS += parseFloat(icmsValues.vICMS || 0);
                    total.ICMSTot.vBCST += parseFloat(icmsValues.vBCST || 0);
                    total.ICMSTot.vST += parseFloat(icmsValues.vICMSST || 0);
                }
            }

            // IPI
            if (item.imposto.IPI) {
                const ipiGroup = Object.values(item.imposto.IPI)[0];
                if (ipiGroup) {
                    total.ICMSTot.vIPI += parseFloat(ipiGroup.vIPI || 0);
                }
            }

            // PIS
            if (item.imposto.PIS) {
                const pisGroup = Object.values(item.imposto.PIS)[0];
                if (pisGroup) {
                    total.ICMSTot.vPIS += parseFloat(pisGroup.vPIS || 0);
                }
            }

            // COFINS
            if (item.imposto.COFINS) {
                const cofGroup = Object.values(item.imposto.COFINS)[0];
                if (cofGroup) {
                    total.ICMSTot.vCOFINS += parseFloat(cofGroup.vCOFINS || 0);
                }
            }

            // ISS Totais
            if (item.imposto.ISSQN && Object.keys(item.imposto.ISSQN).length) {
                if (!total.ISSQNtot) {
                    total.ISSQNtot = {
                        vServ: 0,
                        vBC: 0,
                        vISS: 0,
                        vPIS: 0,
                        vCOFINS: 0,
                        vDeducao: 0,
                        vOutro: 0,
                        vDescIncond: 0,
                        vDescCond: 0,
                        vISSRet: 0,
                        cRegTrib: 0,
                    };
                }
                total.ISSQNtot.vServ += parseFloat(item.prod.vProd || 0);
                total.ISSQNtot.vBC += parseFloat(item.imposto.ISSQN.vBC || 0);
                total.ISSQNtot.vISS += parseFloat(item.imposto.ISSQN.vISSQN || 0);
                const pisGroup = Object.values(item.imposto.PIS || {})[0] || {};
                const cofGroup = Object.values(item.imposto.COFINS || {})[0] || {};
                total.ISSQNtot.vPIS += parseFloat(pisGroup.vPIS || 0);
                total.ISSQNtot.vCOFINS += parseFloat(cofGroup.vCOFINS || 0);
            }
        });

        // Calcular vNF (Valor Total da Nota)
        // vNF = vProd - vDesc - vICMSDeson + vST + vFrete + vSeg + vOutro + vII + vIPI + vServ
        total.ICMSTot.vNF =
            total.ICMSTot.vProd
            - total.ICMSTot.vDesc
            + total.ICMSTot.vST
            + total.ICMSTot.vFrete
            + total.ICMSTot.vSeg
            + total.ICMSTot.vOutro
            + total.ICMSTot.vII
            + total.ICMSTot.vIPI;

        return total;
    }
}

module.exports = new NFeService();
