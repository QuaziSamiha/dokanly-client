import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICustomTabProps } from "@/types";
import React from "react";

export default function CustomTab({
  defaultTab,
  tabList,
  tabContent,
}: ICustomTabProps) {
  return (
    <div className="w-full max-xl:p-4">
      <Tabs
        defaultValue={defaultTab}
        className="flex items-center justify-center"
      >
        <TabsList className="flex w-fit max-w-full items-center justify-start overflow-x-auto [scrollbar-width:none] sm:gap-4 md:gap-8">
          {tabList.map((tab, index) => (
            <TabsTrigger
              key={index}
              value={tab.value}
              className="shrink-0 text-sm sm:text-base text-neutralPrimary-700 font-semibold hover:underline cursor-pointer"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabContent.map((tab, index) => (
          <TabsContent key={index} value={tab.value} className="w-full">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
