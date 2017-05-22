var ts = require('typescript');
var Lint = require('tslint');

function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function (syntaxTree) {
    return this.applyWithWalker(new ConstructorParamsOrderWalker(syntaxTree, this.getOptions()));
};

function ConstructorParamsOrderWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

ConstructorParamsOrderWalker.prototype = Object.create(Lint.RuleWalker.prototype);

ConstructorParamsOrderWalker.prototype.visitConstructorDeclaration = function (node) {

    if (node.parameters && node.parameters.length) {
        var constructorParams = node.getText().substring(node.getText().indexOf('(') + 1, node.getText().indexOf(')'));

        var allParams = constructorParams.split(new RegExp('\r\n?|\n'));

        allParams.shift();
        allParams.pop();
        var publicParams = [];
        var protectedParams = [];
        var privateParams = [];
        var notSavedParams = [];
        var publicParamsOptional = [];
        var protectedParamsOptional = [];
        var privateParamsOptional = [];
        var notSavedParamsOptional = [];
        var properlyOrderedParams = [];

        //should have 4 spaces before each param
        allParams.forEach(function (param) {

            if (param.indexOf('?') > -1) {
                if (param.trim().indexOf('public') === 0) {
                    publicParamsOptional.push(param.trim());
                } else if (param.trim().indexOf('protected') === 0) {
                    protectedParamsOptional.push(param.trim());
                } else if (param.trim().indexOf('private') === 0) {
                    privateParamsOptional.push(param.trim());
                } else {
                    notSavedParamsOptional.push(param.trim());
                }
            } else {
                if (param.trim().indexOf('public') === 0) {
                    publicParams.push(param.trim());
                } else if (param.trim().indexOf('protected') === 0) {
                    protectedParams.push(param.trim());
                } else if (param.trim().indexOf('private') === 0) {
                    privateParams.push(param.trim());
                } else {
                    notSavedParams.push(param.trim());
                }
            }
        });

        publicParams.sort();
        protectedParams.sort();
        privateParams.sort();
        notSavedParams.sort();
        publicParamsOptional.sort();
        protectedParamsOptional.sort();
        privateParamsOptional.sort();
        notSavedParamsOptional.sort();

        var properlyOrdered = true;
        properlyOrderedParams = properlyOrderedParams.concat(
            publicParams,
            protectedParams,
            privateParams,
            notSavedParams,
            publicParamsOptional,
            protectedParamsOptional,
            privateParamsOptional,
            notSavedParamsOptional
        );

        // params must be ordered correctly:
        // public -> private -> not saved
        // they should be alphabetical in these sets
        allParams.forEach(function (param, idx) {
            properlyOrdered = properlyOrdered
                && properlyOrderedParams[idx] === param.trim();
        });

        if (!properlyOrdered) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(),
                "Constructor parameters must ordered public -> protected -> private -> not saved, and alphabetical in those groups"));
        }
    }
    Lint.RuleWalker.prototype.visitConstructorDeclaration.call(this, node);
};

exports.Rule = Rule;
