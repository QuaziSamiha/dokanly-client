import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { IBreadCrumbProps } from "@/types";
import Link from "next/link";
import React from "react";

export default function CustomBreadCrumb({
  currentItem,
  previousItemLinks,
}: IBreadCrumbProps) {
  return (
    <div className="min-w-0">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <div className="flex shrink-0 items-center gap-3 text-greenPrimary-500/50 font-semibold">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <span>/</span>
          </div>
          {previousItemLinks?.map((item, index) => (
            <div key={index} className="flex shrink-0 items-center gap-3 text-greenPrimary-500/50 font-semibold capitalize">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.link}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <span>/</span>
            </div>
          ))}
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="block truncate text-greenPrimary-500 font-semibold capitalize" title={currentItem}>{currentItem}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   //   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { IBreadCrumbProps } from "@/types";
// import Link from "next/link";
// import React from "react";

// export default function CustomBreadCrumb({
//   currentItem,
//   previousItemLinks,
// }: IBreadCrumbProps) {
//   return (
//     <div>
//       <Breadcrumb>
//         <BreadcrumbList>
//           <div className="flex items-center gap-3">
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href="/">Home</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <span>/</span>
//           </div>
//           {/* <BreadcrumbSeparator /> */}
//           {/* <BreadcrumbItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger className="flex items-center gap-1">
//                 <BreadcrumbEllipsis className="size-4" />
//                 <span className="sr-only">Toggle menu</span>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start">
//                 <DropdownMenuItem>Documentation</DropdownMenuItem>
//                 <DropdownMenuItem>Themes</DropdownMenuItem>
//                 <DropdownMenuItem>GitHub</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator /> */}
//           {previousItemLinks?.map((item, index) => (
//             <div key={index} className="flex items-center gap-3">
//               <BreadcrumbItem>
//                 <BreadcrumbLink asChild>
//                   <Link href={item.link}>{item.label}</Link>
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//               <span>/</span>
//               {/* <BreadcrumbSeparator /> */}
//             </div>
//           ))}
//           <BreadcrumbItem>
//             <BreadcrumbPage>{currentItem}</BreadcrumbPage>
//           </BreadcrumbItem>
//         </BreadcrumbList>
//       </Breadcrumb>
//     </div>
//   );
// }
