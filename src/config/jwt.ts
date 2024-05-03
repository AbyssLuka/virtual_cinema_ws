import {expressjwt} from "express-jwt";
import {secretKey} from "@/util/jwt";

const jwtConfig = expressjwt({
    secret: secretKey,
    algorithms: ["HS256"]
}).unless({
    path: [
        // /^\/api\//,
        // "/login",
        // "/signup",
        // /^\/public\/*/,
        /^\/*/,
    ],
});

export default jwtConfig;