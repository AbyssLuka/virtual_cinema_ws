import {GameRoom} from "@/server/socket/GameRoom";

interface I_Vector3 {
    x: number,
    y: number,
    z: number,
}

interface I_Player {
    id: string,
    name: string,
    statue: "exit" | "exist",
    position: I_Vector3,
    rotation: I_Vector3,
}

export interface I_PlayerActionData {
    type: "playerAction",
    name: string,
    position: I_Vector3,
    rotation: I_Vector3,
    playerStatus: string,
    roomId: string,
    userId: string,
    message: string,
}

export interface I_GameRooms {
    [key: string]: GameRoom,
}


export interface I_CreatePlayerData {
    roomId: string,
    userId: string,
    name: string,
    model: string,
    type:string,
}

export interface I_ExitRoom {
    userId: string,
    roomId: string,
}

