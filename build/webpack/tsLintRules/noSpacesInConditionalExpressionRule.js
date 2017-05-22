var ts = require('typescript');
var Lint = require('tslint');

function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function (syntaxTree) {
    return this.applyWithWalker(new NoSpacesInConditionalExpressionWalker(syntaxTree, this.getOptions()));
};

function NoSpacesInConditionalExpressionWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

NoSpacesInConditionalExpressionWalker.prototype = Object.create(Lint.RuleWalker.prototype);

NoSpacesInConditionalExpressionWalker.prototype.detectWhiteSpaces = function (node) {
    var scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, node.getText());

    var prevTokenType = null;
    var tokenType = null;
    var nextTokenType = null;

    var prevTokenText = null;
    var tokenText = null;
    var nextTokenText = null;

    while (nextTokenType !== ts.SyntaxKind.EndOfFileToken) {
        scanner.scan();
        prevTokenType = tokenType;
        tokenType = nextTokenType;
        nextTokenType = scanner.getToken();

        prevTokenText = tokenText;
        tokenText = nextTokenText;
        nextTokenText = scanner.getTokenText();

        if (prevTokenType === ts.SyntaxKind.OpenParenToken && tokenText === ' ' && nextTokenType === ts.SyntaxKind.ExclamationToken) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "Conditional Expression has a whitespace before exclamation token"));
            return;
        }

        if (prevTokenType === ts.SyntaxKind.ExclamationToken && tokenText === ' ') {
            console.log(scanner.getTokenText());
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "Conditional Expression has a whitespace after exclamation token"));
            return;
        }

        if (prevTokenText === ' ' && tokenType === ts.SyntaxKind.CloseParenToken) {
            console.log(scanner.getTokenText());
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "Conditional Expression has a whitespace before close parenthesis"));
            return;
        }

        if (prevTokenType === ts.SyntaxKind.OpenParenToken && tokenText === ' ') {
            console.log(scanner.getTokenText());
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "Conditional Expression has a whitespace after open parenthesis"));
            return;
        }
    }
};

NoSpacesInConditionalExpressionWalker.prototype.visitIfStatement = function (node) {
    this.detectWhiteSpaces(node);
    Lint.RuleWalker.prototype.visitIfStatement.call(this, node);
    return;
};

exports.Rule = Rule;
