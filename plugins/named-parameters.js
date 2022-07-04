const babelTypes = require('@babel/types')

const NamedParametersVisitor = {
    FunctionDeclaration(path){
        path.node.params.forEach((paramNode)=>{
            if(babelTypes.isIdentifier(paramNode)){
                console.log('Identifier')
            }if(babelTypes.isAssignmentPattern(paramNode)){
                console.log('Assigment Pattern');
            }
        })
        console.log(path.node)
    }
};

module.exports = () =>({
    visitor: NamedParametersVisitor
})
