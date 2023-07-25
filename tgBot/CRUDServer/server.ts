import express, { Express, Request, Response } from 'express';
import { DbWorker } from '../db';
import { Word } from '../models/word';
import bodyParser from 'body-parser';
import cors from 'cors';

class ServerResponce {
    ok: boolean;
    data: any;
    constructor(ok: boolean, data?: any) {
        this.ok = ok;
        this.data = data;
    }
}

class Server {
    app: Express;
    dbWorker: DbWorker;
    async start({ port, dbWorker }: { port: number, dbWorker: DbWorker }) {
        this.dbWorker = dbWorker;

        this.app = express();
        this.app.listen(port, () => {
            console.log(`Server is running at ${port}`);
        });

        this.app.use(cors());
        this.app.use(express.json());
        this.app.post("/saveWord", this.saveWord.bind(this));
        this.app.post("/checkHash", this.checkHash.bind(this));
    }

    async saveWord(req: Request, res: Response) {
        let hash = req.header('accessHash');
        if (!hash) {
            return res.status(400).json(new ServerResponce(false));
        }

        let user = await this.dbWorker.getSessionUser(hash);

        if (!user) {
            return res.status(400).json(new ServerResponce(false));
        }

        let { original, translate, desription } = req.body || {};
        if (!original || !translate) {

            return res.status(400).json(new ServerResponce(false));
        }

        let word = new Word({ userId: user.id, original: original, translate: translate, description: desription });
        await this.dbWorker.insertWord(word);

        return res.status(200).json(new ServerResponce(true));
    }

    async checkHash(req: Request, res: Response) {
        let hash = req.header('accessHash');
        if (!hash) {
            return res.status(400).json(new ServerResponce(false));
        }

        let user = await this.dbWorker.getSessionUser(hash);

        if (!user) {
            return res.status(400).json(new ServerResponce(false));
        }

        return res.status(200).json(new ServerResponce(true, user));
    }
}

export { Server };