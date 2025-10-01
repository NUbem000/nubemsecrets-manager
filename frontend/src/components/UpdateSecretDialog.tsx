import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "@/lib/api";

interface UpdateSecretDialogProps {
  secretName: string;
  onUpdate: () => void;
}

export function UpdateSecretDialog({
  secretName,
  onUpdate,
}: UpdateSecretDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value) {
      alert("Por favor ingresa un valor");
      return;
    }

    setLoading(true);

    try {
      await api.updateSecret(secretName, value);
      setValue("");
      setOpen(false);
      onUpdate();
    } catch (error: any) {
      alert(error.message || "Error al actualizar el secreto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Editar">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Secreto: {secretName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Se creará una nueva versión del secreto. Las versiones anteriores se
            mantendrán en el historial.
          </p>

          <div>
            <Label htmlFor="value">Nuevo Valor</Label>
            <Input
              id="value"
              type="password"
              placeholder="sk-..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}