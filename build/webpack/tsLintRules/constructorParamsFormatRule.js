var ts = require('typescript');
var Lint = require('tslint');

function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function (syntaxTree) {
    return this.applyWithWalker(new ConstructorParamsFormatWalker(syntaxTree, this.getOptions()));
};

function ConstructorParamsFormatWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

ConstructorParamsFormatWalker.prototype = Object.create(Lint.RuleWalker.prototype);

ConstructorParamsFormatWalker.prototype.visitConstructorDeclaration = function (node) {

    if (node.parameters && node.parameters.length) {
        var constructorParams = node.getText().substring(node.getText().indexOf('(') + 1, node.getText().indexOf(')'));

        // constructorParams first character should be newline
        if (!constructorParams.match(new RegExp('^\r\n?|\n'))) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "Constructor parameters must be on a newline"));
            Lint.RuleWalker.prototype.visitConstructorDeclaration.call(this, node);
            return;
        }

        var allParams = constructorParams.split(new RegExp('\r\n?|\n'));
        allParams.shift();

        // constructorParams last character should be newline
        if (allParams[allParams.length - 1].trim() !== '') {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "Constructor parameters close bracket must be on a newline"));
            Lint.RuleWalker.prototype.visitConstructorDeclaration.call(this, node);
            return;
        }
        allParams.pop();
        var correctPadding = true;

        //should have 4 spaces before each param
        allParams.forEach(function (param) {
            correctPadding = correctPadding
                && (param.indexOf('        ') > -1)
                && (param.indexOf('         ') === -1);
        });

        if (!correctPadding) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(),
                "Constructor parameters must all be indented correctly"));
            Lint.RuleWalker.prototype.visitConstructorDeclaration.call(this, node);
            return;
        }
    }
    Lint.RuleWalker.prototype.visitConstructorDeclaration.call(this, node);
};

exports.Rule = Rule;
