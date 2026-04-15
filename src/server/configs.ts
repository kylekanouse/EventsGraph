import {IConfigs} from "./domain/IConfigs";

export const configs: IConfigs = {
    mongodb: {
        url: process.env.MONGODB_URL || 'localhost',
        port: Number(process.env.MONGODB_PORT) || 27017,
        username: process.env.MONGODB_USERNAME || '',
        password: process.env.MONGODB_PASSWORD || '',
        collection: process.env.MONGODB_COLLECTION || 'test',
    }
}
