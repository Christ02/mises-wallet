import Layout from '../components/layout/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-400">Bienvenido a tu panel de control</p>
      </div>
      
      <div className="bg-dark-card rounded-xl sm:rounded-2xl border border-dark-border p-4 sm:p-6 lg:p-8">
        <p className="text-gray-400 text-sm sm:text-base">El contenido del dashboard se agregará aquí.</p>
      </div>
    </Layout>
  );
}
