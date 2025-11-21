const ICMSStrategyFactory = require('./strategies/tax/icms/ICMSStrategyFactory');
const IPIStrategy = require('./strategies/tax/ipi/IPIStrategy');
const PisCofinsStrategy = require('./strategies/tax/piscofins/PisCofinsStrategy');

class ImpostoService {
    constructor() {
        this.ipiStrategy = new IPIStrategy();
        this.pisCofinsStrategy = new PisCofinsStrategy();
    }

    /**
     * Calcula os impostos de um item
     * @param {Object} item - Dados do item
     * @param {Object} emitente - Dados do emitente
     * @param {Object} destinatario - Dados do destinatário
     * @returns {Object} Objeto com os impostos calculados
     */
    calcularImpostos(item, emitente, destinatario) {
        const impostos = {
            vTotTrib: 0,
            ICMS: {},
            IPI: {},
            PIS: {},
            COFINS: {},
            II: {},
            ISSQN: {},
            ICMSUFDest: {},
        };

        const context = { emitente, destinatario };

        // 1. Calcular ICMS (Normal ou Simples)
        const crt = emitente.CRT; // 1=Simples, 3=Normal
        const icmsStrategy = ICMSStrategyFactory.getStrategy(crt);
        impostos.ICMS = icmsStrategy.calculate(item, context);

        // 2. Calcular IPI
        impostos.IPI = this.ipiStrategy.calculate(item, context);

        // 3. Calcular PIS/COFINS
        const pisCofins = this.pisCofinsStrategy.calculate(item, context);
        impostos.PIS = pisCofins.PIS;
        impostos.COFINS = pisCofins.COFINS;

        const vBC = parseFloat(item.prod.vProd || 0);
        const issAliq = parseFloat(item.imposto?.ISSQN?.vAliq || 0);
        if (issAliq > 0 || item.imposto?.ISSQN) {
            impostos.ISSQN = {
                vBC: vBC,
                vAliq: issAliq || 0,
                vISSQN: +(vBC * (issAliq || 0) / 100).toFixed(2),
                cListServ: item.imposto?.ISSQN?.cListServ || '01.01',
                indISS: item.imposto?.ISSQN?.indISS || 1,
                indIncentivo: item.imposto?.ISSQN?.indIncentivo || 2,
                cMunFG: emitente?.enderEmit?.cMun || undefined,
            };
        }

        const uf = item.imposto?.ICMSUFDest || {};
        const vBCUFDest = parseFloat(uf.vBCUFDest ?? vBC);
        const pFCPUFDest = parseFloat(uf.pFCPUFDest || 0);
        const pICMSUFDest = parseFloat(uf.pICMSUFDest || 0);
        const pICMSInter = parseFloat(uf.pICMSInter || 0);
        if (pFCPUFDest > 0 || pICMSUFDest > 0 || pICMSInter > 0 || Object.keys(uf).length) {
            const vFCPUFDest = +(vBCUFDest * pFCPUFDest / 100).toFixed(2);
            const difal = Math.max(pICMSUFDest - pICMSInter, 0);
            const vICMSUFDest = +(vBCUFDest * difal / 100).toFixed(2);
            const vICMSUFRemet = +(vBCUFDest * pICMSInter / 100).toFixed(2);
            impostos.ICMSUFDest = {
                vBCUFDest,
                pFCPUFDest,
                pICMSUFDest,
                pICMSInter,
                vFCPUFDest,
                vICMSUFDest,
                vICMSUFRemet,
            };
        }

        // TODO: Calcular vTotTrib (Lei da Transparência)

        return impostos;
    }
}

module.exports = new ImpostoService();
