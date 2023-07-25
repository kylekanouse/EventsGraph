interface IApi {
    host: string;
    getRoute: (routeName: string) => string;
}

class Api implements IApi {
    host: string;
    constructor(host: string) {
        this.host = host;
    }

    getRoute(routeName: string) {
        return `${this.host}${__API_BASE_PATH__}/${routeName}`
    }

}

const apiRoute: Api = Object.freeze(new Api(__API_SERVICE_URL__))

export {
    apiRoute,
}
