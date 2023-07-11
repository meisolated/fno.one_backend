import compression from 'compression';
import { getConfigData } from './config/initialize';
import cookieParser from 'cookie-parser';
import express, { Express, json, Request, Response, urlencoded } from 'express';
import http from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import middleware from './api/middleware';
import socketLoader from './api/socket';
import { subscribeToAllUsersSockets, subscribeToMarketDataSocket } from './handler/fyers.handler';
import initialize from './initialize';
import LoadRoutes from './lib/routesLoader';
import logger from './logger';

const app: Express = express();
const server = http.createServer(app);

const routesDirPath = path.join(__dirname, '/api/routes');

//-------------------- Starting Server --------------------
console.log('***********************************************');
console.log(
    `
██╗░░░██╗███████╗██████╗░██╗░░░██╗░██████╗
██║░░░██║██╔════╝██╔══██╗██║░░░██║██╔════╝
╚██╗░██╔╝█████╗░░██║░░██║██║░░░██║╚█████╗░
░╚████╔╝░██╔══╝░░██║░░██║██║░░░██║░╚═══██╗
░░╚██╔╝░░███████╗██████╔╝╚██████╔╝██████╔╝
░░░╚═╝░░░╚══════╝╚═════╝░░╚═════╝░╚═════╝░

╭━━━╮╱╱╭━━━╮
┃╭━━╯╱╱┃╭━╮┃
┃╰━━┳━╮┃┃╱┃┃
┃╭━━┫╭╮┫┃╱┃┃
┃┃╱╱┃┃┃┃╰━╯┃
╰╯╱╱╰╯╰┻━━━╯
`,
);
console.log('***********************************************');
//------- --- --- --- --- --- --- --- --- --- --- --- --- ---

app.use(compression({ level: 9 }));
app.use(middleware);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser());
app.get('/', (_req: Request, res: Response) => {
    res.send({ message: 'Something is missing over here', code: 200 });
});

// chatter.on("fyersMarketDataUpdates-", "marketDataUpdate", async (data: any) => { })
// chatter.on("fyersOrderHandler-", "orderUpdate", async (data: any) => { })

logger.info('Initializing server start prerequisites...');
// -----------| Initializing |-----------
initialize()
    .then(async (_done) => {
        logger.info('Loading routes...');
        LoadRoutes(app, routesDirPath, '', true).then(async () => {
            logger.info('Routes loaded!');
            const config = getConfigData();
            const APIport: number = config.serverConf.APIPort;
            const socketPort: number = config.serverConf.socketPort;
            const io = new Server(socketPort);
            logger.info('Loading socket.io events...');
            socketLoader(io);
            logger.info('Socket.io events loaded!');
            await subscribeToAllUsersSockets();
            await subscribeToMarketDataSocket();
            logger.info('Starting server...');
            server.listen(APIport, () => {
                logger.info(`Server started on port ${APIport}`);
            });
        });
    })
    .catch((_err) => {
        logger.error('Error while initializing');
        logger.error('Exiting...');
        process.exit(1);
    });
