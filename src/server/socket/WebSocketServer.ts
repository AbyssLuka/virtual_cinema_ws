import {IncomingMessage, Server} from "http";
import {createRoom, roomListIsEmpty, getRoom, delRoom, getRoomValues, GameRoom} from "@/server/socket/GameRoom";
import GameRouter from "@/server/socket/GameRouter";
import {
    I_CreatePlayerData,
    I_PlayerActionData
} from "@/server/socket/interface";

import {Server as WsServer} from "ws"

let wsServer: WsServer;

export const start = (httpServer: Server) => {
    GameRouter.init(httpServer);
    wsServer = GameRouter.getWsServer();
    const updateDate = () => {
        wsServer.clients.forEach((item) => {
            if (item["userId"] && item["type"] === "playerAction") {
                const roomId = item["roomId"];
                const sendDate = JSON.stringify({room: getRoom(roomId), type: "playerAction"});
                item.send(sendDate);
            }
        });
    };
    // 帧同步
    setInterval(() => {
        roomListIsEmpty() || updateDate();
    }, 1000 / 45);
};

GameRouter.ws("/playerAction", (client, _req: IncomingMessage, msg) => {
    let actionData: I_PlayerActionData = JSON.parse(msg.toString());
    client["roomId"] = actionData.roomId;
    client["userId"] = actionData.userId;
    client["type"] = "playerAction";
    // playerActionClientList.push(client);
    // const room = roomMap[actionData.roomId];
    const room = getRoom(actionData.roomId);
    room && room.setPlayerData({
        userId: actionData.userId,
        position: actionData.position,
        rotation: actionData.rotation,
        playerStatus: actionData.playerStatus,
        message: actionData.message,
    });
});

GameRouter.ws("/createPlayer", (client, _req: IncomingMessage, msg) => {
    //不符合创建条件
    const data: I_CreatePlayerData = JSON.parse(msg.toString());
    client["type"] = "createPlayer";
    if (roomListIsEmpty() || !data.roomId || getRoom(data.userId)) {
        client.send(JSON.stringify({
            type: "createPlayerError",
            code: -1,
            msg: "创建玩家失败",
            data: {}
        }));
        return;
    }
    //玩家已经存在
    if (getRoom(data.roomId)?.playerList[data.userId]) {
        client.send(JSON.stringify({
            type: "createPlayerError",
            code: -1,
            msg: "玩家已经存在",
            data: {}
        }));
        return;
    }
    //创建新玩家
    const player = getRoom(data.roomId)?.addPlayer(data.userId, data.name, data.model);
    const newPlayer = JSON.stringify({
        type: "newPlayer",
        code: 0,
        msg: "新玩家加入",
        data: {
            newPlayer: player,
        }
    });
    //广播有新玩家加入
    wsServer.clients.forEach((item) => {
        if (item["type"] === "createPlayer" && item["roomId"] === data.roomId) {
            item.send(newPlayer)
        }
    });

    //把所有玩家信息发送给新玩家客户端
    const allPlayer = JSON.stringify({
        type: "allPlayer",
        code: 0,
        msg: "创建成功",
        data: {
            allPlayer: getRoom(data.roomId).playerList,
            videoUuid: getRoom(data.roomId).videoUuid,
        }
    });
    client["roomId"] = data.roomId;
    client["userId"] = data.userId;
    client["type"] = "createPlayer";
    client.send(allPlayer);
}, (client) => {
    //玩家掉线 直接删除玩家数据
    if (client && getRoom(client["roomId"])) {
        getRoom(client["roomId"]).exitRoom(client["userId"]);
    }
    //给所有玩家广播
    playerExitFunc(client["roomId"], client["userId"]);
});
const playerExitFunc = (roomId: string, userId: string) => {
    wsServer.clients.forEach((client_) => {
        if (client_["roomId"] === roomId) {
            console.log("playerExitFunc");
            client_.send(JSON.stringify({
                type: "otherPlayerExit",
                msg: "玩家:".concat(userId).concat("已退出！"),
                data: {userId}
            }));
        }
        if (client_["userId"] === userId) {
            client_.close();
        }
    });
};

GameRouter.ws("/updateVideo", (client, _req: IncomingMessage, msg) => {
    const data: {
        type: string,
        roomId: string,
        progress: number,
        audio: number,
        pause: boolean,
        videoUuid: string,
    } = JSON.parse(msg.toString());
    console.log("updateVideo", data);
    client["roomId"] = data.roomId;
    client["type"] = "updateVideo";
    const roomId = data.roomId;

    if (data.type === "updateVideo") {
        getRoom(roomId).videoInfo = {progress: data.progress, audio: data.audio, pause: data.pause,};
        wsServer.clients.forEach((client_) => {
            if (client_["roomId"] === roomId && client_["type"] === "updateVideo") {
                client_.send(JSON.stringify({
                    type: "updateVideo",
                    msg: "",
                    code: 0,
                    data: getRoom(roomId).videoInfo,
                }));
            }
        });
    } else if (data.type === "loadVideo") {
        getRoom(roomId).currentPlayVideoUuid = data.videoUuid;
        wsServer.clients.forEach((client_) => {
            if (client_["roomId"] === roomId && client_["type"] === "updateVideo") {
                client_.send(JSON.stringify({
                    type: "loadVideo",
                    msg: "",
                    code: 0,
                    data: {videoUuid: data.videoUuid},
                }));
            }
        });
    } else if (data.type === "initVideo") {
        client.send(JSON.stringify({
            type: "initVideo",
            msg: "",
            code: 0,
            data: {
                videoUuid: getRoom(roomId)?.currentPlayVideoUuid,
                videoInfo: getRoom(roomId)?.videoInfo,
            },
        }))
    }
});

import express, {Request, Response} from "express";
const wsRoute = express.Router();
wsRoute.post("/removeRoom", async (req: Request, res: Response) => {
    const body = req.body;
    //给所有玩家广播
    wsServer.clients.forEach((client_) => {
        if (client_["roomId"] === body.roomId) {
            console.log("removeRoom");
            client_.send(JSON.stringify({
                type: "removeRoom",
                msg: "强制退出",
                data: {}
            }));
            client_.close();
        }
    });
    delRoom(body.roomId)
    res.send({
        type: "removeRoom",
        msg: "成功"
    });
    res.end();
});
wsRoute.post("/exitRoom", async (req: Request, res: Response) => {
    const body = req.body;
    //清除玩家数据
    if (getRoom(body.roomId)) {
        getRoom(body.roomId).exitRoom(body.userId);
        // const keys = Object.keys(getRoom(body.roomId).playerList);
        // if (keys.length === 0) {
        //     delRoom(body.roomId)
        // }
    }
    //给所有玩家广播
    playerExitFunc(body.roomId, body.userId);
    res.send({
        type: "exitRoom",
        msg: "成功"
    });
    res.end();
});
wsRoute.post("/selectRoomList", async (req: Request, res: Response) => {
    const body: { type: string, name: string } = req.body;
    const roomList:GameRoom[] = getRoomValues();
    const roomInfoList: { id: string, name: string, amount: number }[] = [];
    roomList.forEach((room:GameRoom) => {
        if (room.name.indexOf(body.name) != -1) {
            roomInfoList.push({
                id: room.id,
                name: room.name,
                amount: room.playerAmount,
            });
        }
    });
    console.log(roomList)
    res.send({type: "selectRoomList", roomInfoList: roomInfoList,});
    res.end();
});
wsRoute.post("/createRoom", async (req: Request, res: Response) => {
    const body: { name: string, videoUuid: string } = req.body;
    const videoUuid = body.videoUuid;
    // const room = new GameRoom(data.name, videoUuid);
    // roomMap[room.id] = room;
    const roomId = createRoom(body.name, videoUuid);
    res.send({
        type: "createRoom",
        roomId: roomId,
        name: body.name,
        videoUuid,
    });
    res.end();
});
export {wsRoute};