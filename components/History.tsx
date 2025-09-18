
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import Card from './ui/Card';
import Button from './ui/Button';
import { Ride, Refuel } from '../types';

enum HistoryView {
    RIDES = 'RIDES',
    REFUELS = 'REFUELS'
}

const RideItem: React.FC<{ride: Ride}> = ({ ride }) => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="col-span-2 md:col-span-1">
            <p className="font-semibold">{new Date(ride.dateStart).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">{new Date(ride.dateStart).toLocaleTimeString()}</p>
        </div>
        <div className="text-center"><span className="font-mono text-lg">{ride.distanceKm.toFixed(2)}</span><span className="text-sm"> km</span></div>
        <div className="text-center"><span className="font-mono text-lg">{ride.avgSpeedKmH.toFixed(1)}</span><span className="text-sm"> km/h</span></div>
        <div className="text-center"><span className="font-mono text-lg">{ride.maxSpeedKmH.toFixed(1)}</span><span className="text-sm"> km/h</span></div>
        <div className="text-center"><span className="font-mono text-lg">{ride.fuelUsed.toFixed(2)}</span><span className="text-sm"> L</span></div>
    </div>
);

const RefuelItem: React.FC<{refuel: Refuel}> = ({ refuel }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="col-span-2 md:col-span-1">
            <p className="font-semibold">{new Date(refuel.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">{new Date(refuel.date).toLocaleTimeString()}</p>
        </div>
        <div className="text-center"><span className="font-mono text-lg">{refuel.litres.toFixed(2)}</span><span className="text-sm"> L</span></div>
        <div className="text-center"><span className="font-mono text-lg">₹{refuel.pricePerLitre.toFixed(2)}</span></div>
        <div className="text-center"><span className="font-mono text-lg font-bold">₹{refuel.totalCost.toFixed(2)}</span></div>
    </div>
);


const History: React.FC = () => {
  const [view, setView] = useState<HistoryView>(HistoryView.RIDES);

  const rides = useLiveQuery(() => db.rides.orderBy('dateStart').reverse().toArray(), []);
  const refuels = useLiveQuery(() => db.refuels.orderBy('date').reverse().toArray(), []);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">History</h2>
        <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <Button size="sm" variant={view === HistoryView.RIDES ? 'primary' : 'secondary'} onClick={() => setView(HistoryView.RIDES)}>Rides</Button>
          <Button size="sm" variant={view === HistoryView.REFUELS ? 'primary' : 'secondary'} onClick={() => setView(HistoryView.REFUELS)}>Refuels</Button>
        </div>
      </div>
      
      <div>
        {view === HistoryView.RIDES ? (
          <div>
             <div className="hidden md:grid grid-cols-5 gap-4 p-4 font-bold text-gray-500 dark:text-gray-400">
                <div>Date</div>
                <div className="text-center">Distance</div>
                <div className="text-center">Avg Speed</div>
                <div className="text-center">Max Speed</div>
                <div className="text-center">Fuel Used</div>
            </div>
            {rides?.length ? rides.map(ride => <RideItem key={ride.id} ride={ride} />) : <p className="text-center p-8 text-gray-500">No rides recorded yet.</p>}
          </div>
        ) : (
          <div>
            <div className="hidden md:grid grid-cols-4 gap-4 p-4 font-bold text-gray-500 dark:text-gray-400">
                <div>Date</div>
                <div className="text-center">Litres</div>
                <div className="text-center">Price/L</div>
                <div className="text-center">Total Cost</div>
            </div>
            {refuels?.length ? refuels.map(refuel => <RefuelItem key={refuel.id} refuel={refuel} />) : <p className="text-center p-8 text-gray-500">No refuels recorded yet.</p>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default History;
