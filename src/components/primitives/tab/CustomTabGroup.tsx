import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICustomTabProps } from "@/types";
import React from "react";

export default function CustomTabGroup({
  defaultTab,
  tabList,
  tabContent,
}: ICustomTabProps) {
  return (
    <div className="flex flex-col gap-12 w-full">
      <Tabs
        defaultValue={defaultTab}
        className="flex items-start justify-start"
      >
        <TabsList className="flex items-center justify-center md:gap-2 w-fit p-7 border border-neutralPrimary-300 rounded-lg">
          {tabList.map((tab, index) => (
            <TabsTrigger
              key={index}
              value={tab.value}
              className="text-sm font-semibold text-neutralPrimary-700 cursor-pointer px-5 py-4 data-[state=active]:text-greenPrimary-500 data-[state=active]:bg-neutralPrimary-200 rounded-md"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabContent.map((tab, index) => (
          <TabsContent key={index} value={tab.value} className="w-full mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
