"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminHomeBar() {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!adminUser) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      setAdminUser(null);
    } catch (err) {
      console.error("Erro ao sair:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="admin-quickbar" aria-label="Barra de Acesso Administrativo">
      <div className="container admin-quickbar-inner">
        <div className="admin-quickbar-left">
          <span className="admin-quickbar-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Modo Administrador
          </span>
          <span className="admin-quickbar-email">
            {adminUser.email || "Logado"}
          </span>
        </div>

        <div className="admin-quickbar-actions">
          <Link href="/admin?tab=home" className="btn-quickbar btn-quickbar--primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar Textos da Home
          </Link>

          <Link href="/admin?tab=posts" className="btn-quickbar btn-quickbar--ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Blog
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn-quickbar btn-quickbar--logout"
            title="Encerrar sessão de administrador"
          >
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </aside>
  );
}
