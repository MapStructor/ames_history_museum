import { LayerData, PrismaClient } from "@/prisma/generated_schema/Drawing";
import { NextResponse } from "next/server";
import { Auth } from "../../auth/auth";

export async function GET(request: Request, context: any) {
    const {params} = context;
    const prisma = new PrismaClient();
    const layerData = await prisma.layerData.findFirst({
        where:{
            id: params.id
        }
    })

    return NextResponse.json({
        layerData
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
    const Layerr = await request.json();
    const prisma = new PrismaClient();
    try{
    const layer = await prisma.layerData.update({
        where: {
            id: params.id
        },
        data: {
            name: Layerr.name,
            type: Layerr.type,
            iconColor: Layerr.iconColor,
            iconType: Layerr.iconType,
            label: Layerr.label,
            longitude: Layerr.longitude ? (typeof(Layerr.longitude) == 'string' ? parseFloat(Layerr.longitude) : Layerr.longitude) : null,
            latitude: Layerr.latitude ? (typeof(Layerr.latitude) == 'string' ? parseFloat(Layerr.latitude) : Layerr.latitude) : null,
            topLeftBoundLatitude: Layerr.topLeftBoundLatitude ? (typeof(Layerr.topLeftBoundLatitude) == 'string' ?
                parseFloat(Layerr.topLeftBoundLatitude) : Layerr.topLeftBoundLatitude) : null,
            topLeftBoundLongitude: Layerr.topLeftBoundLongitude ? (typeof(Layerr.topLeftBoundLongitude) == 'string' ?
                parseFloat(Layerr.topLeftBoundLongitude) : Layerr.topLeftBoundLongitude) : null,
            bottomRightBoundLatitude: Layerr.bottomRightBoundLatitude ? (typeof(Layerr.bottomRightBoundLatitude) == 'string' ?
                parseFloat(Layerr.bottomRightBoundLatitude) : Layerr.bottomRightBoundLatitude) : null,
            bottomRightBoundLongitude: Layerr.bottomRightBoundLongitude ? (typeof(Layerr.bottomRightBoundLongitude) == 'string' ?
                parseFloat(Layerr.bottomRightBoundLongitude) : Layerr.bottomRightBoundLongitude) : null,
            zoomToBounds: Layerr.zoomToBounds,
            enableByDefault: Layerr.enableByDefault,
            zoom: Layerr.zoom,
            bearing: Layerr.bearing,
            groupName: Layerr.groupName,
            topLayerClass: Layerr.topLayerClass, 
            infoId: Layerr.infoId,
            sourceType: Layerr.sourceType,
            sourceUrl: Layerr.sourceUrl,
            sourceId: Layerr.sourceId,
            paint: Layerr.paint,
            layout: Layerr.layout,
            sourceLayer: Layerr.sourceLayer,
            hover: Layerr.hover,
            time: Layerr.time,
            click: Layerr.click,
            hoverStyle:Layerr.hoverStyle,
            clickStyle:Layerr.clickStyle,
            clickHeader:Layerr.clickHeader,
            hoverContent:Layerr.hoverContent,
            standalone:Layerr.standalone,
        }
    })

    return NextResponse.json({
        layer
    })
} catch (error) {
    console.error("Error updating layer:", error);
    // Narrow the type of error
    if (error instanceof Error) {
        return NextResponse.json({
            message: "Internal Server Error",
            error: error.message, // Safely access the 'message' property
        }, { status: 500 });
    } else {
        return NextResponse.json({
            message: "Internal Server Error",
            error: "Unknown error occurred",
        }, { status: 500 });
    }
}}

export async function DELETE(request: Request, context: any) {
    if(!Auth(request)){ //protected endpoint
        return NextResponse.json({
            message: "Not Authorized",
            error: "Auth Token Invaild",
        }, {status: 401});
    }
    const {params} = context;
    const prisma = new PrismaClient();
    await prisma.layerData.delete({
        where:{
            id: params.id
        }
    })

    return NextResponse.json({
        message: "deleted"
    })
}