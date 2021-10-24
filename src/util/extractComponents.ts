export {};
const fs = require('fs');
const path = require('path');

const aws = require("@pulumi/aws");
const extractProperties = require("./extractProperties");

const componentJson:any = {
    "aws":{}
};

const extractComponents =async ()=> {
    for(const a of Object.keys(aws)) {
        if((""+Object.getPrototypeOf(aws[a])).indexOf('Object')!==-1) {
            componentJson.aws[a]={};
            for (const k of Object.keys(aws[a])) {
                try {
                    if((""+Object.getPrototypeOf(aws[a][k])).indexOf('CustomResource')!==-1) {
                        componentJson.aws[a][k]={};
                       let tsFile = k.charAt(0).toLowerCase() + k.slice(1);
                        tsFile = tsFile+".d.ts";
                        const properties = extractProperties("aws"+path.sep+a+path.sep+tsFile);
                        console.log(`aws.${a}.${k}`, properties)
                    }
                } catch (e) {
                    console.log(e);
                    // tslint:disable-next-line:no-console
                    continue;
                }
            }
        }
    }


    await fs.writeFileSync(path.join(__dirname,'components.json'),JSON.stringify(componentJson));
};


module.exports = extractComponents;