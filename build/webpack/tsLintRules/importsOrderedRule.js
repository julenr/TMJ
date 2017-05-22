// REMOVING LINT RULE FOR NOW, WILL FIX SOONh:
//
//
// var ts = require('typescript');
// var Lint = require('tslint/lib/lint');
//
// function Rule() {
//     Lint.Rules.AbstractRule.apply(this, arguments);
// }
//
// Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
// Rule.prototype.apply = function (syntaxTree) {
//     return this.applyWithWalker(new ImportsOrderWalker(syntaxTree, this.getOptions()));
// };
// function ImportsOrderWalker() {
//     Lint.RuleWalker.apply(this, arguments);
// }
//
// ImportsOrderWalker.prototype = Object.create(Lint.RuleWalker.prototype);
//
// ImportsOrderWalker.prototype.visitSourceFile = function (node) {
//     var fileContentArray = node.text.split(new RegExp('^\r\n?|\n'));
//
//     var areInBlockOfImports = false;
//     var wrongOrder = null;
//     var importsBlock = [];
//     var i;
//     for (i = 0; i < fileContentArray.length; i++) {
//         var row = fileContentArray[i];
//
//         if (areInBlockOfImports) {
//
//             if (isImportStatement(row)) {
//                 importsBlock.push(row);
//             } else {
//                 areInBlockOfImports = false;
//
//                 if (importsBlock.length && !isArraySorted(importsBlock)) {
//                     this.addFailure(this.createFailure(node.getStart(), node.getWidth(),
//                         'Lists of import statements must be ordered alphabetically - ' + wrongOrder[0] + ' should come before ' + wrongOrder[1]));
//                 }
//             }
//
//         } else {
//             if (isComment(row)) {
//                 areInBlockOfImports = true;
//                 importsBlock = [];
//             }
//         }
//     }
//
//     function isImportStatement (statement) {
//         return statement.indexOf('import ') === 0;
//     }
//
//     function isComment(statement) {
//         return statement.indexOf('//') === 0;
//     }
//
//     function isArraySorted (arr) {
//         var j;
//         for (j = 0; j < arr.length - 1; j++) {
//             if (arr[j].localeCompare(arr[j + 1]) > 0) {
//                 wrongOrder = [arr[j + 1], arr[j]];
//                 return false;
//             }
//         }
//         return true;
//     }
//
//     Lint.RuleWalker.prototype.visitSourceFile.call(this, node);
// };
//
// exports.Rule = Rule;
