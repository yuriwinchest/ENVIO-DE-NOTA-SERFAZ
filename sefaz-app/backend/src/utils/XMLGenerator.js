const { create } = require('xmlbuilder2');

class XMLGenerator {
    /**
     * Gera o XML da NFe a partir do objeto de dados
     * @param {Object} nfeData - Objeto NFe preenchido
     * @returns {string} XML assinado (ou apenas gerado se não houver assinatura ainda)
     */
    generateXML(nfeData) {
        const doc = create({ version: '1.0', encoding: 'UTF-8' });
        const nfeNode = doc.ele('NFe', { xmlns: 'http://www.portalfiscal.inf.br/nfe' });
        const infNFeNode = nfeNode.ele('infNFe', { Id: `NFe${nfeData.infNFe.ide.cNF}`, versao: '4.00' });

        // 1. Identificação
        this.buildIde(infNFeNode, nfeData.infNFe.ide);

        // 2. Emitente
        this.buildEmit(infNFeNode, nfeData.infNFe.emit);

        // 3. Destinatário
        this.buildDest(infNFeNode, nfeData.infNFe.dest);

        // 4. Detalhes (Itens)
        nfeData.infNFe.det.forEach((item, index) => {
            this.buildDet(infNFeNode, item, index);
        });

        // 5. Totais
        this.buildTotal(infNFeNode, nfeData.infNFe.total);

        // 6. Transporte
        this.buildTransp(infNFeNode, nfeData.infNFe.transp);

        // 7. Pagamento
        this.buildPag(infNFeNode, nfeData.infNFe.pag);

        // 8. Informações Adicionais
        this.buildInfAdic(infNFeNode, nfeData.infNFe.infAdic);

        return doc.end({ prettyPrint: true });
    }

    buildIde(root, ide) {
        const node = root.ele('ide');
        node.ele('cUF').txt(ide.cUF);
        node.ele('cNF').txt(ide.cNF);
        node.ele('natOp').txt(ide.natOp);
        node.ele('mod').txt(ide.mod);
        node.ele('serie').txt(ide.serie);
        node.ele('nNF').txt(ide.nNF);
        node.ele('dhEmi').txt(ide.dhEmi);
        node.ele('tpNF').txt(ide.tpNF);
        node.ele('idDest').txt(ide.idDest);
        node.ele('cMunFG').txt(ide.cMunFG);
        node.ele('tpImp').txt(ide.tpImp);
        node.ele('tpEmis').txt(ide.tpEmis);
        node.ele('cDV').txt(ide.cDV);
        node.ele('tpAmb').txt(ide.tpAmb);
        node.ele('finNFe').txt(ide.finNFe);
        node.ele('indFinal').txt(ide.indFinal);
        node.ele('indPres').txt(ide.indPres);
        node.ele('procEmi').txt(ide.procEmi);
        node.ele('verProc').txt(ide.verProc);
    }

    buildEmit(root, emit) {
        const node = root.ele('emit');
        node.ele('CNPJ').txt(emit.CNPJ);
        node.ele('xNome').txt(emit.xNome);
        if (emit.xFant) node.ele('xFant').txt(emit.xFant);

        const ender = node.ele('enderEmit');
        ender.ele('xLgr').txt(emit.enderEmit.xLgr);
        ender.ele('nro').txt(emit.enderEmit.nro);
        if (emit.enderEmit.xCpl) ender.ele('xCpl').txt(emit.enderEmit.xCpl);
        ender.ele('xBairro').txt(emit.enderEmit.xBairro);
        ender.ele('cMun').txt(emit.enderEmit.cMun);
        ender.ele('xMun').txt(emit.enderEmit.xMun);
        ender.ele('UF').txt(emit.enderEmit.UF);
        ender.ele('CEP').txt(emit.enderEmit.CEP);
        ender.ele('cPais').txt(emit.enderEmit.cPais);
        ender.ele('xPais').txt(emit.enderEmit.xPais);
        if (emit.enderEmit.fone) ender.ele('fone').txt(emit.enderEmit.fone);

        node.ele('IE').txt(emit.IE);
        node.ele('CRT').txt(emit.CRT);
    }

    buildDest(root, dest) {
        const node = root.ele('dest');
        if (dest.CNPJ) node.ele('CNPJ').txt(dest.CNPJ);
        if (dest.CPF) node.ele('CPF').txt(dest.CPF);
        node.ele('xNome').txt(dest.xNome);

        const ender = node.ele('enderDest');
        ender.ele('xLgr').txt(dest.enderDest.xLgr);
        ender.ele('nro').txt(dest.enderDest.nro);
        if (dest.enderDest.xCpl) ender.ele('xCpl').txt(dest.enderDest.xCpl);
        ender.ele('xBairro').txt(dest.enderDest.xBairro);
        ender.ele('cMun').txt(dest.enderDest.cMun);
        ender.ele('xMun').txt(dest.enderDest.xMun);
        ender.ele('UF').txt(dest.enderDest.UF);
        ender.ele('CEP').txt(dest.enderDest.CEP);
        ender.ele('cPais').txt(dest.enderDest.cPais);
        ender.ele('xPais').txt(dest.enderDest.xPais);
        if (dest.enderDest.fone) ender.ele('fone').txt(dest.enderDest.fone);

        node.ele('indIEDest').txt(dest.indIEDest);
        if (dest.IE) node.ele('IE').txt(dest.IE);
        if (dest.email) node.ele('email').txt(dest.email);
    }

    buildDet(root, item, index) {
        const node = root.ele('det', { nItem: index + 1 });
        const prod = node.ele('prod');
        prod.ele('cProd').txt(item.prod.cProd);
        prod.ele('cEAN').txt(item.prod.cEAN);
        prod.ele('xProd').txt(item.prod.xProd);
        prod.ele('NCM').txt(item.prod.NCM);
        prod.ele('CFOP').txt(item.prod.CFOP);
        prod.ele('uCom').txt(item.prod.uCom);
        prod.ele('qCom').txt(item.prod.qCom);
        prod.ele('vUnCom').txt(item.prod.vUnCom);
        prod.ele('vProd').txt(item.prod.vProd);
        prod.ele('cEANTrib').txt(item.prod.cEANTrib);
        prod.ele('uTrib').txt(item.prod.uTrib);
        prod.ele('qTrib').txt(item.prod.qTrib);
        prod.ele('vUnTrib').txt(item.prod.vUnTrib);
        prod.ele('indTot').txt(item.prod.indTot);

        const imposto = node.ele('imposto');

        // ICMS
        const icms = imposto.ele('ICMS');
        if (item.imposto && item.imposto.ICMS) {
            const icmsKeys = Object.keys(item.imposto.ICMS);
            // Pega a primeira chave que parece ser um grupo de ICMS (ex: ICMS00, ICMSSN101)
            const icmsGroup = icmsKeys.find(k => k.startsWith('ICMS'));
            if (icmsGroup) {
                const i = item.imposto.ICMS[icmsGroup];
                const groupNode = icms.ele(icmsGroup);
                Object.keys(i).forEach(key => {
                    if (i[key] !== null && i[key] !== undefined) {
                        groupNode.ele(key).txt(i[key]);
                    }
                });
            }
        }

        // IPI
        if (item.imposto && item.imposto.IPI) {
            const ipi = imposto.ele('IPI');
            // Pode ser IPITrib ou IPINT
            const ipiGroup = Object.keys(item.imposto.IPI).find(k => k.startsWith('IPI'));
            if (ipiGroup) {
                const i = item.imposto.IPI[ipiGroup];
                const groupNode = ipi.ele(ipiGroup);
                Object.keys(i).forEach(key => {
                    if (i[key] !== null && i[key] !== undefined) {
                        groupNode.ele(key).txt(i[key]);
                    }
                });
            }
        }

        // PIS
        const pis = imposto.ele('PIS');
        if (item.imposto && item.imposto.PIS) {
            const pisGroup = Object.keys(item.imposto.PIS).find(k => k.startsWith('PIS'));
            if (pisGroup) {
                const i = item.imposto.PIS[pisGroup];
                const groupNode = pis.ele(pisGroup);
                Object.keys(i).forEach(key => {
                    if (i[key] !== null && i[key] !== undefined) {
                        groupNode.ele(key).txt(i[key]);
                    }
                });
            }
        }

        // COFINS
        const cofins = imposto.ele('COFINS');
        if (item.imposto && item.imposto.COFINS) {
            const cofinsGroup = Object.keys(item.imposto.COFINS).find(k => k.startsWith('COFINS'));
            if (cofinsGroup) {
                const i = item.imposto.COFINS[cofinsGroup];
                const groupNode = cofins.ele(cofinsGroup);
                Object.keys(i).forEach(key => {
                    if (i[key] !== null && i[key] !== undefined) {
                        groupNode.ele(key).txt(i[key]);
                    }
                });
            }
        }

        if (item.imposto && item.imposto.ISSQN && Object.keys(item.imposto.ISSQN).length) {
            const issqn = imposto.ele('ISSQN');
            Object.keys(item.imposto.ISSQN).forEach(key => {
                const val = item.imposto.ISSQN[key];
                if (val !== null && val !== undefined) {
                    issqn.ele(key).txt(val);
                }
            });
        }

        if (item.imposto && item.imposto.ICMSUFDest && Object.keys(item.imposto.ICMSUFDest).length) {
            const ufDest = imposto.ele('ICMSUFDest');
            Object.keys(item.imposto.ICMSUFDest).forEach(key => {
                const val = item.imposto.ICMSUFDest[key];
                if (val !== null && val !== undefined) {
                    ufDest.ele(key).txt(val);
                }
            });
        }
    }

    buildTotal(root, total) {
        const totalNode = root.ele('total');
        const icmsTot = totalNode.ele('ICMSTot');
        icmsTot.ele('vBC').txt(total.ICMSTot.vBC);
        icmsTot.ele('vICMS').txt(total.ICMSTot.vICMS);
        icmsTot.ele('vICMSDeson').txt(0.00);
        icmsTot.ele('vFCP').txt(0.00);
        icmsTot.ele('vBCST').txt(total.ICMSTot.vBCST);
        icmsTot.ele('vST').txt(total.ICMSTot.vST);
        icmsTot.ele('vFCPST').txt(0.00);
        icmsTot.ele('vFCPSTRet').txt(0.00);
        icmsTot.ele('vProd').txt(total.ICMSTot.vProd);
        icmsTot.ele('vFrete').txt(total.ICMSTot.vFrete);
        icmsTot.ele('vSeg').txt(total.ICMSTot.vSeg);
        icmsTot.ele('vDesc').txt(total.ICMSTot.vDesc);
        icmsTot.ele('vII').txt(total.ICMSTot.vII);
        icmsTot.ele('vIPI').txt(total.ICMSTot.vIPI);
        icmsTot.ele('vIPIDevol').txt(0.00);
        icmsTot.ele('vPIS').txt(total.ICMSTot.vPIS);
        icmsTot.ele('vCOFINS').txt(total.ICMSTot.vCOFINS);
        icmsTot.ele('vOutro').txt(total.ICMSTot.vOutro);
        icmsTot.ele('vNF').txt(total.ICMSTot.vNF);

        if (total.ISSQNtot) {
            const issTot = totalNode.ele('ISSQNtot');
            if (total.ISSQNtot.vServ !== undefined) issTot.ele('vServ').txt(total.ISSQNtot.vServ);
            if (total.ISSQNtot.vBC !== undefined) issTot.ele('vBC').txt(total.ISSQNtot.vBC);
            if (total.ISSQNtot.vISS !== undefined) issTot.ele('vISS').txt(total.ISSQNtot.vISS);
            if (total.ISSQNtot.vPIS !== undefined) issTot.ele('vPIS').txt(total.ISSQNtot.vPIS);
            if (total.ISSQNtot.vCOFINS !== undefined) issTot.ele('vCOFINS').txt(total.ISSQNtot.vCOFINS);
            if (total.ISSQNtot.vDeducao !== undefined) issTot.ele('vDeducao').txt(total.ISSQNtot.vDeducao);
            if (total.ISSQNtot.vOutro !== undefined) issTot.ele('vOutro').txt(total.ISSQNtot.vOutro);
            if (total.ISSQNtot.vDescIncond !== undefined) issTot.ele('vDescIncond').txt(total.ISSQNtot.vDescIncond);
            if (total.ISSQNtot.vDescCond !== undefined) issTot.ele('vDescCond').txt(total.ISSQNtot.vDescCond);
            if (total.ISSQNtot.vISSRet !== undefined) issTot.ele('vISSRet').txt(total.ISSQNtot.vISSRet);
            if (total.ISSQNtot.cRegTrib !== undefined) issTot.ele('cRegTrib').txt(total.ISSQNtot.cRegTrib);
        }
    }

    buildTransp(root, transp) {
        const node = root.ele('transp');
        node.ele('modFrete').txt(transp.modFrete);
    }

    buildPag(root, pag) {
        const node = root.ele('pag');
        pag.detPag.forEach(det => {
            const d = node.ele('detPag');
            d.ele('tPag').txt(det.tPag);
            d.ele('vPag').txt(det.vPag);
        });
    }

    buildInfAdic(root, infAdic) {
        const node = root.ele('infAdic');
        if (infAdic.infCpl) node.ele('infCpl').txt(infAdic.infCpl);
    }
}

module.exports = new XMLGenerator();
