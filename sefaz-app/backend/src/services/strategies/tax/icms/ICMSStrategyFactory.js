const ICMSNormalStrategy = require('./ICMSNormalStrategy');
const ICMSSimplesStrategy = require('./ICMSSimplesStrategy');

class ICMSStrategyFactory {
    static getStrategy(crt) {
        // CRT 1 = Simples Nacional
        // CRT 2 = Simples Nacional - excesso de sublimite (trata como Normal para alguns efeitos, mas aqui vamos simplificar)
        // CRT 3 = Regime Normal

        if (crt === '1' || crt === 1) {
            return new ICMSSimplesStrategy();
        } else {
            return new ICMSNormalStrategy();
        }
    }
}

module.exports = ICMSStrategyFactory;
