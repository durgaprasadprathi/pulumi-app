import express from "express";
const app = express();
const port = 6792; // default port to listen
// import { keys } from 'ts-transformer-keys';
// require('./util/extractProperties');
const pulumiRouter = require('./routes/pulumiRouter');


app.use(express.json());

// define a route handler for the default home page
app.use('/', pulumiRouter);

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );