class Destinatario {
    constructor(data) {
        this.CNPJ = data.CNPJ;
        this.CPF = data.CPF;
        this.idEstrangeiro = data.idEstrangeiro;
        this.xNome = data.xNome;
        const ender = data.enderDest || {};
        this.enderDest = {
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
        this.indIEDest = data.indIEDest; // Indicador da IE do Destinatário
        this.IE = data.IE;
        this.ISUF = data.ISUF;
        this.IM = data.IM;
        this.email = data.email;
    }
}

module.exports = Destinatario;
