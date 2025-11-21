class TaxCalculatorStrategy {
    constructor() { }

    /**
     * Calcula o imposto para um item específico
     * @param {Object} item - Dados do item
     * @param {Object} context - Contexto adicional (emitente, destinatário, etc.)
     * @returns {Object} Objeto com os dados do imposto calculado
     */
    calculate(item, context) {
        throw new Error('Method calculate() must be implemented');
    }
}

module.exports = TaxCalculatorStrategy;
