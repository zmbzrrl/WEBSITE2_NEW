import React from "react";

interface GridCellProps {
  index: number;
  onClick: (index: number) => void;
  children?: React.ReactNode;
}

export const GridCell: React.FC<GridCellProps> = ({ index, onClick, children }) => {
  return (
    <div
      onClick={() => onClick(index)}
      style={{
        width: "100px",
        height: "100px",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}; 