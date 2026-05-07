'use client'

import { CityAutocomplete } from "@/modules/city/components/CityAutocomplete"
import { Button } from "@/components/ux/Button"
import { Toast } from "@/components/ux/Toast"
import { City } from "@/models/city"
import { TripStop, TripStopExtended } from "@/models/tripStop"
import { closestCorners, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { CircleSmall, Plus, Save } from "lucide-react"
import { useState } from "react"
import { TripStopProps } from "./TripStop"
import { TripStopList } from "./TripStopList"


type TripStopFormProps = {
  initialStops?: TripStop[];
  onSubmitTripStops: (tripStops: TripStopExtended[]) => void; 
  origin?: number 
  destination?: number
  onBack: () => void
  onNext: () => void
};

export function TripStopForm({ 
    initialStops=[], 
    origin, 
    destination, 
    onSubmitTripStops, 
    onBack, 
    onNext 
}: TripStopFormProps){

    const [tripStopsList, setTripStopsList] = useState<TripStopProps[]>(
        [...initialStops]
            .sort((a, b) => {
                if (a.order == null || b.order == null) return 0;
                return a.order - b.order;
            })
            .map((stop, index) => ({
                id: index + 1,
                title: stop.cityName ?? '',
                cityId: stop.cityId,
                observation: stop.observation,
                tripStopId: stop.tripStopId
            }))
    );

    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null)
    const [observation, setObservation] = useState('')
    const [city, setCity] = useState<City>()
    const [editingStopId, setEditingStopId] = useState<number | null>(null)

    const addTripStop = (title:string, cityId:number, observation:string) => {
        if (!cityId) {
            setToast({ message: 'Seleccioná una ciudad', type: 'error' })
            return
        }
        if (!observation.trim()) {
            setToast({ message: 'Ingresá una observación', type: 'error' })
            return
        }
        if (observation.length > 100) {
            setToast({ message: 'La observación no puede superar los 100 caracteres', type: 'error' })
            return
        }
        const exists = tripStopsList.some(
            stop =>
                stop.cityId === cityId &&
                stop.id !== editingStopId 
            )
        if (exists) {
            setToast({ message: 'Ya agregaste esta ciudad', type: 'error' })
            return
        }
        if (editingStopId) {
            setTripStopsList(prev =>
            prev.map(stop =>
                stop.id === editingStopId
                ? { ...stop, title, cityId, observation }
                : stop
                )
            )
        } else {
            setTripStopsList(prev => [
            ...prev,
            { id: prev.length === 0 ? 1 : Math.max(...prev.map(s => s.id)) + 1, title, cityId, observation }
            ])
        }
        
        setCity(undefined)
        setObservation('')
        setEditingStopId(null)
    }

    
    // handleDragEnd - solo mover, no reasignar nada
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setTripStopsList(prev => {
            const oldIndex = prev.findIndex(i => i.id === active.id);
            const newIndex = prev.findIndex(i => i.id === over.id);
            return arrayMove(prev, oldIndex, newIndex); // ← sin el .map de order
        });
    };



    //Esto me daba error si lo hacia con el id del objeto, no se porque habia mas de uno con el mismo id
    const handleDeleteTripStop = (cityId: number) => {
        setTripStopsList(prev => prev.filter(stop => stop.cityId !== cityId))
    }

    const handleEditTripStop = (stopId: number) => {
        const stop = tripStopsList.find(s => s.id === stopId)
        if (!stop) return

        setCity({ id: stop.cityId, name: stop.title })
        setObservation(stop.observation ?? "")
        setEditingStopId(stopId)
    }


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor,{
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // formatTripStop - el order se asigna recién al enviar
    const formatTripStop = (stops: TripStopProps[]) =>
        stops.map((stop, index) => ({
            ...stop,
            order: index + 1,   // ← solo acá, al momento de submitear
            start: false,
            destination: false,
            cityName: stop.title,
            tripStopId: stop.tripStopId,
        }));

    
    return(
        <div className="flex flex-col flex-1 justify-between w-full max-w-md mx-auto">
            <div className="flex flex-col space-y-2 justify-center w-full">
                <h2 className="text-2xl text-center font-medium mb-7.5">
                    Ingresá tus paradas intermedias
                </h2>
                
                <CityAutocomplete
                    key={editingStopId ?? "new"}
                    value={city?.id ?? 0}
                    onChange={c => setCity(c ? { id: c.id, name: c.name } : undefined)}
                    label='Ingrese la localidad intermedia'
                    placeholder='Seleccione la localidad'
                    icon={<CircleSmall size={18} />}
                    excludeIds={[
                        origin ?? 0, 
                        destination ?? 0, 
                        ...tripStopsList
                            .filter(stop => stop.id !== editingStopId) 
                            .map(stop => stop.cityId)
                    ]}
                    outline={true}
                />
                

                <div className="md:col-span-2 mt-2 w-full">
                    <label className="text-sm font-medium font-inter">Ingrese una observación</label>
                    <textarea
                        rows={4}
                        placeholder="Observación..."
                        value={observation}
                        onChange={e => setObservation(e.target.value)}
                        className="w-full p-2 mt-2 rounded border border-gray-5 dark:border-gray-2 resize-none"
                    />
                </div>

                <div className="w-full flex justify-center mt-4.5">
                    <button
                        type="button"
                        className="flex items-center justify-center bg-gray-2 rounded-full p-3 w-1/4 cursor-pointer text-white dark:text-gray-6 hover:bg-gray-2/75"
                        onClick={() => addTripStop(city?.name ?? "", city?.id ?? 0, observation)}
                    >
                        {editingStopId ? <Save size={18} /> : <Plus size={18} />}
                    </button>
                </div>
                {tripStopsList.length > 0 && (
                    <div className="flex flex-col items-start mt-2.5 w-full">
                        <h1 className="mb-5">Paradas</h1>
                        <div className="w-full max-h-60 overflow-y-auto">
                        <DndContext
                            sensors={sensors}
                            onDragEnd={handleDragEnd}
                            collisionDetection={closestCorners}
                        >
                            <TripStopList
                                tripStops={tripStopsList}
                                onDelete={handleDeleteTripStop}
                                onEdit={handleEditTripStop}
                            />
                        </DndContext>
                        </div>
                    </div>
                )}
                
            </div>
            <div className="flex justify-center gap-4 mt-8">
                <Button 
                    variant="outline" 
                    className='flex-1 py-2 text-sm font-inter font-medium'
                    onClick={() => {
                        onSubmitTripStops(formatTripStop(tripStopsList));
                        onBack();
                    }}
                >
                    Atrás
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    className='flex-1 py-2 text-sm font-inter font-medium'
                    disabled={tripStopsList.length === 0} 
                    onClick={() => {
                        onSubmitTripStops(formatTripStop(tripStopsList));
                        onNext();
                    }}
                >
                    Siguiente
                </Button>

            </div>
            {toast && (
                <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}
