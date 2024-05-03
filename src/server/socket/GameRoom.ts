import md5 from "md5";
import {I_GameRooms} from "@/server/socket/interface";

export class GameRoom {
    private readonly id_: string;
    private readonly name_: string;
    private readonly videoUuid_: string;
    private _currentPlayVideoUuid: string = "";
    private videoInfo_ = {
        progress: 0,
        audio: 0,
        pause: true,
    }
    private readonly playerList_: {
        [key: string]: {
            position: { x: number, y: number, z: number }
            rotation: { x: number, y: number, z: number }
            name: string,
            userId: string,
            playerStatus: string,
            message: string,
            model: string,
        },
    };

    constructor(name: string, videoUuid: string) {
        this.id_ = <string>md5(Math.random().toString());
        this.name_ = name;
        this.videoUuid_ = videoUuid;
        this.playerList_ = {};
    }


    public exitRoom(userId: string) {
        delete this.playerList[userId];
    }

    public addPlayer(userId: string, name: string, model: string) {
        this.playerList[userId] = {
            name: name,
            userId: userId,
            position: {x: 0, y: 0, z: 0,},
            rotation: {x: 0, y: 0, z: 0,},
            playerStatus: "",
            message: "",
            model: model,
        };
        return this.playerList[userId];
    }

    public setPlayerData(data) {
        if (this.playerList[data.userId]) {
            this.playerList[data.userId].position = data.position;
            this.playerList[data.userId].rotation = data.rotation;
            this.playerList[data.userId].playerStatus = data.playerStatus;
            this.playerList[data.userId].message = data.message;
        }
    }

    get id() {
        return this.id_;
    }

    // set id(id) {
    //     this.id_ = id;
    // }

    get name() {
        return this.name_;
    }

    get playerList() {
        return this.playerList_;
    }

    get playerAmount() {
        return Object.keys(this.playerList_).length;
    }

    get videoUuid() {
        return this.videoUuid_;
    }

    get videoInfo() {
        return this.videoInfo_;
    }

    set videoInfo(videoInfo) {
        this.videoInfo_ = videoInfo;
    }

    get currentPlayVideoUuid() {
        return this._currentPlayVideoUuid;
    }

    set currentPlayVideoUuid(currentPlayVideoUuid: string) {
        this._currentPlayVideoUuid = currentPlayVideoUuid;
    }
}

const roomList: I_GameRooms = {};

export const createRoom = (name: string, videoUuid: string) => {
   const room:GameRoom = new GameRoom(name, videoUuid);
    roomList[room.id] = room;
    return room.id;
}

export const getRoom = (id: string) => {
    return roomList[id];
}
export const roomListIsEmpty = (): boolean => {
    return Object.keys(roomList).length === 0;
}

export const delRoom = (id: string): boolean => {
    return delete roomList[id];
}

export const getRoomIds = () =>{
    return Object.keys(roomList);
}
export const getRoomValues = () =>{
    return Object.values(roomList);
}
