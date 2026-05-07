
import { VehicleList } from "@/modules/vehicle/components/VehicleList";
import Link from "next/link";

export default function VehiclePage(){
    return (
        <div className="max-w-lg mx-auto w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                Mis vehículos   
                </h1>   
            </div>
            
            <VehicleList />

            {/* Botón registrar */}
            <Link href="/vehicle/new">
                <button className="cursor-pointer mt-6 w-full border dark:border-gray-1 font-medium rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray- dark:hover:bg-dark-2">
                    <span className="text-lg">+</span>
                    Registrar vehículo
                </button>
            </Link>
        </div>
    );
}