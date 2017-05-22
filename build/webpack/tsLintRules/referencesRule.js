var ts = require('typescript');
var Lint = require('tslint');

function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function (syntaxTree) {
    return this.applyWithWalker(new ReferencesWalker(syntaxTree, this.getOptions()));
};

function ReferencesWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

ReferencesWalker.prototype = Object.create(Lint.RuleWalker.prototype);

ReferencesWalker.prototype.visitSourceFile = function (node) {
    var fileContentArray = node.text.split(new RegExp('^\r\n?|\n'));

    if (fileContentArray[0].indexOf('/// <reference path="') !== 0
        && fileContentArray[0].indexOf('_references.d.ts') === -1) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(),
            "A reference to '_references.d.ts' must be included as the first line of the file"));
    }
    Lint.RuleWalker.prototype.visitSourceFile.call(this, node);
};

exports.Rule = Rule;
