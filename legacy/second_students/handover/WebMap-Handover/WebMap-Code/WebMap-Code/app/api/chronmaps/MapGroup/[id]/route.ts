import { PrismaClient } from "@/prisma/generated_schema/chronmaps";
import { NextResponse } from "next/server";
import { Auth } from "../../auth/auth";

const prisma = new PrismaClient();

export async function GET(request: Request, context: any) { 

    const {params} = context;
    try{
      const MapGroup = await prisma.mapGroup.findFirst({
        where: {
            id: params.id
        },
        include: {
            maps:true
        }
      });

      return NextResponse.json({
        MapGroup
      });
    }
    catch(e){
      throw(e);
    }
}

export async function PUT(request:Request, context: any) {
  if(!Auth(request)){ //protected endpoint
    return NextResponse.json({
        message: "Not Authorized",
        error: "Auth Token Invaild",
    }, {status: 401});
  }
  const {params} = context;

  const newMapGroup = await request.json();

  try {
    const newgroup = await prisma.mapGroup.update({
      where: {
        id: params.id
      },
      data: {
        groupName: newMapGroup.name,
        label: newMapGroup.label
      }
    });

    return NextResponse.json({
      message: "Successful",
      newgroup
    })
  } catch (e) {
    throw(e);
  }
}

export async function DELETE(request: Request,context: any) {
  if(!Auth(request)){ //protected endpoint
    return NextResponse.json({
        message: "Not Authorized",
        error: "Auth Token Invaild",
    }, {status: 401});
}
  const {params} = context;

  try{

    const group = await prisma.mapGroup.findFirst({
      where: {
        id: params.id
      }
    })

    if(!group){
        console.log("ERROR: Group id not in DB");
        return NextResponse.json({
            message: "Inviald group",
        }, { status: 400 });
    }

    const Gid = group.id

    await prisma.map.deleteMany({
      where: { groupId: Gid}
    })

    await prisma.mapGroup.delete({
      where:{
          id: params.id
      }
    });
  }
  catch(e){
    throw(e);
  }

  return NextResponse.json({
      message: "Map group deleted",
      id: params.id
  })
}
