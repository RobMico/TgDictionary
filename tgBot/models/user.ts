class User {
    id: number;
    currentwordset?: number[];
    sowdescription?: boolean = true;
    webhash?: string;
    name: string;
    username?: string;
    userId: number;

    current_test_errors?: number;
    current_test_passed_count?: number;
    current_test_all_count?: number;

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