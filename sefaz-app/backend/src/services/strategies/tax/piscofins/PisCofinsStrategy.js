const TaxCalculatorStrategy = require('../TaxCalculatorStrategy');

class PisCofinsStrategy extends TaxCalculatorStrategy {
    calculate(item, context) {
        const pis = {};
        const cofins = {};

        // PIS
        const cstPis = item.imposto?.PIS?.CST || '01';

        if (['01', '02'].includes(cstPis)) {
            pis.PISAliq = {
                CST: cstPis,
                vBC: item.prod.vProd,
                pPIS: item.imposto?.PIS?.pPIS || 1.65,
                vPIS: 0
            };
            pis.PISAliq.vPIS = (pis.PISAliq.vBC * pis.PISAliq.pPIS) / 100;
        } else if (cstPis === '03') {
            pis.PISQtde = {
                CST: cstPis,
                qBCProd: item.imposto?.PIS?.qBCProd || item.prod.qCom,
                vAliqProd: item.imposto?.PIS?.vAliqProd || 0,
                vPIS: 0
            };
            pis.PISQtde.vPIS = pis.PISQtde.qBCProd * pis.PISQtde.vAliqProd;
        } else if (['04', '05', '06', '07', '08', '09'].includes(cstPis)) {
            pis.PISNT = { CST: cstPis };
        } else if (['49', '50', '51', '52', '53', '54', '55', '56', '60', '61', '62', '63', '64', '65', '66', '67', '70', '71', '72', '73', '74', '75', '98', '99'].includes(cstPis)) {
            pis.PISOutr = {
                CST: cstPis,
                vBC: item.prod.vProd,
                pPIS: item.imposto?.PIS?.pPIS || 0,
                vPIS: 0
            };
            if (pis.PISOutr.pPIS > 0) {
                pis.PISOutr.vPIS = (pis.PISOutr.vBC * pis.PISOutr.pPIS) / 100;
            }
        }

        // COFINS
        const cstCofins = item.imposto?.COFINS?.CST || '01';

        if (['01', '02'].includes(cstCofins)) {
            cofins.COFINSAliq = {
                CST: cstCofins,
                vBC: item.prod.vProd,
                pCOFINS: item.imposto?.COFINS?.pCOFINS || 7.60,
                vCOFINS: 0
            };
            cofins.COFINSAliq.vCOFINS = (cofins.COFINSAliq.vBC * cofins.COFINSAliq.pCOFINS) / 100;
        } else if (cstCofins === '03') {
            cofins.COFINSQtde = {
                CST: cstCofins,
                qBCProd: item.imposto?.COFINS?.qBCProd || item.prod.qCom,
                vAliqProd: item.imposto?.COFINS?.vAliqProd || 0,
                vCOFINS: 0
            };
            cofins.COFINSQtde.vCOFINS = cofins.COFINSQtde.qBCProd * cofins.COFINSQtde.vAliqProd;
        } else if (['04', '05', '06', '07', '08', '09'].includes(cstCofins)) {
            cofins.COFINSNT = { CST: cstCofins };
        } else if (['49', '50', '51', '52', '53', '54', '55', '56', '60', '61', '62', '63', '64', '65', '66', '67', '70', '71', '72', '73', '74', '75', '98', '99'].includes(cstCofins)) {
            cofins.COFINSOutr = {
                CST: cstCofins,
                vBC: item.prod.vProd,
                pCOFINS: item.imposto?.COFINS?.pCOFINS || 0,
                vCOFINS: 0
            };
            if (cofins.COFINSOutr.pCOFINS > 0) {
                cofins.COFINSOutr.vCOFINS = (cofins.COFINSOutr.vBC * cofins.COFINSOutr.pCOFINS) / 100;
            }
        }

        return { PIS: pis, COFINS: cofins };
    }
}

module.exports = PisCofinsStrategy;
