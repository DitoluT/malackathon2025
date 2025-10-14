import { Info } from "lucide-react";
import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  info?: string;
  icon?: ReactNode;
}

const ChartCard = ({ title, children, info, icon }: ChartCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 gauss-shadow hover:gauss-glow gauss-transition animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 hover:bg-muted rounded-md gauss-transition">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="w-full h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
