var ts = require('typescript');
var Lint = require('tslint');

function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function (syntaxTree) {
    return this.applyWithWalker(new NoForInOnArrayWalker(syntaxTree, this.getOptions()));
};

function NoForInOnArrayWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

NoForInOnArrayWalker.prototype = Object.create(Lint.RuleWalker.prototype);

var tokens = {
    '[': 74,
    ']': 75
};

NoForInOnArrayWalker.prototype.visitForInStatement = function (node) {
    var isArrayExpression = (function () {
        var x = node.expression;
        return x && x.openBracketToken && x.openBracketToken.tokenKind === tokens['['] && x.openBracketToken && x.closeBracketToken.tokenKind === tokens[']'];
    })();
    if (isArrayExpression) {
        var position = this.position() + node.leadingTriviaWidth();
        this.addFailure(this.createFailure(position, node.width(), "Don't use `for ... in` on an Array."));
    }
    Lint.RuleWalker.prototype.visitForInStatement.call(this, node);
};

exports.Rule = Rule;
