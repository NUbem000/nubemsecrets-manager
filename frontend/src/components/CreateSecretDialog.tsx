import { useState } from "react";
import { Plus } from "lucide-react";
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

interface CreateSecretDialogProps {
  onCreate: (name: string, value: string) => Promise<void>;
}

export function CreateSecretDialog({ onCreate }: CreateSecretDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !value) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      alert(
        "El nombre solo puede contener letras, números, guiones y guiones bajos"
      );
      return;
    }

    setLoading(true);

    try {
      await onCreate(name, value);
      setName("");
      setValue("");
      setOpen(false);
    } catch (error: any) {
      alert(error.message || "Error al crear el secreto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Secreto</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Secreto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Secreto</Label>
            <Input
              id="name"
              type="text"
              placeholder="mi-api-key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              pattern="[a-zA-Z0-9_-]+"
              title="Solo letras, números, guiones y guiones bajos"
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo letras, números, guiones y guiones bajos
            </p>
          </div>

          <div>
            <Label htmlFor="value">Valor del Secreto</Label>
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
              {loading ? "Creando..." : "Crear Secreto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}