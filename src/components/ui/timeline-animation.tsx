"use client";
import { useInView } from "framer-motion";
import { motion, type Variants } from "framer-motion";
import { type ElementType, type RefObject } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum?: number;
  timelineRef?: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  as?: ElementType;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: (i ?? 0) * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function TimelineContent({
  children, animationNum = 0, timelineRef, customVariants, className, as: Tag = "div",
}: TimelineContentProps) {
  const inView = useInView(timelineRef ?? { current: null }, { once: true, amount: 0.2 });
  const variants = customVariants ?? defaultVariants;

  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
