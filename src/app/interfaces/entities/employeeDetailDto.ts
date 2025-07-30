import { ImageDto } from "./ImageDto";

export interface EmployeeDetailDto {

     userId:number;
    employeeId:number;
      companyId: number; // YENİ: Eklendi
  mosqueId: number;  // YENİ: Eklendi
    companyName:string;
    mosqueName:string;
    firstName:string;
    lastName:string;
    email:string;
    contact:string;
    deviceName:string; 
    registiration:string;



}