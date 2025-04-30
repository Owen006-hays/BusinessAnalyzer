import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Lock } from "lucide-react";

interface PasswordPromptDialogProps {
  onSubmit: (password: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  error?: string | null;
}

const PasswordPromptDialog: React.FC<PasswordPromptDialogProps> = ({
  onSubmit,
  onCancel,
  isOpen,
  error,
}) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-primary" />
            パスワード保護されたPDF
          </DialogTitle>
          <DialogDescription>
            このPDFはパスワードで保護されています。閲覧するにはパスワードを入力してください。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <Input
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
            />
            
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!password}>
              開く
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordPromptDialog;