import { Server } from "./CRUDServer/server";
import { GlobalConfig } from "./GlobalConfig";
import { DbWorker } from "./db";
import { TgBot } from "./tgBot";
import dotenv from 'dotenv';

let configFile = `.${process.env.NODE_ENV}.env`;
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == 'config') {

        if (process.argv[i + 1]) {
            configFile = process.argv[i + 1];
            i++;
            continue;
        }
    }
}

dotenv.config({ path: configFile });
GlobalConfig.import(process.env);

async function start() {
    const dbWorker = new DbWorker();
    await dbWorker.start({
        host: GlobalConfig.pgHost,
        port: GlobalConfig.pgPort,
        database: GlobalConfig.pgDatabase,
        user: GlobalConfig.pgUser,
        password: GlobalConfig.pgPassword
    });
    //await dbWorker.testWeightedRandom();
    const tgBot = new TgBot();
    await tgBot.start(dbWorker, { botToken: GlobalConfig.tgToken });

    const server = new Server();
    await server.start({ port: GlobalConfig.serverPort, dbWorker: dbWorker });
}
start();