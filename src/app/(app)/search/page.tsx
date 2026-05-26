import SearchBar from "@/modules/search/components/SearchBar";

export default function SearchPage() {
  return (
    <main className="max-w-lg mx-auto w-full">
      <h1 className="text-xl mb-2">Buscá tu próximo viaje</h1>
      <div className="w-full flex items-center justify-center gap-4">
        <SearchBar/>
      </div>
    </main>

  );
}
