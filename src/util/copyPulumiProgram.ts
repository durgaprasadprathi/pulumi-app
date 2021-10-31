let fs = require('fs');
const path = require('path');

let copyPulumiProgram = async (stackPath:any) => {
    await fs.copyFileSync( path.join(__dirname,'pulumiProgram.js'),path.join(stackPath,'pulumiProgram.js'));
};

module.exports = copyPulumiProgram;