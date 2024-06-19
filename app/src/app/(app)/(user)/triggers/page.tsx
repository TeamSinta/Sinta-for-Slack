"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import comingsoon from "../../../../../public/comingsoon.png";
import Image from "next/image";

export default function Triggers() {
    return (
        <div className="m-48 flex h-screen flex-col items-center ">
            <Card className="mb-9 w-96 shadow-lg">
                <CardHeader className="flex flex-col items-center">
                    <Clock className="text-6xl text-gray-600" />
                    <CardTitle className="mt-4 text-2xl font-semibold">
                        Coming Soon
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                    <Image
                        src={comingsoon}
                        alt="Alert"
                        className="rounded-lg"
                    />

                    <p className="mb-4 mt-4 text-gray-700">
                        Our triggers feature is under development and will be
                        available soon. Stay tuned!
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => alert("Notify me when available!")}
                    >
                        Notify Me
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
