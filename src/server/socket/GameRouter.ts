import {IncomingMessage, Server} from "http";
import {Buffer} from "buffer";
import {decode} from "@/util/jwt";
// import * as WebSocket from "ws";
import {WebSocket as WsClient, RawData} from "ws"

type callback = (client: WsClient, request: IncomingMessage, msg: RawData) => void;
type errorCallback = (client: WsClient) => void;
type I_Route = {
    [key: string]: {
        callback: callback,
        errorCallback: errorCallback,
    }
}

const route: I_Route = {};

//有点奇怪
// const WebSocket = require('ws');
import {WebSocketServer} from "ws";

let wsServer: WebSocketServer;

const errorCallbackFunc = (_client: WsClient) => {
    console.error("GameRouter client exit!");
};

const ws = (path: string, callback: callback, errorCallback: errorCallback = errorCallbackFunc) => {
    route[path] || (route[path] = {
        callback: callback,
        errorCallback: errorCallback,
    });
};

const wsFilter = {
    // "/removeRoom": "administrator",
    // "/createRoom": "ordinary",
};

const init = (server: Server) => {
    wsServer = new WebSocketServer({server});
    wsServer.on("connection", (client: WsClient, req: IncomingMessage) => {
        let url = <string>req.url;
        const token = <string>req.headers["sec-websocket-protocol"];
        const decodeData = tokenIsEmpty(token);
        if (!decodeData) {
            client.close();
            return;
        }
        if (!route[url]) {
            client.close();
            return;
        }
        const role: string = decodeData["role"];
        client.on("message", (msg: RawData) => {
            if (wsFilter[url] && (wsFilter[url] !== role)) {
                client.send(JSON.stringify({msg: "没有权限"}));
                client.close();
                return;
            }
            route[url].callback(client, req, msg);
        });
        client.on("close", () => {
            route[url].errorCallback(client);
        });
    });
};

function tokenIsEmpty(token: string | null | undefined) {
    if (!token) {
        return null;
    }
    const decodeData = decode(token);
    if (!decodeData) {
        return null;
    }
    return decodeData;
}

const getWsServer = () => {
    return wsServer
}

export default {
    init,
    ws,
    getWsServer,
}

/*export class GameRouter {
    private route: I_Route = {};

    private WebSocket = require('ws');

    private readonly wsServer_;
    private readonly httpServer_: Express;

    public constructor(server: Server, app: Express) {
        this.httpServer_ = app;
        this.wsServer_ = new this.WebSocket.Server({server});
        this.wsServer_.on("connection", (client, req: IncomingMessage) => {
            let url = <string>req.url;
            const token = <string>req.headers["sec-websocket-protocol"];
            const decodeData = this.tokenIsEmpty(token);
            if (!decodeData) {
                client.close();
                return;
            }
            if (!this.route[url]) {
                client.close();
                return;
            }
            const role: string = decodeData["role"];
            client.on("message", (msg) => {
                if (this.wsFilter[url] && (this.wsFilter[url] !== role)) {
                    client.send(JSON.stringify({msg: "没有权限"}));
                    client.close();
                    return;
                }
                this.route[url].callback(client, req, msg);
            });
            client.on("close", () => {
                this.route[url].errorCallback(client);
            });
        });
    };


    public errorCallbackFunc(client) {
        console.error("GameRouter client exit!");
    };

    public ws(path: string, callback: callback, errorCallback: errorCallback = this.errorCallbackFunc) {
        this.route[path] || (this.route[path] = {
            callback: callback,
            errorCallback: errorCallback,
        });
    };

/!*    public http(path: string, callback: (req: Request, res: Response) => Promise<void>, errorCallback: errorCallback = this.errorCallbackFunc) {
        this.httpServer.post(path, callback)
    };*!/

    private wsFilter = {
        // "/removeRoom": "administrator",
        // "/createRoom": "ordinary",
    };

    public tokenIsEmpty(token: string | null | undefined) {
        if (!token) {
            return null;
        }
        const decodeData = decode(token);
        if (!decodeData) {
            return null;
        }
        return decodeData;
    }

    get wsServer() {
        return this.wsServer_;
    }

    get httpServer() {
        return this.httpServer_;
    }
}*/
