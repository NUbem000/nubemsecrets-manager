"use client";

import { useEffect, useState } from "react";
import { SecretsList } from "@/components/SecretsList";
import { CreateSecretDialog } from "@/components/CreateSecretDialog";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import type { Secret } from "@/types";

export default function DashboardPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  useEffect(() => {
    if (user && !loading) {
      loadSecrets();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const userData = await api.getUser();
      console.log('User authenticated:', userData);
      setUser(userData);
      setAuthChecked(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Auth check failed:', error);
      setAuthChecked(true);
      setLoading(false);

      // Only redirect if we get a 401 (not authenticated)
      if (error.response?.status === 401) {
        console.log('User not authenticated, redirecting to login...');
        setTimeout(() => {
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
        }, 1000);
      }
    }
  };

  const loadSecrets = async () => {
    try {
      console.log('Loading secrets...');
      const data = await api.listSecrets();
      console.log('Secrets loaded:', data.length);
      setSecrets(data);
    } catch (error: any) {
      console.error('Error loading secrets:', error);

      // If we get 401 while loading secrets, the session expired
      if (error.response?.status === 401) {
        setUser(null);
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleCreateSecret = async (name: string, value: string) => {
    try {
      await api.createSecret(name, value);
      await loadSecrets();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error creating secret");
    }
  };

  const handleDeleteSecret = async (name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el secreto "${name}"?`)) {
      return;
    }

    try {
      await api.deleteSecret(name);
      await loadSecrets();
    } catch (error) {
      console.error("Error deleting secret:", error);
      alert("Error al eliminar el secreto");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Secretos</h1>
            <CreateSecretDialog onCreate={handleCreateSecret} />
          </div>

          <SecretsList
            secrets={secrets}
            onDelete={handleDeleteSecret}
            onRefresh={loadSecrets}
          />
        </div>
      </main>
    </div>
  );
}