"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export default function Triggers() {
    return (
        <div className="flex flex-col items-center m-48 h-screen ">
            <Card className="w-96 shadow-lg mb-9">
                <CardHeader className="flex flex-col items-center">
                    <Clock className="text-6xl text-gray-600" />
                    <CardTitle className="mt-4 text-2xl font-semibold">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                    <p className="mb-4 text-gray-700">
                        Our triggers feature is under development and will be available soon. Stay tuned!
                    </p>
                    <Button variant="outline" onClick={() => alert('Notify me when available!')}>
                        Notify Me
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
