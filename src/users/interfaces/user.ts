export interface UserModel {
    id: number,
    email: string,
    password? : string,
    isActive: boolean
}