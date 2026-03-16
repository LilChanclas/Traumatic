interface Props {
  titulo: string
  children: React.ReactNode
}

export default function DashboardCard({ titulo, children }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
        {titulo}
      </h3>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}