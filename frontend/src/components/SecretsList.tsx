import { useState } from "react";
import { Trash2, Eye, EyeOff, Copy, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import type { Secret } from "@/types";
import { format } from "date-fns";
import { UpdateSecretDialog } from "./UpdateSecretDialog";

interface SecretsListProps {
  secrets: Secret[];
  onDelete: (name: string) => void;
  onRefresh: () => void;
}

export function SecretsList({ secrets, onDelete, onRefresh }: SecretsListProps) {
  const [visibleSecrets, setVisibleSecrets] = useState<{ [key: string]: string }>({});
  const [loadingSecrets, setLoadingSecrets] = useState<{ [key: string]: boolean }>({});

  const toggleSecretVisibility = async (secretName: string) => {
    if (visibleSecrets[secretName]) {
      const newVisible = { ...visibleSecrets };
      delete newVisible[secretName];
      setVisibleSecrets(newVisible);
      return;
    }

    setLoadingSecrets({ ...loadingSecrets, [secretName]: true });

    try {
      const { value } = await api.getSecret(secretName);
      setVisibleSecrets({ ...visibleSecrets, [secretName]: value });
    } catch (error) {
      console.error("Error loading secret:", error);
      alert("Error al cargar el secreto");
    } finally {
      setLoadingSecrets({ ...loadingSecrets, [secretName]: false });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles");
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    const date = new Date(parseInt(timestamp) * 1000);
    return format(date, "dd/MM/yyyy HH:mm");
  };

  if (secrets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">No hay secretos creados</p>
        <p className="text-gray-400 text-sm mt-2">
          Haz clic en &quot;Nuevo Secreto&quot; para crear uno
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200">
        {secrets.map((secret) => (
          <li key={secret.name} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {secret.displayName}
                  </h3>
                  {secret.versionCount && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      {secret.versionCount} versiones
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Creado: {formatDate(secret.createTime)}
                </p>

                {visibleSecrets[secret.name] && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-md">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-800 break-all font-mono">
                        {visibleSecrets[secret.name]}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(visibleSecrets[secret.name])}
                        title="Copiar"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleSecretVisibility(secret.name)}
                  disabled={loadingSecrets[secret.name]}
                >
                  {visibleSecrets[secret.name] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>

                <UpdateSecretDialog
                  secretName={secret.name}
                  onUpdate={onRefresh}
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(secret.name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}