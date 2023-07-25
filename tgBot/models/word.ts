class Word {
    id: number;
    userId: number;
    value: number = 25;
    original: string;
    translate: string;
    description?: string;
    constructor({ userId, value, original, translate, description }:
        { userId: number, value?: number, original: string, translate: string, description?: string }) {
        this.userId = userId;
        this.value = value || 25;
        this.original = original;
        this.translate = translate;
        this.description = description || '';
    }
}

export { Word };