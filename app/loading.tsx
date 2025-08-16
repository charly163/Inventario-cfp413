import { Loader2, Database, Package, Wrench } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo animado */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <Database className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Spinner principal */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-xl font-semibold text-slate-800">Cargando Sistema de Inventario</div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <p className="text-slate-600 text-lg">Centro de Formación Profesional 413</p>
          <p className="text-slate-500">Inicializando sistema de gestión del pañol...</p>
        </div>

        {/* Iconos animados */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs text-slate-500">Herramientas</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center animate-bounce"
              style={{ animationDelay: "0.1s" }}
            >
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-xs text-slate-500">Insumos</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center animate-bounce"
              style={{ animationDelay: "0.2s" }}
            >
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs text-slate-500">Base de Datos</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-64 mx-auto">
          <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Conectando con Supabase...</p>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-white/50 rounded-lg border border-slate-200 max-w-md mx-auto">
          <p className="text-sm text-slate-600">
            <strong>Sistema de Inventario v1.0</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">Gestión completa de herramientas, insumos y préstamos</p>
        </div>
      </div>
    </div>
  )
}
