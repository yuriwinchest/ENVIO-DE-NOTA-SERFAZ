const TaxCalculatorStrategy = require('../TaxCalculatorStrategy');

class ICMSSimplesStrategy extends TaxCalculatorStrategy {
    calculate(item, context) {
        const icms = {};
        const csosn = item.imposto?.ICMS?.CSOSN || '101'; // Default 101
        const orig = item.imposto?.ICMS?.orig || 0;

        let vBC = item.prod.vProd;

        switch (csosn) {
            case '101': // Tributada pelo Simples Nacional com permissão de crédito
                icms.ICMSSN101 = {
                    orig,
                    CSOSN: '101',
                    pCredSN: item.imposto?.ICMS?.pCredSN || 0,
                    vCredICMSSN: 0
                };
                icms.ICMSSN101.vCredICMSSN = (vBC * icms.ICMSSN101.pCredSN) / 100;
                break;

            case '102': // Tributada pelo Simples Nacional sem permissão de crédito
            case '103': // Isenção do ICMS no Simples Nacional para faixa de receita bruta
            case '300': // Imune
            case '400': // Não tributada pelo Simples Nacional
                icms[`ICMSSN${csosn}`] = {
                    orig,
                    CSOSN: csosn
                };
                break;

            case '201': // Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por substituição tributária
                icms.ICMSSN201 = {
                    orig,
                    CSOSN: '201',
                    modBCST: item.imposto?.ICMS?.modBCST || 4,
                    pMVAST: item.imposto?.ICMS?.pMVAST || 0,
                    pRedBCST: item.imposto?.ICMS?.pRedBCST || 0,
                    vBCST: 0,
                    pICMSST: item.imposto?.ICMS?.pICMSST || 0,
                    vICMSST: 0,
                    pCredSN: item.imposto?.ICMS?.pCredSN || 0,
                    vCredICMSSN: 0
                };

                // Crédito SN
                icms.ICMSSN201.vCredICMSSN = (vBC * icms.ICMSSN201.pCredSN) / 100;

                // Cálculo ST
                let baseST201 = vBC * (1 + (icms.ICMSSN201.pMVAST / 100));
                if (icms.ICMSSN201.pRedBCST > 0) {
                    baseST201 = baseST201 * (1 - (icms.ICMSSN201.pRedBCST / 100));
                }
                icms.ICMSSN201.vBCST = baseST201;

                // OBS: No Simples, geralmente não se deduz o ICMS próprio no cálculo do ST da mesma forma, 
                // mas depende da legislação estadual. O padrão é deduzir o ICMS que seria devido se fosse regime normal.
                // Vamos assumir que pICMS (interno) foi passado para cálculo do ST
                const pICMSInter = item.imposto?.ICMS?.pICMS || 18; // Default 18% se não informado
                const vICMSProprioFicticio = (vBC * pICMSInter) / 100;

                icms.ICMSSN201.vICMSST = (baseST201 * icms.ICMSSN201.pICMSST / 100) - vICMSProprioFicticio;
                if (icms.ICMSSN201.vICMSST < 0) icms.ICMSSN201.vICMSST = 0;
                break;

            case '202': // Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por substituição tributária
            case '203': // Isenção do ICMS no Simples Nacional para faixa de receita bruta e com cobrança do ICMS por substituição tributária
                icms[`ICMSSN${csosn}`] = {
                    orig,
                    CSOSN: csosn,
                    modBCST: item.imposto?.ICMS?.modBCST || 4,
                    pMVAST: item.imposto?.ICMS?.pMVAST || 0,
                    pRedBCST: item.imposto?.ICMS?.pRedBCST || 0,
                    vBCST: 0,
                    pICMSST: item.imposto?.ICMS?.pICMSST || 0,
                    vICMSST: 0
                };

                // Cálculo ST (Similar ao 201 mas sem crédito SN)
                let baseST202 = vBC * (1 + (icms[`ICMSSN${csosn}`].pMVAST / 100));
                if (icms[`ICMSSN${csosn}`].pRedBCST > 0) {
                    baseST202 = baseST202 * (1 - (icms[`ICMSSN${csosn}`].pRedBCST / 100));
                }
                icms[`ICMSSN${csosn}`].vBCST = baseST202;

                const pICMSInter202 = item.imposto?.ICMS?.pICMS || 18;
                const vICMSProprioFicticio202 = (vBC * pICMSInter202) / 100;

                icms[`ICMSSN${csosn}`].vICMSST = (baseST202 * icms[`ICMSSN${csosn}`].pICMSST / 100) - vICMSProprioFicticio202;
                if (icms[`ICMSSN${csosn}`].vICMSST < 0) icms[`ICMSSN${csosn}`].vICMSST = 0;
                break;

            case '500': // ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação
                icms.ICMSSN500 = {
                    orig,
                    CSOSN: '500',
                    vBCSTRet: item.imposto?.ICMS?.vBCSTRet || 0,
                    pST: item.imposto?.ICMS?.pST || 0,
                    vICMSSTRet: item.imposto?.ICMS?.vICMSSTRet || 0,
                };
                break;

            case '900': // Outros
                icms.ICMSSN900 = {
                    orig,
                    CSOSN: '900',
                    modBC: item.imposto?.ICMS?.modBC || 3,
                    vBC: vBC,
                    pICMS: item.imposto?.ICMS?.pICMS || 0,
                    vICMS: 0,
                    modBCST: item.imposto?.ICMS?.modBCST || 4,
                    pMVAST: item.imposto?.ICMS?.pMVAST || 0,
                    vBCST: 0,
                    pICMSST: item.imposto?.ICMS?.pICMSST || 0,
                    vICMSST: 0,
                    pCredSN: item.imposto?.ICMS?.pCredSN || 0,
                    vCredICMSSN: 0
                };

                if (icms.ICMSSN900.pICMS > 0) {
                    icms.ICMSSN900.vICMS = (icms.ICMSSN900.vBC * icms.ICMSSN900.pICMS) / 100;
                }
                if (icms.ICMSSN900.pCredSN > 0) {
                    icms.ICMSSN900.vCredICMSSN = (vBC * icms.ICMSSN900.pCredSN) / 100;
                }
                // ST se houver
                if (icms.ICMSSN900.pICMSST > 0) {
                    let baseST900 = vBC * (1 + (icms.ICMSSN900.pMVAST / 100));
                    icms.ICMSSN900.vBCST = baseST900;
                    icms.ICMSSN900.vICMSST = (baseST900 * icms.ICMSSN900.pICMSST / 100) - (icms.ICMSSN900.vICMS || 0);
                }
                break;

            default:
                console.warn(`CSOSN ${csosn} não implementado. Usando estrutura padrão.`);
                icms[`ICMSSN${csosn}`] = { orig, CSOSN: csosn };
                break;
        }

        return icms;
    }
}

module.exports = ICMSSimplesStrategy;
