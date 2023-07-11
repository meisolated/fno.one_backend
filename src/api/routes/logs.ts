import { Express, Request, Response } from 'express';
import logger from '../../logger';
import { Logger, Session, User } from '../../model';
export default async function (app: Express, path: string) {
    logger.info('Loaded route: ' + path);
    app.get(path, async (req: Request, res: Response) => {
        const cookie = req.query.cookie || req.cookies['fno.one'];
        if (cookie && cookie.includes('ily') && cookie.includes('fno.one-')) {
            const userId = await Session.findOne({ session: cookie });
            if (userId) {
                const user = await User.findOne({ _id: userId.userId });
                if (user) {
                    if (user.roles.includes('admin')) {
                        Logger.find({})
                            .sort({ createdAt: -1 })
                            .limit(100)
                            .then((data) => {
                                return res.send({ message: 'Success', code: 200, logs: data });
                            });
                    }
                } else {
                    return res.json({ message: 'User not found', code: 404 });
                }
            } else {
                return res.json({ message: 'Session not found', code: 404 });
            }
        } else {
            return res.json({ message: 'Invalid cookie', code: 401 });
        }
    });
}
