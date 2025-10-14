'use client';

import { useEffect, useState } from 'react';

export default function EnvTest() {
  const [env, setEnv] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const response = await fetch('/api/env');
        const data = await response.json();
        setEnv(data);
      } catch (err) {
        setError('Error al cargar las variables de entorno');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnv();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-xl font-bold mb-4">Error</h1>
        <p>{error}</p>
        <p className="mt-2">Por favor, verifica la consola del navegador para más detalles.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Verificación de Variables de Entorno</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Estado de las Variables de Entorno</h2>
        <div className="space-y-4">
          {Object.entries(env).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <span className="font-medium w-64">{key}:</span>
              <span className={`ml-2 ${value === '✅ Configurada' ? 'text-green-600' : 'text-red-600'}`}>
                {String(value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">Información Adicional:</h3>
          <p className="text-sm text-gray-600">
            Asegúrate de que las variables de entorno estén configuradas correctamente en tu archivo <code>.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
