var ts = require('typescript');
var Lint = require('tslint');

function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function (syntaxTree) {
    return this.applyWithWalker(new NoToBeTruthyWalker(syntaxTree, this.getOptions()));
};
function NoToBeTruthyWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

NoToBeTruthyWalker.prototype = Object.create(Lint.RuleWalker.prototype);

NoToBeTruthyWalker.prototype.detectToBeThruthy = function (node) {
    var scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, node.getText());

    var tokenType = null;
    var tokenText = null;

    while (tokenType !== ts.SyntaxKind.EndOfFileToken) {
        scanner.scan();
        tokenType = scanner.getToken();
        tokenText = scanner.getTokenText();

        if (tokenType === ts.SyntaxKind.Identifier && tokenText === 'toBeTruthy') {
            this.addFailure(this.createFailure(scanner.getTextPos(), node.getWidth(), "Use toBe(true), toBeDefined(), toBeGreaterThan(), toBeLessThan() etc... instead of toBeTruthy"));
            return;
        }
    }
};

NoToBeTruthyWalker.prototype.visitSourceFile = function (node) {
    this.detectToBeThruthy(node);
    Lint.RuleWalker.prototype.visitSourceFile.call(this, node);
    return;
};

exports.Rule = Rule;
