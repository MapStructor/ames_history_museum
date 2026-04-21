import {PrismaClient } from "@/prisma/generated_schema/Drawing";
import { NextResponse } from "next/server";
import { Auth } from "../auth/auth"

const prisma = new PrismaClient();

export async function GET() {
    
    try {
        const maps = await prisma.map.findMany();

        return NextResponse.json({
            maps
        });
    } catch (e) {
        throw(e);
    }
}

export async function POST(request:Request) {
    if(!Auth(request)){ //protected endpoint
        return NextResponse.json({
            message: "Not Authorized",
            error: "Auth Token Invaild",
        }, {status: 401});
      }
      
    const newmap = await request.json();

    try {
        const map = await prisma.map.create({
            data: {
                mapId: newmap.mapId,
                longitude: newmap.longitude,
                latitude: newmap.latitude,
                mapName: newmap.mapName,
                topLeftBoundLatitude: newmap.topLeftBoundLatitude,
                topLeftBoundLongitude: newmap.topLeftBoundLongitude,
                bottomRightBoundLatitude: newmap.topLeftBoundLatitude,
                bottomRightBoundLongitude: newmap.bottomRightBoundLongitude,
                zoomToBounds: newmap.zoomToBounds,
                zoom: newmap.zoom,
                bearing: newmap.bearing,
                styleId: newmap.styleId,
                groupId: newmap.groupId,
                infoId: newmap.infoId,
            }
        });
        
        return NextResponse.json({
            message: "Success",
            map //DEBU
        });
    } catch (e) {
        throw(e);
    }
}   