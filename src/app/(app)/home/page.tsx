import Feed from "@/modules/feed/components/Feed";
import SearchBar from "@/modules/feed/components/SearchBar";

export default function HomePage() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="w-full flex items-center justify-center">
        <SearchBar/>
      </div>

      <div className="mt-4 flex items-center justify-center w-full">
        <Feed/>
      </div>
    </div>
  );
}
