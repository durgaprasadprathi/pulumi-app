let aws = require("@pulumi/aws");
let DepGraph = require('dependency-graph').DepGraph;

let pulumiProgram = (jsonObj:any) => () => {
    try {
        const connections = jsonObj.connections;
        const properties = jsonObj.properties;
        const canvasState = jsonObj.canvasState;
        const requiredProperties:any = {};
        const requiredCanvasState:any = {};
        const dependencyGraph = new DepGraph({ circular: true });
        const isConnected:any={};

        for (const prop of properties) {
            requiredProperties[prop.key] = prop.properties;
        }


        for (const s of canvasState) {
            requiredCanvasState[s.key] = s;
            dependencyGraph.addNode(''+s.key)
        }

        for(const conn of connections) {
            const fromKey = conn.from;
            const toKey = conn.to;
            const toProperty = conn.toPort.split("-").pop();
            const fromProperty = conn.fromPort.split("-").pop();

            if(isConnected[fromKey]) {
                const data = isConnected[fromKey];
                let flag = false;
                for (const d of data) {
                    if(d.key===toKey){
                        d.conns.push({toProperty,fromProperty});
                        flag = true;
                        break;
                    }
                }
                if(!flag) {
                    isConnected[fromKey].push({
                        key:toKey,
                        conns:[{toProperty,fromProperty}]
                    });
                }
            } else {
                isConnected[fromKey] = [{
                    key:toKey,
                    conns:[{toProperty,fromProperty}]
                }];
            }


            dependencyGraph.addDependency(''+toKey,''+fromKey);
        }

        const mapping:any = {};

        const order = dependencyGraph.overallOrder();

        console.log(order);

        for(let o of order) {
            o = parseInt(o,10);
            const component = requiredCanvasState[o];
            const deps = dependencyGraph.dependenciesOf(o);
            for (let dep of deps) {
                dep = parseInt(dep,10);
                const depMap = isConnected[dep];
                for(const d of depMap) {
                    if(d.key===o) {
                        const conns = d.conns;
                        for(const conn of conns) {
                            if(conn.fromProperty==='connection') {
                                conn.fromProperty='id';
                            }
                            if(requiredProperties[o])
                                requiredProperties[o][conn.toProperty] = mapping[dep][conn.fromProperty];
                            else
                                requiredProperties[o] = {
                                    [conn.toProperty]:mapping[dep][conn.fromProperty]
                                }
                        }
                    }
                }
            }

            let name = `${o}`;
            if(requiredProperties[o]['name'])
                name = requiredProperties[o]['name'];
            switch (component.name) {
                case 'VPC':
                    mapping[o] = new aws.ec2.Vpc(name, requiredProperties[o]);
                    break;
                case 'Subnet':
                    mapping[o] = new aws.ec2.Subnet(name, requiredProperties[o]);
                    break;
                case 'Internet Gateway':
                    mapping[o] = new aws.ec2.InternetGateway(name, requiredProperties[o]);
                    break;
                case 'Nat Gateway':
                    mapping[o] = new aws.ec2.NatGateway(name, requiredProperties[o]);
                    break;
                case 'Route Table':
                    mapping[o] = new aws.ec2.RouteTable(name, requiredProperties[o]);
                    break;
                case 'Route':
                    mapping[o] = new aws.ec2.Route(name, requiredProperties[o]);
                    break;
                case 'Route Table Association':
                    mapping[o] = new aws.ec2.RouteTableAssociation(name, requiredProperties[o]);
            }
        }
    } catch (err) {
        if (err.toString().indexOf('ENOENT')!==-1) {
            console.log('File not found!');
        } else {
            throw err;
        }
    }
};

module.exports = pulumiProgram;