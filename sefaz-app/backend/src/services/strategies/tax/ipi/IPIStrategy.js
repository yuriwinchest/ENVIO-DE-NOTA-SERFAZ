const TaxCalculatorStrategy = require('../TaxCalculatorStrategy');

class IPIStrategy extends TaxCalculatorStrategy {
    calculate(item, context) {
        const ipi = {};
        const cst = item.imposto?.IPI?.CST || '50'; // Default 50 - Saída Tributada
        const clEnq = item.imposto?.IPI?.clEnq || null;
        const cEnq = item.imposto?.IPI?.cEnq || '999';
        const cSelo = item.imposto?.IPI?.cSelo || null;
        const qSelo = item.imposto?.IPI?.qSelo || null;

        // CSTs tributados: 00, 49, 50, 99
        if (['00', '49', '50', '99'].includes(cst)) {
            ipi.IPITrib = {
                CST: cst,
                clEnq,
                cEnq,
                cSelo,
                qSelo
            };

            // Cálculo por Alíquota
            if (item.imposto?.IPI?.pIPI) {
                ipi.IPITrib.vBC = item.prod.vProd; // TODO: Adicionar frete/seguro se necessário
                ipi.IPITrib.pIPI = item.imposto.IPI.pIPI;
                ipi.IPITrib.vIPI = (ipi.IPITrib.vBC * ipi.IPITrib.pIPI) / 100;
            }
            // Cálculo por Unidade
            else if (item.imposto?.IPI?.vUnid && item.imposto?.IPI?.qUnid) {
                ipi.IPITrib.qUnid = item.imposto.IPI.qUnid;
                ipi.IPITrib.vUnid = item.imposto.IPI.vUnid;
                ipi.IPITrib.vIPI = ipi.IPITrib.qUnid * ipi.IPITrib.vUnid;
            } else {
                // Default zero se não tiver dados suficientes
                ipi.IPITrib.vBC = item.prod.vProd;
                ipi.IPITrib.pIPI = 0;
                ipi.IPITrib.vIPI = 0;
            }
        }
        // CSTs não tributados: 01, 02, 03, 04, 05, 51, 52, 53, 54, 55
        else {
            ipi.IPINT = { CST: cst };
        }

        return ipi;
    }
}

module.exports = IPIStrategy;
