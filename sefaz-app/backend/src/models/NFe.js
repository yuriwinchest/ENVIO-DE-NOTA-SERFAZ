/**
 * Modelo de dados da NFe (Nota Fiscal Eletrônica)
 * Baseado no Manual de Integração do Contribuinte v6.00
 */

class NFe {
    constructor() {
        this.infNFe = {
            ide: {}, // Identificação da NFe
            emit: {}, // Emitente
            dest: {}, // Destinatário
            det: [], // Detalhes (Itens)
            total: {}, // Totais
            transp: {}, // Transporte
            cobr: {}, // Cobrança
            pag: {}, // Pagamento
            infAdic: {}, // Informações Adicionais
            exporta: {}, // Exportação
            compra: {}, // Compra
            cana: {}, // Cana
        };
    }
}

module.exports = NFe;
