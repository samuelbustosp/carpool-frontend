export default function TripSkeleton() {
  return (
    <div className="mb-4 p-4 border border-gray-2 rounded-xl shadow-sm animate-pulse">
      {/* Parte superior: horas y ciudades */}
      <div className="flex items-center">
        <div className="flex flex-col w-full">
          <div className="flex items-start justify-between w-full">
            <div className="flex items-start justify-between w-2/3 mb-3">
              <div className="w-auto">
                <div className="h-5 w-12 bg-gray-2 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-2 rounded mb-1"></div>
                <div className="h-2 w-22 bg-gray-2 rounded"></div>
              </div>
              <div className="flex-1 mx-2 my-3 border-t border-gray-2"></div>
              <div className="w-auto">
                <div className="h-5 w-12 bg-gray-2 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-2 rounded mb-1"></div>
                <div className="h-2 w-24 bg-gray-2 rounded"></div>
              </div>
            </div>
            
            <div className="h-7 w-16 bg-gray-2 rounded"></div>
          </div>
        </div>
      </div>
      
      <div className="my-2 border-t border-gray-2"></div>
      
      {/* Parte inferior: info del conductor */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6.25 w-6.25 rounded-full bg-gray-2"></div>
            <div className="h-4 w-24 bg-gray-2 rounded"></div>
          </div>
          
          <div className="border-l border-gray-2 px-4">
            <div className="h-4 w-10 bg-gray-2 rounded"></div>
          </div>
        </div>
        
        <div className="h-5 w-5 bg-gray-2 rounded"></div>
      </div>
    </div>
  );
}
