import { LayerSection, PrismaClient } from "@/prisma/generated_schema/NorthAmericaLandowners";
import { NextResponse } from "next/server";
import { Auth } from "../../auth/auth";

export async function GET(request: Request, context: any) {
    const {params} = context; 
    const prisma = new PrismaClient();
    const layerSection = await prisma.layerSection.findFirst({
        where: {
            id: params.id
        },
        include: {
            layerGroups: {
                include: {
                    layers: true
                }
            }
        }
    })

    return NextResponse.json({
        layerSection
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
    const LayerrSection: LayerSection = await request.json()
    const prisma = new PrismaClient();
    const layer = await prisma.layerSection.update({
        where: {
            id: params.id
        },
        data: {
            name: LayerrSection.name,
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
    try {
        await prisma.layerSection.delete({
            where: {
                id: params.id
            }
        })

        return NextResponse.json({
            Messgae: "Success"
        })
    }
    catch(e) {
        console.log(e) 
        throw(e)
    }

}