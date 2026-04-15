import {Ipath, IPathRoute} from "../domain/IPath";

function path(url: string): IPathRoute {
    const allRoutes: Ipath = {
        "/graphdata": {
            methods: ["GET"]
        },
        "/extra": {
            methods: ["POST", "GET", "PUT"]
        }
    }
    return allRoutes[url];
}

export default path;
