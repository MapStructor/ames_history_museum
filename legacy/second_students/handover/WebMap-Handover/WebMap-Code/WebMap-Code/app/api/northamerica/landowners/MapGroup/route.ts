import { MapGroup, PrismaClient} from "@/prisma/generated_schema/NorthAmericaLandowners";
import { NextResponse } from "next/server";
import { Auth } from "../auth/auth";

const prisma = new PrismaClient();

export async function GET(request:Request) {

  console.log("INSIDE THE MAPGROUP ROUTE GET")

  const groups = (await prisma.mapGroup.findMany({
    include: {
        maps:true
    }
  }))

  console.log("INSIDE THE MAPGROUP ROUTE GET")

return NextResponse.json({
    groups
})

}

export async function POST(request:Request) {
  if(!Auth(request)){ //protected endpoint
    return NextResponse.json({
        message: "Not Authorized",
        error: "Auth Token Invaild",
    }, {status: 401});
  }

  const inputmapGroup:MapGroup = await request.json();

  if(!inputmapGroup.groupName || !inputmapGroup.label){
    console.log("ERROR: Missing data");
    return NextResponse.json({
        message: "Missing data",
        error: "Missing data",
    }, { status: 400 });
  }

  try{
    const newMapGroup = await prisma.mapGroup.create({
      data: {
        groupName: inputmapGroup.groupName,
        label: inputmapGroup.label,
      }
    })

    return NextResponse.json({
      newMapGroup
    })
  }
  catch(e){
    throw(e);
  }
}