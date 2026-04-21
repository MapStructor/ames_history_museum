import { LayerData, PrismaClient} from "@/prisma/generated_schema/NorthAmericaLandowners";
import { NextResponse } from "next/server";

export async function GET() {
    const prisma = new PrismaClient();
    const LayerData = (await prisma.layerData.findMany({
        orderBy: {
            viewOrder: 'asc'
        }
    }))

    return NextResponse.json({
        LayerData
    })
}

export async function POST(request: Request) {
    const layerData:LayerData = await request.json()
    const prisma = new PrismaClient();

    try {
        // Index within the topLayerClass
        const idx = await prisma.layerData.count({
            where: {
                topLayerClass: layerData.topLayerClass
            }
        })

        // Index within the entire LayerData
        const viewIdx = await prisma.layerData.count({})

        const r = await prisma.layerData.create({
            data:{
                name:layerData.name,
                iconColor:layerData.iconColor,
                iconType:layerData.iconType,
                label:layerData.label,
                longitude:layerData.longitude,
                latitude:layerData.latitude,
                zoom:layerData.zoom,
                bearing:layerData.bearing,
                topLayerClass:layerData.topLayerClass,
                infoId:layerData.infoId,
                type:layerData.type,
                sourceType:layerData.sourceType,
                sourceUrl:layerData.sourceUrl,
                sourceId:layerData.sourceId,
                paint:layerData.paint,
                layout:layerData.layout,
                sourceLayer:layerData.sourceLayer,
                hover:layerData.hover,
                time:layerData.time,
                click:layerData.click,
                hoverStyle:layerData.hoverStyle,
                clickStyle:layerData.clickStyle,
                clickHeader:layerData.clickHeader,
                hoverContent:layerData.hoverContent,
                order:idx + 1,
                viewOrder:viewIdx + 1,
            }
        })
        return NextResponse.json({
            r
        })
    }
    catch (e) 
    {
        throw(e)
    }

}

export async function PUT(request: Request) {
    const layerData:LayerData = await request.json();
    const prisma = new PrismaClient();

    try{
        const r = await prisma.layerData.update({
            where:{
                id: layerData.id
            },
            data: {
                name:layerData.name,
                iconColor:layerData.iconColor,
                iconType:layerData.iconType,
                label:layerData.label,
                longitude:layerData.longitude,
                latitude:layerData.latitude,
                zoom:layerData.zoom,
                bearing:layerData.bearing,
                topLayerClass:layerData.topLayerClass,
                infoId:layerData.infoId,
                type:layerData.type,
                sourceType:layerData.sourceId,
                sourceUrl:layerData.sourceUrl,
                sourceId:layerData.sourceId,
                paint:layerData.paint,
                sourceLayer:layerData.sourceLayer,
                hover:layerData.hover,
                time:layerData.time,
                click:layerData.click,
                viewOrder:layerData.viewOrder
            }
        })
        return NextResponse.json({
            r
        })
    }
    catch(e) {
        throw(e)
    }
}


