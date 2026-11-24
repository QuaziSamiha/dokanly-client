"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IExpendableListItem } from "@/types";
import React from "react";

interface IExpendableList {
  list: IExpendableListItem[];
  classes?: string;
}

export default function ExpendableList({ list, classes }: IExpendableList) {
  // console.log('meow meow list', list);
  return (
    <div className={`${classes}`}>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        {list.map((item, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger className="cursor-pointer">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
