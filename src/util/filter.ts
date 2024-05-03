import {verify} from "@/util/jwt";

const filterMap = {
    "token": [
        /^\/user\/model$/,
        /^\/user\/info$/,
        /^\/public\/*/,
        /^\/user\/model_collect\/is_empty\//,
        /^\/user\/model_collect\/add\//,
        /^\/user\/model_collect\/remove\//,
        /^\/user\/upload_avatar/,
        /^\/model\/upload_model/,
    ],
    "nano": [
        /^\/activation\/*/,
        /^\/captcha/,
        /^\/shop/,
        /^\/login/,
        /^\/signup/,
    ],
};


const filter = (req, res, next) => {
    const url = req.url;

    const filterKeys = Object.keys(filterMap);
    let key = "nano";
    filterKeys.forEach((item) => {
        const filterMapItem = filterMap[item];
        filterMapItem.forEach((url_) => {
            const regExp = new RegExp(url_);
            if (regExp.test(url)) {
                key = item;
            }
        })
    });
    console.log(url);
    console.log(key);
    if (key === "token") {
        const token = req.headers["authorization"];
        try {
            verify(token);
            next();
        } catch (e) {
            res.end(JSON.stringify({
                msg: e,
            }));
        }
    } else if (key === "nano") {
        next();
    } else {
        next();
    }
};

export default {
    filterMap,
    filter,
}
