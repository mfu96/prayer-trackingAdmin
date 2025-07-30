import { Image } from "./ImageDto";

export interface CarDetailDto{
   carId:number;
   carName:string; 
   categoryName:string;
   brandName:string;
   colorName:string;
   unitsInStock:number;
   unitPrice:number;
   companyName:string;
   imagePaths:Image[];
}