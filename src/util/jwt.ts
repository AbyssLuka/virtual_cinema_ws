import jwt from "jsonwebtoken";
import md5 from "md5";

export const secretKey = "!)*(^%*&$#@{[}]\"\'\\;:/?.,<>|-=+_";

export const createToken = (key: { username: string, uuid: string, role: string }) => {
    const data = {
        username: key.username,
        uuid: key.uuid,
        role: key.role,
        id: md5(key.username),
    };
    return jwt.sign(data, secretKey, {expiresIn: "24h"});
};

export const decode = (token: string) => {
    return jwt.decode(token);
};

export const verify = (token: string) => {
    return jwt.verify(token, secretKey);
};
