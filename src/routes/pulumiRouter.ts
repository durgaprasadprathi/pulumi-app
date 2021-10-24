import express = require('express');
const copyPulumiProgram = require("../util/copyPulumiProgram");
const auto = require("@pulumi/pulumi/automation");
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.post('/pulumi-save',async  (req,res,next) => {
    try {
        const {stackPath} = req.body;
        // tslint:disable-next-line:no-console
        copyPulumiProgram(stackPath);
        res.json(
            {
                status:"success",
                message:"stack Initialized",
                data:"stack Initialized"
            }
        )
    } catch (e) {
        res.json(
            {
                status:"failure",
                message:e.toString(),
                data:null
            }
        )
    }

});


router.post('/pulumi-init',async  (req,res,next) => {
    const {draftState} = req.body;
    const {stackPath} = req.body;
    try {
        const pulumiProgramPath = path.join(stackPath,'pulumiProgram.js');
        const configPath = path.join(stackPath,'config.json');
        if(fs.existsSync(pulumiProgramPath)) {
            delete require.cache[pulumiProgramPath];
            delete require.cache[configPath];
            const config = require(configPath);
            const pulumiProgram = require(pulumiProgramPath);
            const args = {
                stackName: config.stackName.replace(" ","-"),
                projectName: config.projectName.replace(" ","-"),
                program: pulumiProgram(draftState)
            };
            const stack = await auto.LocalWorkspace.createOrSelectStack(args);
            await stack.workspace.installPlugin("aws", "v4.0.0");
            await stack.setConfig("aws:region", { value: config.awsRegion });
            await stack.setConfig("aws:accessKey",{value:config.awsAccessKey});
            await stack.setConfig("aws:secretKey",{value:config.awsSecretKey});
            // tslint:disable-next-line:no-console
            await stack.refresh({ onOutput: console.info });
            res.json(
                {
                    status:"success",
                    message:"stack Initialized",
                    data:"stack Initialized"
                }
            )

        } else {
            res.json(
                {
                    status:"failure",
                    message:"stack doesnt exist",
                    data:null
                }
            )
        }
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(e);
        res.json(
            {
                status:"failure",
                message:e.toString(),
                data:null
            }
        )
    }

});


router.post('/pulumi-validate',async (req,res,next)=> {
    const {stackPath} = req.body;
    const pulumiProgramPath = path.join(stackPath,'pulumiProgram.js');
    const configPath = path.join(stackPath,'config.json');
    if(fs.existsSync(pulumiProgramPath)) {
        delete require.cache[pulumiProgramPath];
        delete require.cache[configPath];
        try {
            require(pulumiProgramPath);
            res.json(
                {
                    status:"success",
                    message:"Valid Syntax",
                    data:"Valid Syntax"
                }
            )
        } catch (e) {
            res.json(
                {
                    status:"failure",
                    message:"Syntax wrong",
                    data:e.toString()
                }
            )
        }
    } else {
        res.json(
            {
                status:"failure",
                message:"stack doesnt exist",
                data:null
            }
        )
    }
});

router.post('/pulumi-preview',async (req,res,next)=> {
    const {stackPath} = req.body;
    const {draftState} = req.body;
    const pulumiProgramPath = path.join(stackPath,'pulumiProgram.js');
    const configPath = path.join(stackPath,'config.json');
    if(fs.existsSync(pulumiProgramPath)) {
        delete require.cache[pulumiProgramPath];
        delete require.cache[configPath];
        const config = require(configPath);
        const pulumiProgram = require(pulumiProgramPath);
        const args = {
            stackName: config.stackName.replace(" ","-"),
            projectName: config.projectName.replace(" ","-"),
            program: pulumiProgram(draftState)
        };
        const stack = await auto.LocalWorkspace.createOrSelectStack(args);
        await stack.setConfig("aws:region", { value: config.awsRegion });
        await stack.setConfig("aws:accessKey",{value:config.awsAccessKey});
        await stack.setConfig("aws:secretKey",{value:config.awsSecretKey});

        let upOut:any = "";

        try {
            // tslint:disable-next-line:no-console
            const upRes = await stack.preview({onOutput: (s:string) => {upOut=upOut+s}});
            res.json(
                {
                    status:"success",
                    message:null,
                    data:upRes.changeSummary
                }
            )
        } catch (e) {
            res.json(
                {
                    status:"failure",
                    message:"Error Occured",
                    data:upOut
                }
            )
        }
    } else {
        res.json(
            {
                status:"failure",
                message:"stack doesnt exist",
                data:null
            }
        )
    }
});

router.post('/pulumi-up',async (req,res,next)=> {
    const {stackPath} = req.body;
    const {draftState} = req.body;
    const pulumiProgramPath = path.join(stackPath,'pulumiProgram.js');
    const configPath = path.join(stackPath,'config.json');
    if(fs.existsSync(pulumiProgramPath)) {
        delete require.cache[pulumiProgramPath];
        delete require.cache[configPath];
        const config = require(configPath);
        const pulumiProgram = require(pulumiProgramPath);
        const args = {
            stackName: config.stackName.replace(" ","-"),
            projectName: config.projectName.replace(" ","-"),
            program: pulumiProgram(draftState)
        };
        const stack = await auto.LocalWorkspace.createOrSelectStack(args);
        await stack.setConfig("aws:region", { value: config.awsRegion });
        await stack.setConfig("aws:accessKey",{value:config.awsAccessKey});
        await stack.setConfig("aws:secretKey",{value:config.awsSecretKey});

        let upOut:any = "";

        try {
            // tslint:disable-next-line:no-console
            const upRes = await stack.up({onOutput: (s:string) => {upOut=upOut+s}});
            // tslint:disable-next-line:no-console
            console.info(`update summary: \n${JSON.stringify(upRes.summary.resourceChanges, null, 4)}`);
            res.json(
                {
                    status:"success",
                    message:"stack Updated",
                    data:upRes.summary.resourceChanges
                }
            )
        } catch (e) {
            res.json(
                {
                    status:"failure",
                    message:"Error Occured",
                    data:upOut
                }
            )
        }
    } else {
        res.json(
            {
                status:"failure",
                message:"stack doesnt exist",
                data:null
            }
        )
    }
});


router.post('/pulumi-destroy',async (req,res,next)=> {
    const {stackPath} = req.body;
    const {draftState} = req.body;
    const pulumiProgramPath = path.join(stackPath,'pulumiProgram.js');
    const configPath = path.join(stackPath,'config.json');
    if(fs.existsSync(pulumiProgramPath)) {
        delete require.cache[pulumiProgramPath];
        delete require.cache[configPath];
        const config = require(configPath);
        const pulumiProgram = require(pulumiProgramPath);
        const args = {
            stackName: config.stackName.replace(" ","-"),
            projectName: config.projectName.replace(" ","-"),
            program:pulumiProgram(draftState)
        };
        const stack = await auto.LocalWorkspace.createOrSelectStack(args);

        await stack.setConfig("aws:region", { value: config.awsRegion });
        await stack.setConfig("aws:accessKey",{value:config.awsAccessKey});
        await stack.setConfig("aws:secretKey",{value:config.awsSecretKey});

        let upOut:any = "";

        try {
            // tslint:disable-next-line:no-console
            await stack.refresh({onOutput: (s:string) => {upOut=upOut+s}});
            const upRes =  await stack.destroy({onOutput: (s:string) => {upOut=upOut+s}});

            res.json(
                {
                    status:"success",
                    message:"stack Destroyed",
                    data:upRes.summary.resourceChanges
                }
            )
        } catch (e) {
            res.json(
                {
                    status:"failure",
                    message:"Error Occured",
                    data:upOut
                }
            )
        }
    } else {
        res.json(
            {
                status:"failure",
                message:"stack doesnt exist",
                data:null
            }
        )
    }
});

module.exports = router;