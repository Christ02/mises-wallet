import { useState } from 'react';
import { 
  HiSearch,
  HiDownload,
  HiChevronDown
} from 'react-icons/hi';

interface Transaction {
  id: string;
  usuario: string;
  monto: string;
  fecha: string;
  tipo: 'Recarga' | 'Pago QR' | 'Evento' | 'Transferencia';
  estado: 'Éxito' | 'Fallida' | 'Pendiente';
}

export default function TransactionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: 'TXN-00123', 
      usuario: 'Juan Pérez', 
      monto: 'Q 50.00', 
      fecha: '28 Oct, 2024 10:30',
      tipo: 'Recarga',
      estado: 'Éxito'
    },
    { 
      id: 'TXN-00124', 
      usuario: 'María González', 
      monto: 'Q 25.50', 
      fecha: '28 Oct, 2024 11:15',
      tipo: 'Pago QR',
      estado: 'Fallida'
    },
    { 
      id: 'TXN-00125', 
      usuario: 'Carlos Rodríguez', 
      monto: 'Q 100.00', 
      fecha: '27 Oct, 2024 15:00',
      tipo: 'Evento',
      estado: 'Éxito'
    },
    { 
      id: 'TXN-00126', 
      usuario: 'Ana Martínez', 
      monto: 'Q 75.00', 
      fecha: '27 Oct, 2024 16:45',
      tipo: 'Transferencia',
      estado: 'Pendiente'
    },
    { 
      id: 'TXN-00127', 
      usuario: 'Luis García', 
      monto: 'Q 15.00', 
      fecha: '26 Oct, 2024 09:20',
      tipo: 'Pago QR',
      estado: 'Éxito'
    },
  ]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Todos' || tx.tipo === typeFilter;
    const matchesStatus = statusFilter === 'Todos' || tx.estado === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (estado: Transaction['estado']) => {
    switch (estado) {
      case 'Éxito':
        return 'bg-positive/10 text-positive border border-positive/20';
      case 'Fallida':
        return 'bg-negative/10 text-negative border border-negative/20';
      case 'Pendiente':
        return 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  const handleExport = () => {
    console.log('Exportando transacciones...');
    // Aquí iría la lógica de exportación
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transacciones Globales</h1>
          <p className="text-gray-400">Historial completo de todas las transacciones del sistema</p>
        </div>

        {/* Filters */}
        <div className="bg-dark-card rounded-xl border border-dark-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por ID o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all cursor-pointer"
              >
                <option value="Todos">Tipo (Todos)</option>
                <option value="Recarga">Recarga</option>
                <option value="Pago QR">Pago QR</option>
                <option value="Evento">Evento</option>
                <option value="Transferencia">Transferencia</option>
              </select>
              <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all cursor-pointer"
              >
                <option value="Todos">Estado (Todos)</option>
                <option value="Éxito">Éxito</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Fallida">Fallida</option>
              </select>
              <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-bg hover:bg-dark-border text-gray-300 hover:text-white font-medium rounded-lg transition-all border border-dark-border"
            >
              <HiDownload className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ID Transacción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-dark-bg/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-accent-blue font-mono text-sm">{tx.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{tx.usuario}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-semibold">{tx.monto}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400 text-sm">{tx.fecha}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{tx.tipo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(tx.estado)}`}>
                        {tx.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-4 border-t border-dark-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Mostrando {filteredTransactions.length} de {transactions.length} transacciones
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all">
                  Anterior
                </button>
                <button className="px-3 py-1 text-sm bg-primary-red text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all">
                  2
                </button>
                <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all">
                  3
                </button>
                <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all">
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

