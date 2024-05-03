import express from "express";
import bodyParser from "body-parser";
import http from "http";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors"
import jwtConfig from "@/config/jwt";
import multer from "multer";
import filter from "@/util/filter";
import {start, wsRoute} from "@/server/socket/WebSocketServer";
import {BASE_URL, PORT} from "@/config/global";
import {Server} from "http";

const app = express();
app.use(cors({
    // origin: ["http://192.168.193.216:8080"],
    allowedHeaders:
        'Content-Type, ' +
        'Authorization, ' +
        'Content-Length, ' +
        'X-Requested-With, ' +
        'cache-control, ' +
        'Token',
    exposedHeaders:
        "Content-Type, " +
        "Authorization, " +
        "Content-Length, " +
        "X-Requested-With, " +
        "cache-control, " +
        "Token",
}));
//过滤器
app.use(filter.filter);
//JWT
app.use(jwtConfig);
//文件
const multer_ = multer();
app.use(multer_.any());
app.use(bodyParser.urlencoded({extended: false}));
//json解析
app.use(bodyParser.json());
//路由
app.use(wsRoute);
app.use(cookieParser());
app.use(cookieSession({
    name: "session",
    keys: ["!@#$%^&*_+=-<>/|\\{}[](),.;:'\"`~"],
    maxAge: 1000 * 60 * 2,
}));
//静态资源
app.use("/static", express.static("public"));
const server: Server = http.createServer(app);
start(server);
(() => {
    server.listen(PORT, () => {
        console.log(PORT, "启动了");
        console.log(BASE_URL);
    });
})();
