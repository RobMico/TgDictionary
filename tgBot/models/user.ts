class User {
    id: number;
    currentwordset?: number[];
    sowdescription?: boolean = true;
    webhash?: string;
    name: string;
    username?: string;
    userId: number;

    constructor({ id, sowDescription, name, username, userId }: {
        id: number,
        sowDescription?: boolean,
        name?: string,
        username?: string,
        userId?: number
    }) {
        this.id = id;
        this.sowdescription = sowDescription;
        this.name = name;
        this.username = username;
        this.userId = userId;
    }
}

export { User };