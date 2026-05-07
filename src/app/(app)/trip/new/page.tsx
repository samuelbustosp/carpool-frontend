import { TripForm } from "@/modules/trip/components/new-trip/TripForm";


export default function NewTripPage(){
    return(
        <div className="mx-auto max-w-md flex flex-col flex-1 w-full">
            <TripForm/>
        </div>
    )
}