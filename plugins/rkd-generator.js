const bt = require("@babel/types");
let count = 0;
const fileName = 'assert/client-admin.js';
const RkdGeneratorVisitor = {


    CallExpression(path) {
        let rkdClassName = '';
        let rkdClassDefine = null;
        let rkdClassProps = [];
        let rkdClassMethods = [];
        if (
            bt.isMemberExpression(path.node.callee) &&
            bt.isIdentifier(path.node.callee.object, {name: 'Ext'}) &&
            bt.isIdentifier(path.node.callee.property, {name: 'define'}) &&
            bt.isStringLiteral(path.node.arguments[0])
        ) {
            rkdClassName = path.node.arguments[0].value;
            if (bt.isObjectExpression(path.node.arguments[1])) {
                rkdClassDefine = path.node.arguments[1];
            }
            if (rkdClassDefine) {
                rkdClassDefine.properties.forEach((prop) => {
                    if (bt.isStringLiteral(prop.value) || bt.isObjectProperty(prop.value)) {
                        rkdClassProps.push(prop.key.name);
                    }
                    if (bt.isFunctionExpression(prop.value)) {
                        rkdClassMethods.push(prop.key.name);
                    }
                })
                let classChildCount = 0;
                console.log([++count,fileName,rkdClassName,++classChildCount,'класс','Описание'].join(';'));
                rkdClassProps.forEach(prop=>console.log([++count,fileName,prop,++classChildCount,'свойство','Описание'].join(';')));
                rkdClassMethods.forEach(method=>console.log([++count,fileName,method,++classChildCount,'метод','Описание'].join(';')));

            }

        }


    }
};

module.exports = () => ({
    visitor: RkdGeneratorVisitor
})
