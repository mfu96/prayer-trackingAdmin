import { ImageDto } from "./ImageDto";

export interface MosqueDetailDto{
    mosqueId:number,
    mosqueName:string,
    mosqueLatitude:number,
    mosqueLongitude:number,
    companyName:string,
    description:string,
    shift:string,
    firstName:string;
    lastName:string;
    contact:string,
    imagePaths:ImageDto[]; // Resimlerin listesi,

    // employeeId:number



}