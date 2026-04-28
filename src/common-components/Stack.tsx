import React from "react";
import "./Stack.css";

type StackGap = "xs" | "sm" | "md" | "lg" | "xl";

interface StackProps {
  gap?: StackGap;
  className?: string;
  children: React.ReactNode;
}

const Stack: React.FC<StackProps> = ({
  gap = "md",
  className,
  children,
}) => {
  const classes = ["stack", `stack-gap-${gap}`, className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes}>{children}</div>;
};

export default Stack;
