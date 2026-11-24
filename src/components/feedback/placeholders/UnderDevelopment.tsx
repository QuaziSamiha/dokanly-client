"use client";

import type React from "react";

import {
  HardHat,
  Construction,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { Progress } from "@radix-ui/react-progress";

export default function UnderDevelopment() {
  const [progress] = useState(90);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 mt-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-greenPrimary-700">
              <Construction size={48} color="white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-greenPrimary-700">
            Under Development
          </h1>
          <p className="text-lg md:text-xl text-neutralPrimary-700 max-w-2xl mx-auto">
            We&apos;re working hard to bring you an amazing new feature. This
            section is currently under construction.
          </p>
        </div>

        <Card className="mb-8 border-0 shadow-lg overflow-hidden">
          <div className="py-4 px-6 flex items-center gap-2 text-white bg-greenPrimary-700">
            <HardHat size={20} />
            <h2 className="text-xl font-semibold">Development Progress</h2>
          </div>
          <CardContent className="p-6 bg-white">
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Overall Completion</span>
                <span className="font-bold">{progress}%</span>
              </div>

              <div className="bg-gray-300 rounded">
                <Progress
                  value={progress}
                  className="h-2 bg-greenPrimary-700 rounded-l w-[90%]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-gray-600" />
                <span>Design Phase</span>
                <Badge className="ml-auto bg-gray-200 text-gray-800">
                  Partial Completed
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Construction size={20} className="text-greenPrimary-700" />
                <span>Backend Development</span>
                <Badge className="ml-auto bg-blue-800 text-white">
                  Done 95%
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Construction size={20} className="text-greenPrimary-700" />
                <span>Frontend Implementation</span>
                <Badge className="ml-auto bg-blue-800 text-white">
                  Done 98%
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-400" />
                <span>Testing & QA</span>
                <Badge className="ml-auto" variant="outline">
                  Pending
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-700" />
                <span>Deployment</span>
                <Badge className="ml-auto bg-green-800 text-white">Done</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-greenPrimary-700 bg-opacity-20">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Expected Completion
                  </h3>
                  <p className="text-gray-600 mb-2">
                    We&apos;re working diligently to complete this feature soon.
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-greenPrimary-700 text-white">
                    Coming in 2 weeks
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-redActual bg-opacity-20">
                  <AlertTriangle size={24} className="text-redActual" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Why the Wait?</h3>
                  <p className="text-gray-600">
                    We&apos;re ensuring everything is perfect before launch.
                    Quality takes time!
                  </p>
                  <div className="mt-2">
                    <Link href={"/"}>
                      <Button
                        variant="link"
                        className="p-0 h-auto flex items-center gap-1 text-redActual"
                      >
                        Learn more <ChevronRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="mb-4">
            In the meantime, you can explore other sections of our platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={"/"}>
              <Button className="bg-white hover:bg-grey-50 border border-greenPrimary-700 text-greenPrimary-700 cursor-pointer">
                Return to Home
              </Button>
            </Link>
            <Link href={"https://atilimited.net/"}>
              <Button className=" bg-greenPrimary-700 hover:bg-greenPrimary-800 text-white border border-greenPrimary-700 cursor-pointer">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
