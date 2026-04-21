import { LayerGroup, PrismaClient } from "@/prisma/generated_schema/NorthAmericaLandowners";
import { NextResponse } from "next/server";
import { Auth } from "../../auth/auth";

export async function GET(request: Request, context: any) {
    const {params} = context;
    const prisma = new PrismaClient();
    const layerGroup = await prisma.layerGroup.findFirst({
        where: {
            id: params.id
        },
        include: {
            layers:true
        }
    })

    return NextResponse.json({
        layerGroup
    })
}

export async function PUT(request: Request, context: any) {
    if(!Auth(request)){ //protected endpoint
        return NextResponse.json({
            message: "Not Authorized",
            error: "Auth Token Invaild",
        }, {status: 401});
      }
    const { params } = context;
    const LayerrGroup: LayerGroup = await request.json()
    const prisma = new PrismaClient();
    const layer = await prisma.layerGroup.update({
        where: {
            id: params.id
        },
        data: {
            name: LayerrGroup.name,
            layerSectionId: LayerrGroup.layerSectionId,
            longitude: LayerrGroup.longitude == '' ? null : LayerrGroup.longitude,
            latitude: LayerrGroup.latitude == '' ? null : LayerrGroup.latitude,
            zoom: LayerrGroup.zoom,
            bearing: LayerrGroup.bearing,
            topLeftBoundLatitude: LayerrGroup.topLeftBoundLatitude ? (typeof(LayerrGroup.topLeftBoundLatitude) == 'string' ?
                parseFloat(LayerrGroup.topLeftBoundLatitude) : LayerrGroup.topLeftBoundLatitude) : null,
            topLeftBoundLongitude:  LayerrGroup.topLeftBoundLongitude ? (typeof(LayerrGroup.topLeftBoundLongitude) == 'string' ?
                parseFloat(LayerrGroup.topLeftBoundLongitude) : LayerrGroup.topLeftBoundLongitude) : null,
            bottomRightBoundLatitude: LayerrGroup.bottomRightBoundLatitude ? (typeof(LayerrGroup.bottomRightBoundLatitude) == 'string' ?
                parseFloat(LayerrGroup.bottomRightBoundLatitude) : LayerrGroup.bottomRightBoundLatitude) : null,
            bottomRightBoundLongitude: LayerrGroup.bottomRightBoundLongitude ? (typeof(LayerrGroup.bottomRightBoundLongitude) == 'string' ?
                parseFloat(LayerrGroup.bottomRightBoundLongitude) : LayerrGroup.bottomRightBoundLongitude) : null,
            zoomToBounds: LayerrGroup.zoomToBounds,
            infoId: LayerrGroup.infoId ?? ''
        }
    })

    return NextResponse.json({
        layer
    })
}

export async function DELETE(request: Request, context: any) {
    if(!Auth(request)){ //protected endpoint
        return NextResponse.json({
            message: "Not Authorized",
            error: "Auth Token Invaild",
        }, {status: 401});
      }
    const {params} = context;
    const prisma = new PrismaClient();
    await prisma.layerGroup.delete({
        where:{
            id: params.id
        }
    })

    return NextResponse.json({
        message: "deleted"
    })
}