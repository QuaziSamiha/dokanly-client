interface TableSkeletonProps {
  columns: number;
  rows: number;
}

export default function TableSkeleton({ columns, rows }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-4">
              <div
                className={`h-4 rounded-md bg-neutralPrimary-200 ${
                  ["w-3/4", "w-full", "w-2/3", "w-1/2"][colIdx % 4]
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// import React from "react";

// export default function TableSkeleton({
//   columns = 5,
//   rows = 8,
// }: {
//   columns?: number;
//   rows?: number;
// }) {
//   return (
//     <tbody className="bg-white animate-pulse">
//       {Array.from({ length: rows }).map((_, rowIdx) => (
//         <tr key={rowIdx} className="border border-gray-100">
//           {Array.from({ length: columns }).map((_, colIdx) => (
//             <td key={colIdx} className="px-6 py-4">
//               <div className="h-4 w-full bg-gray-100 rounded"></div>
//             </td>
//           ))}
//         </tr>
//       ))}
//     </tbody>
//   );
// }
