const TaxCalculatorStrategy = require('../TaxCalculatorStrategy');

class ICMSNormalStrategy extends TaxCalculatorStrategy {
    calculate(item, context) {
        const icms = {};
        const cst = item.imposto?.ICMS?.CST || '00';
        const orig = item.imposto?.ICMS?.orig || 0;
        const modBC = item.imposto?.ICMS?.modBC || 3; // 3 - Valor da Operação

        let vBC = item.prod.vProd; // TODO: Considerar frete, seguro, etc. na base de cálculo

        // Lógica de FCP (Fundo de Combate à Pobreza)
        // Simplificação: Assumindo que alíquotas vêm no item
        const pFCP = item.imposto?.ICMS?.pFCP || 0;
        const pFCPST = item.imposto?.ICMS?.pFCPST || 0;

        switch (cst) {
            case '00': // Tributada integralmente
                icms.ICMS00 = {
                    orig,
                    CST: '00',
                    modBC,
                    vBC,
                    pICMS: item.imposto?.ICMS?.pICMS || 0,
                    vICMS: 0,
                    pFCP,
                    vFCP: 0
                };
                icms.ICMS00.vICMS = (icms.ICMS00.vBC * icms.ICMS00.pICMS) / 100;
                if (pFCP > 0) {
                    icms.ICMS00.vFCP = (icms.ICMS00.vBC * pFCP) / 100;
                }
                break;

            case '10': // Tributada e com cobrança do ICMS por substituição tributária
                icms.ICMS10 = {
                    orig,
                    CST: '10',
                    modBC,
                    vBC,
                    pICMS: item.imposto?.ICMS?.pICMS || 0,
                    vICMS: 0,
                    modBCST: item.imposto?.ICMS?.modBCST || 4,
                    pMVAST: item.imposto?.ICMS?.pMVAST || 0,
                    pRedBCST: item.imposto?.ICMS?.pRedBCST || 0,
                    vBCST: 0,
                    pICMSST: item.imposto?.ICMS?.pICMSST || 0,
                    vICMSST: 0,
                    pFCP,
                    vFCP: 0,
                    pFCPST,
                    vFCPST: 0
                };

                // ICMS Próprio
                icms.ICMS10.vICMS = (icms.ICMS10.vBC * icms.ICMS10.pICMS) / 100;
                if (pFCP > 0) icms.ICMS10.vFCP = (icms.ICMS10.vBC * pFCP) / 100;

                // ICMS ST
                let baseST = vBC * (1 + (icms.ICMS10.pMVAST / 100));
                // Redução BC ST
                if (icms.ICMS10.pRedBCST > 0) {
                    baseST = baseST * (1 - (icms.ICMS10.pRedBCST / 100));
                }
                icms.ICMS10.vBCST = baseST;

                // Valor ST = (BaseST * AliquotaST) - ValorICMSProprio
                icms.ICMS10.vICMSST = (baseST * icms.ICMS10.pICMSST / 100) - icms.ICMS10.vICMS;
                if (icms.ICMS10.vICMSST < 0) icms.ICMS10.vICMSST = 0;

                // FCP ST
                if (pFCPST > 0) {
                    icms.ICMS10.vFCPST = (icms.ICMS10.vBCST * pFCPST) / 100;
                }
                break;

            case '20': // Com redução de base de cálculo
                icms.ICMS20 = {
                    orig,
                    CST: '20',
                    modBC,
                    pRedBC: item.imposto?.ICMS?.pRedBC || 0,
                    vBC: 0,
                    pICMS: item.imposto?.ICMS?.pICMS || 0,
                    vICMS: 0,
                    pFCP,
                    vFCP: 0,
                    vICMSDeson: 0,
                    motDesICMS: item.imposto?.ICMS?.motDesICMS
                };

                icms.ICMS20.vBC = vBC * (1 - (icms.ICMS20.pRedBC / 100));
                icms.ICMS20.vICMS = (icms.ICMS20.vBC * icms.ICMS20.pICMS) / 100;

                if (pFCP > 0) icms.ICMS20.vFCP = (icms.ICMS20.vBC * pFCP) / 100;

                // ICMS Desonerado (se aplicável)
                if (icms.ICMS20.motDesICMS) {
                    const vICMSFull = (vBC * icms.ICMS20.pICMS) / 100;
                    icms.ICMS20.vICMSDeson = vICMSFull - icms.ICMS20.vICMS;
                }
                break;

            case '60': // ICMS cobrado anteriormente por substituição tributária
                icms.ICMS60 = {
                    orig,
                    CST: '60',
                    vBCSTRet: item.imposto?.ICMS?.vBCSTRet || 0,
                    pST: item.imposto?.ICMS?.pST || 0,
                    vICMSSTRet: item.imposto?.ICMS?.vICMSSTRet || 0,
                };
                break;

            case '90': // Outros
                icms.ICMS90 = {
                    orig,
                    CST: '90',
                    modBC,
                    vBC,
                    pICMS: item.imposto?.ICMS?.pICMS || 0,
                    vICMS: 0,
                    modBCST: item.imposto?.ICMS?.modBCST || 4,
                    pMVAST: item.imposto?.ICMS?.pMVAST || 0,
                    vBCST: 0,
                    pICMSST: item.imposto?.ICMS?.pICMSST || 0,
                    vICMSST: 0
                };
                // Cálculo similar ao 00 e 10 dependendo dos campos preenchidos
                if (icms.ICMS90.pICMS > 0) {
                    icms.ICMS90.vICMS = (icms.ICMS90.vBC * icms.ICMS90.pICMS) / 100;
                }
                if (icms.ICMS90.pICMSST > 0) {
                    let baseST = vBC * (1 + (icms.ICMS90.pMVAST / 100));
                    icms.ICMS90.vBCST = baseST;
                    icms.ICMS90.vICMSST = (baseST * icms.ICMS90.pICMSST / 100) - (icms.ICMS90.vICMS || 0);
                }
                break;

            default:
                console.warn(`CST ${cst} não implementado completamente em ICMSNormalStrategy.`);
                // Retorna estrutura mínima para não quebrar
                icms[`ICMS${cst}`] = { orig, CST: cst };
                break;
        }

        return icms;
    }
}

module.exports = ICMSNormalStrategy;
