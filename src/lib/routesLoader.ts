import fs from 'fs';
import logger from '../logger';
import { timeout } from '../helper';

const findAllRoutes = (routesDir: string, routePrefix: string) =>
    new Promise(async (resolve, _reject) => {
        const routes: Array<Object> = [];
        const pushInRoutes = (dir: string, file: string, route: string) =>
            routes.push({
                path: dir + '/' + file,
                route: routePrefix == '' ? routePrefix + route : '/' + routePrefix + route,
            });

        const findInThisDir = (dir: string) => {
            const files = fs.readdirSync(dir);
            files.forEach((file) => {
                if (file.endsWith('.js') || file.endsWith('.ts')) {
                    let route = `/${file}`;
                    route = dir.split('routes')[1] + route;
                    route = file.endsWith('.js') ? route.split('.js')[0] : route.split('.ts')[0];
                    route = route.includes('index') ? route.split('index')[0] : route;
                    pushInRoutes(dir, file, route);
                } else {
                    if (fs.lstatSync(dir + '/' + file).isDirectory()) {
                        findInThisDir(dir + '/' + file);
                    } else {
                        logger.warn(`Skipping this file ${dir + file}`);
                    }
                }
            });
        };
        findInThisDir(routesDir);
        await timeout(1000);
        resolve(routes);
    });

const LoadRoute = (routesList: Array<Object>, app: any, logging: boolean) =>
    new Promise(async (resolve, reject) => {
        routesList.map(async (route: any, index) => {
            try {
                await import(route.path).then((fun) => {
                    if (logging) logger.info(`Loading route ${route.route}`);
                    return fun.default(app, route.route);
                });
            } catch (error: any) {
                reject();
                throw new Error(error);
            }
        });
        await timeout(1000);
        resolve(true);
    });

/**
 * @description Load Express Routes Dynamically
 * @author meisolated
 * @date 31/08/2022
 * @param app: Express App
 * @param routesDir: Routes Full Directory Path
 * @param mainRoute : Route Prefix
 * @param logging : Routes Loading Logging
 */
const LoadRoutes = async (app: any, routesDir: string, routePrefix: string, logging: boolean) =>
    new Promise(async (resolve, reject) => {
        if (fs.existsSync(routesDir)) {
            const routesList: any = await findAllRoutes(routesDir, routePrefix);
            logger.info(`Found ${routesList.length} routes`);
            await LoadRoute(routesList, app, logging);
            resolve(true);
        } else {
            reject();
            throw new Error('Routes directory not found');
        }
    });

export default LoadRoutes;
