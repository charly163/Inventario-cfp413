import React from 'react';

export default function Footer() {
  return (
    <footer className="py-4 px-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CFP 413 - Sistema de Inventario
        </div>
        <div className="text-sm text-muted-foreground mt-2 md:mt-0">
          Versión 38 - {new Date().toLocaleDateString('es-AR')}
        </div>
      </div>
    </footer>
  );
}
