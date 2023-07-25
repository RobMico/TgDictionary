import { Client } from 'pg';
import { User } from './models/user';
import { Word } from './models/word';

class DbWorker {
    client: Client;
    async start({ host, port, database, user, password }: { host: string, port: number, database: string, user: string, password: string }) {
        this.client = new Client({
            host: "localhost",
            port: 5432,
            database: 'enlearn',
            user: 'entgbot',
            password: 'Qwerty'
        });
        await this.client.connect();
    }

    async testWeightedRandom() {
        let obj = {};
        for (let i = 0; i < 10000; i++) {
            const value = Math.floor(Math.random() * 13);
            obj[value] || (obj[value] = 0);
            obj[value] += 1;
            this.client.query("INSERT INTO test(value) VALUES ($1);", [value]);
        }


        for (let i = 0; i < 100; i++) {
            let res = await this.client.query('SELECT * FROM test ORDER BY random()/power((value+1), 5/3) LIMIT 100;');
            for (let x of res.rows) {
                obj[x.value] || (obj[x.value] = 0);
                obj[x.value] += 1;
            }
        }
        console.log(obj);
    }

    async getUser(id: number): Promise<User> {
        let res = await this.client.query('SELECT * FROM botuser WHERE id=$1 LIMIT 1;', [id]);
        if (res.rows.length !== 0) {
            return res.rows[0];
        }
        return null;
    }

    async insertUser(user: User) {
        await this.client.query("INSERT INTO botuser(id, sowDescription, name, username, userId) VALUES ($1, $2, $3, $4, $5);",
            [user.id, user.sowdescription, user.name, user.username, user.userId]);
    }

    async insertWord(word: Word) {
        try {
            await this.client.query("INSERT INTO word(userId, original, translate, description, value) VALUES ($1, $2, $3, $4, $5);",
                [word.userId, word.original, word.translate, word.description, word.value]);
        } catch (ex) {
            console.log(ex);
        }
    }

    async getWordSet(count: number, user: number): Promise<Word[]> {
        let res = await this.client.query('SELECT * FROM word WHERE userId=$1 ORDER BY random()/power((value+1), 5/3) LIMIT $2;', [user, count]);
        return res.rows;
    }

    async setUserWordSet(user: number, wordIds: number[]) {
        await this.client.query("UPDATE botuser SET currentWordSet=$1, current_test_errors=0, current_test_passed_count=0, current_test_all_count=$3 WHERE id=$2;", [wordIds, user, wordIds.length]);
    }

    async getWord(id: number): Promise<Word> {
        let res = await this.client.query("SELECT * FROM word WHERE id=$1", [id]);
        if (res.rows.length !== 0) {
            return res.rows[0];
        }

        return null;
    }

    async updateWordValue(id: number, decrement: boolean) {
        if (!decrement) {
            await this.client.query("UPDATE word SET value=value+1 WHERE id=$1;", [id]);
        } else {
            await this.client.query("UPDATE word SET value=value-1 WHERE id=$1;", [id]);
        }
    }

    async removeWordUserList(userId: number, wordId: number, order?: boolean) {
        await this.client.query(`UPDATE botuser SET currentWordSet = array_remove(currentWordSet, $1), ${order ? '' : 'current_test_errors=current_test_errors+1, '}current_test_passed_count=current_test_passed_count+1 WHERE id=$2;`, [wordId, userId]);
    }

    async getWordUserList(userId: number) {
        let res = await this.client.query('SELECT currentWordSet[1] as word, current_test_errors, current_test_all_count  FROM botuser WHERE id=$1;', [userId]);
        if (res.rows.length === 0) {
            console.log('EX no such user', [userId]);
            return null;
        }

        return res.rows[0];
    }


    async setUserSession(userId: number, accessHash: string) {
        await this.client.query("UPDATE botuser SET webHash=$1 WHERE id=$2;", [accessHash, userId]);
    }

    async getSessionUser(hash: string): Promise<User> {
        let res = await this.client.query("SELECT * FROM botuser WHERE webHash=$1;", [hash]);
        if (res.rows.length === 0) {
            return null;
        }
        return res.rows[0];
    }
}

export { DbWorker };

//EnTgBot:Qwerty  db:EnLearn