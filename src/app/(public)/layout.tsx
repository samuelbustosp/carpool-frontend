export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen overflow-y-auto px-6 sm:px-8">
      {children}
    </div>
  );
}