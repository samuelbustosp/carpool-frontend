export default function CurrentTripLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  )
}