"use client";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-gold" />,
  title = "Exclusivo",
  description = "Funcionalidade única",
  date = "Agora",
  iconClassName = "text-gold",
  titleClassName = "text-gold",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-sm border-2 border-gold/20 bg-arcane-panel/80 backdrop-blur-sm px-4 py-3 transition-all duration-700",
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-arcane-dark after:to-transparent after:content-['']",
        "hover:border-gold/50 hover:bg-arcane-panel hover:shadow-[0_0_20px_rgba(200,155,60,0.12)]",
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-sm bg-gold/15 p-1.5 border border-gold/20">
          {icon}
        </span>
        <p className={cn("text-base font-cinzel font-bold tracking-wide", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap font-rajdhani text-base text-gold-light/80">{description}</p>
      <p className="font-rajdhani text-xs tracking-widest uppercase text-gold/40">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-sm before:outline-gold/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-arcane-dark/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-sm before:outline-gold/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-arcane-dark/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
