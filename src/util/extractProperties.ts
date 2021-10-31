export {};
import * as ts from "typescript";
import * as path from "path";

const BASEPATH = 'E:\\Projects\\Webapps\\pulumiLayer\\node_modules\\@pulumi';


const propertyFinder = (modulePath:string)=>{
    console.log(modulePath);
    const combinepath = path.join(BASEPATH,modulePath);
    console.log(combinepath);
    const program = ts.createProgram([combinepath], {allowJs: true});
    const sourceFile = program.getSourceFile(combinepath);
    const typeChecker = program.getTypeChecker()
    const properties:any ={};
    ts.forEachChild(sourceFile, node => {
        if (ts.isInterfaceDeclaration(node)) {

            if(node.name.text.indexOf('Args')!==-1) {
                for (const member of node.members) {
                    // @ts-ignore
                    const name = member.name.escapedText;
                    const type = typeChecker.getTypeAtLocation(member);
                    // const stringType = typeChecker.typeToString(type);
                    // @ts-ignore
                    const varType = type.aliasTypeArguments[0].intrinsicName;
                    properties[name] = varType;

                }
            }
        }
    });

    return properties;
}

module.exports = propertyFinder;