"use client";

import { motion, type HTMLMotionProps } from "motion/react";

export type GlassStrength = "soft" | "normal" | "strong";

type GlassProps = HTMLMotionProps<"div"> & {
  strength?: GlassStrength;
};

export function Glass({
  strength = "normal",
  className = "",
  ...props
}: GlassProps) {
  return <motion.div className={`glass glass--${strength} ${className}`} {...props} />;
}
