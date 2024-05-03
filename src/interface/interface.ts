export interface I_Goods {
    id: number,
    name: string,
    type: string,
    worth: number,
    amount: number,
}

export interface I_User {
    uuid: string,
    username: string,
    password: string,
    salt: string,
    email: string,
    avatar: string,
    create_time?: Date,
}

export interface I_Model {
    uuid: string,
    type: string,
    file_name: string,
    create_time?: Date,
}