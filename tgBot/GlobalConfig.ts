class GlobalConfig {
    static import(config: any) {
        config.pgHost && (GlobalConfig.pgHost = config.pgHost);
        config.pgPort && (GlobalConfig.pgPort = parseInt(config.pgPort));
        config.pgDatabase && (GlobalConfig.pgDatabase = config.pgDatabase);
        config.pgUser && (GlobalConfig.pgUser = config.pgUser);
        config.pgPassword && (GlobalConfig.pgPassword = config.pgPassword);

        config.tgToken && (GlobalConfig.tgToken = config.tgToken);

        config.serverPort && (GlobalConfig.serverPort = parseInt(config.serverPort));
    }

    static pgHost: string = "localhost";
    static pgPort: number = 5432;
    static pgDatabase: string = 'enlearn';
    static pgUser: string = 'entgbot';
    static pgPassword: string = 'Qwerty';

    static tgToken: string = '6409047096:AAE-iFWpoeM_mUJHdyfMgE2T0uqwj6yYEVo';

    static serverPort = 7738;
}

export { GlobalConfig };