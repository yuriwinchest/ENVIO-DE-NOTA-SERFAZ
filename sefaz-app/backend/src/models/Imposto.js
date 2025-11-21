class Imposto {
    constructor(data) {
        this.vTotTrib = data.vTotTrib; // Valor aproximado dos tributos
        this.ICMS = data.ICMS || {};
        this.IPI = data.IPI || {};
        this.II = data.II || {};
        this.PIS = data.PIS || {};
        this.COFINS = data.COFINS || {};
        this.ISSQN = data.ISSQN || {};
        this.ICMSUFDest = data.ICMSUFDest || {};
    }

    // Métodos para cálculo de impostos podem ser adicionados aqui ou em um serviço específico
    // Exemplo: calcularICMS(dados) { ... }
}

module.exports = Imposto;
