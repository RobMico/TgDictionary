class User {
    id: number;
    currentwordset?: number[];
    sowdescription?: boolean = true;
    webhash?:string;
    constructor(id: number, sowDescription: boolean = true) {
        this.id = id;
        this.sowdescription = sowDescription;
    }
}

export { User };