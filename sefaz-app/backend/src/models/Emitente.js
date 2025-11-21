class Emitente {
    constructor(data) {
        this.CNPJ = data.CNPJ;
        this.CPF = data.CPF;
        this.xNome = data.xNome;
        this.xFant = data.xFant;
        const ender = data.enderEmit || {};
        this.enderEmit = {
            xLgr: ender.xLgr || data.xLgr,
            nro: ender.nro || data.nro,
            xCpl: ender.xCpl || data.xCpl,
            xBairro: ender.xBairro || data.xBairro,
            cMun: ender.cMun || data.cMun,
            xMun: ender.xMun || data.xMun,
            UF: ender.UF || data.UF,
            CEP: ender.CEP || data.CEP,
            cPais: ender.cPais || data.cPais,
            xPais: ender.xPais || data.xPais,
            fone: ender.fone || data.fone,
        };
        this.IE = data.IE;
        this.IEST = data.IEST;
        this.IM = data.IM;
        this.CNAE = data.CNAE;
        this.CRT = data.CRT; // Código de Regime Tributário
    }
}

module.exports = Emitente;
