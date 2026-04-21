import { PrismaClient, Map } from "@/prisma/generated_schema/chronmaps";
import { NextResponse } from "next/server";
import { Auth } from "../../auth/auth";

const prisma = new PrismaClient();

export async function GET(request: Request, context: any) {

    const {params} = context;

    try {
      
      const maps = await prisma.map.findFirst({
        where: {id: params.id}
      });

      return NextResponse.json({
        maps
      });
    } catch (e) {
      throw(e);
    }
}

export async function PUT(request: Request, context: any) {
  if(!Auth(request)){ //protected endpoint
    return NextResponse.json({
        message: "Not Authorized",
        error: "Auth Token Invaild",
    }, {status: 401});
  }
  const {params} = context;
  const inmap = await request.json();

  try {
    
    const maps = await prisma.map.update({
      where: {id: params.id},
      data: {
        mapId: inmap.mapId,
        longitude: inmap.longitude ? (typeof(inmap.longitude) == 'string' ?
          parseFloat(inmap.longitude) : inmap.longitude) : null,
        latitude: inmap.latitude ? (typeof(inmap.latitude) == 'string' ?
          parseFloat(inmap.latitude) : inmap.latitude) : null,
        mapName: inmap.mapName,
        zoom: inmap.zoom,
        bearing: inmap.bearing,
        topLeftBoundLatitude: inmap.topLeftBoundLatitude ? (typeof(inmap.topLeftBoundLatitude) == 'string' ?
          parseFloat(inmap.topLeftBoundLatitude) : inmap.topLeftBoundLatitude) : null,
        topLeftBoundLongitude: inmap.topRightBoundLongitude ? (typeof(inmap.topRightBoundLongitude) == 'string' ?
          parseFloat(inmap.topRightBoundLongitude) : inmap.topRightBoundLongitude) : null,
        bottomRightBoundLatitude: inmap.bottomRightBoundLatitude ? (typeof(inmap.bottomRightBoundLatitude) == 'string' ?
          parseFloat(inmap.bottomRightBoundLatitude) : inmap.bottomRightBoundLatitude) : null,
        bottomRightBoundLongitude: inmap.bottomRightBoundLongitude ? (typeof(inmap.bottomRightBoundLongitude) == 'string' ?
          parseFloat(inmap.bottomRightBoundLongitude) : inmap.bottomRightBoundLongitude) : null,
        zoomToBounds: inmap.zoomToBounds,
        styleId: inmap.styleId,
        groupId: inmap.groupId,
        infoId: inmap.infoId,
      }
    });

    return NextResponse.json({
      message: "Success",
      maps
    });
  } catch (e) {
    throw(e);
  }
}

export async function DELETE(request: Request, context: any) {
  if(!Auth(request)){ //protected endpoint
    return NextResponse.json({
        message: "Not Authorized",
        error: "Auth Token Invaild",
    }, {status: 401});
  }
  const {params} = context;


  await prisma.map.delete({
      where:{
          id: params.id
      }
  });

  return NextResponse.json({
      message: "successful"
  });
}