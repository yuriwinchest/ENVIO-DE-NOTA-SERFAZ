const Imposto = require('./Imposto');

class Item {
    constructor(data) {
        this.nItem = data.nItem; // Número do item (1-990)
        const prod = data.prod || {};
        this.prod = {
            cProd: prod.cProd || data.cProd,
            cEAN: prod.cEAN || data.cEAN || 'SEM GTIN',
            xProd: prod.xProd || data.xProd,
            NCM: prod.NCM || data.NCM,
            cBenef: prod.cBenef || data.cBenef,
            EXTIPI: prod.EXTIPI || data.EXTIPI,
            CFOP: prod.CFOP || data.CFOP,
            uCom: prod.uCom || data.uCom,
            qCom: prod.qCom || data.qCom,
            vUnCom: prod.vUnCom || data.vUnCom,
            vProd: prod.vProd || data.vProd,
            cEANTrib: prod.cEANTrib || data.cEANTrib || 'SEM GTIN',
            uTrib: prod.uTrib || data.uTrib,
            qTrib: prod.qTrib || data.qTrib,
            vUnTrib: prod.vUnTrib || data.vUnTrib,
            vFrete: prod.vFrete || data.vFrete,
            vSeg: prod.vSeg || data.vSeg,
            vDesc: prod.vDesc || data.vDesc,
            vOutro: prod.vOutro || data.vOutro,
            indTot: prod.indTot || data.indTot || 1,
            xPed: prod.xPed || data.xPed,
            nItemPed: prod.nItemPed || data.nItemPed,
            nFCI: prod.nFCI || data.nFCI,
        };

        this.imposto = new Imposto(data.imposto || {});
        this.infAdProd = data.infAdProd; // Informações Adicionais do Produto
    }
}

module.exports = Item;
