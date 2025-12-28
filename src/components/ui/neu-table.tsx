import * as React from "react";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU TABLE - Neumorphic Table Component
   
   Features:
   - Concave container (pressed in effect)
   - Subtle borders for rows
   - Hover states for interactivity
   - Responsive design
   
   Usage:
   <NeuTable>
     <NeuTableHeader>
       <NeuTableRow>
         <NeuTableHead>Name</NeuTableHead>
         <NeuTableHead>Email</NeuTableHead>
       </NeuTableRow>
     </NeuTableHeader>
     <NeuTableBody>
       <NeuTableRow interactive>
         <NeuTableCell>John Doe</NeuTableCell>
         <NeuTableCell>john@example.com</NeuTableCell>
       </NeuTableRow>
     </NeuTableBody>
   </NeuTable>
   ================================================================= */

/* Table Container */
interface NeuTableProps extends React.HTMLAttributes<HTMLDivElement> {}

const NeuTable = React.forwardRef<HTMLDivElement, NeuTableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-2xl",
          "neu-surface",
          "neu-concave-md",
          className
        )}
        {...props}
      >
        <table className="w-full">
          {children}
        </table>
      </div>
    );
  }
);
NeuTable.displayName = "NeuTable";

/* Table Header */
interface NeuTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const NeuTableHeader = React.forwardRef<HTMLTableSectionElement, NeuTableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn(className)} {...props} />
  )
);
NeuTableHeader.displayName = "NeuTableHeader";

/* Table Body */
interface NeuTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const NeuTableBody = React.forwardRef<HTMLTableSectionElement, NeuTableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("divide-y divide-[var(--neu-border-light)]", className)}
      {...props}
    />
  )
);
NeuTableBody.displayName = "NeuTableBody";

/* Table Row */
interface NeuTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  interactive?: boolean;
}

const NeuTableRow = React.forwardRef<HTMLTableRowElement, NeuTableRowProps>(
  ({ interactive = false, className, onClick, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        onClick={onClick}
        className={cn(
          "transition-all duration-150",
          "border-b border-[var(--neu-border-light)] last:border-0",
          interactive && [
            "cursor-pointer",
            "hover:bg-[var(--neu-surface-hover)]",
            "active:bg-[var(--neu-surface-active)]",
          ],
          className
        )}
        {...props}
      />
    );
  }
);
NeuTableRow.displayName = "NeuTableRow";

/* Table Head */
interface NeuTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const NeuTableHead = React.forwardRef<HTMLTableCellElement, NeuTableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "neu-text-label font-semibold",
        "px-6 py-4",
        "text-left",
        "bg-[var(--neu-base-light)]",
        className
      )}
      {...props}
    />
  )
);
NeuTableHead.displayName = "NeuTableHead";

/* Table Cell */
interface NeuTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const NeuTableCell = React.forwardRef<HTMLTableCellElement, NeuTableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("px-6 py-4 neu-text-body", className)}
      {...props}
    />
  )
);
NeuTableCell.displayName = "NeuTableCell";

export {
  NeuTable,
  NeuTableHeader,
  NeuTableBody,
  NeuTableRow,
  NeuTableHead,
  NeuTableCell,
};
