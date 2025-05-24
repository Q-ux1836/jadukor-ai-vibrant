
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface BuilderInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuilderInfoDialog({ open, onOpenChange }: BuilderInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="animate-scale-in text-center py-10">
        <DialogHeader>
          <DialogTitle className="mb-4 font-cinzel-deco text-3xl text-mystical-gold flex justify-center items-center gap-2">
            <Sparkles size={28} className="animate-sparkle" /> Builder Info
          </DialogTitle>
        </DialogHeader>
        <div className="text-lg font-quicksand text-mystical-dark">
          <span className="font-semibold">Build by </span>
          Arka Das <br />
          <span className="italic text-mystical-gold">(Chief of Kenfex IT)</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
