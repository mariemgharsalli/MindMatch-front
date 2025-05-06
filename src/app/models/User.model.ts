import { ERole } from "./Role.model";

export interface User{

    userId? : number | null,
    firstName : string,
    lastName: string,
    address: string,
    password : string,
    email : string,
    phone : string,
    dateOfBirth: Date,
    sexe: string,
    role?: {
        roleId?: number;
        role?: ERole;
    };
}
