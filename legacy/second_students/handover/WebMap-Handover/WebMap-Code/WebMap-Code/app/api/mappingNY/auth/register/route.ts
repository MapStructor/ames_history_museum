import { User, PrismaClient } from "@/prisma/generated_schema/myFirstDatabase";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Auth } from "../auth";

const prisma = new PrismaClient();

// Register 
export async function POST(request: Request) {

    // Not needed since we are CREATING a user, not AUTHENTICATING
    // if(!Auth(request)){ //protected endpoint
    //     return NextResponse.json({
    //         message: "Not Authorized",
    //         error: "Auth Token Invaild",
    //     }, {status: 401});
    //   }
      
    const user: User = await request.json();

    if (!user.username || !user.password) { //check username and password
        return NextResponse.json(
            { message: "Missing username and password" },
            { status: 400 }
        );
    }

    try {
       
        const existingUser = await prisma.user.findFirst({ // Check if the username already exists 
            where: {
                username: user.username,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Username already taken" },
                { status: 400 }
            );
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        
        await prisma.user.create({// add the user in the database
            data: {
                username: user.username,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "User successfully registered"},
            { status: 201 }
        );
    } catch (err) {
        console.error("REGISTER ERROR: ", err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}