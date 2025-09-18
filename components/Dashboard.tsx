import React, { useState, useEffect, useCallback, useRef } from 'react';
import Speedometer from './Speedometer';
import Card from './ui/Card';
import Button from './ui/Button';
import { db } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { haversineDistance } from '../services/geoService';
import { useKalmanFilter } from '../hooks/useKalmanFilter';
import { GeolocationData, Ride } from '../types';
import { DEFAULT_MILEAGE_KMPL } from '../constants';

const Dashboard: React.FC = () => {
    const [speed, setSpeed] = useState(0);
    const [isRiding, setIsRiding] = useState(false);
    const [currentRide, setCurrentRide] = useState<Partial<Ride> & { startTime?: number }>({});
    const [tripDistance, setTripDistance] = useState(0);
    const [tripDuration, setTripDuration] = useState(0);
    const [maxSpeed, setMaxSpeed] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

    const lastPosition = useRef<GeolocationData | null>(null);
    const watchId = useRef<number | null>(null);
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
    const tripDurationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const smoothSpeed = useKalmanFilter({ r: 0.01, q: 3 });
    
    // Data from DB
    const totalLitres = useLiveQuery(async () => {
      const refuels = await db.refuels.toArray();
      return refuels.reduce((acc, r) => acc + r.litres, 0);
    }, [], 0);

    const totalDistanceDriven = useLiveQuery(async () => {
        const rides = await db.rides.toArray();
        return rides.reduce((acc, r) => acc + r.distanceKm, 0);
    }, [], 0);
    
    const userMileage = parseFloat(localStorage.getItem('userMileage') || `${DEFAULT_MILEAGE_KMPL}`);
    
    const remainingFuel = totalLitres - (totalDistanceDriven / userMileage);
    const estimatedRange = remainingFuel > 0 ? remainingFuel * userMileage : 0;

    const checkPermissions = useCallback(async () => {
        if (navigator.permissions) {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            setPermissionStatus(status.state);
            status.onchange = () => setPermissionStatus(status.state);
        }
    }, []);
    
    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    const handlePositionUpdate = (position: GeolocationPosition) => {
        // FIX: The 'timestamp' property is on 'position', not 'position.coords'.
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;
        let speedMps = position.coords.speed || 0;

        const currentPosition: GeolocationData = { latitude, longitude, accuracy, timestamp, speed: speedMps };

        if (lastPosition.current && isRiding) {
            const distanceDelta = haversineDistance(
                lastPosition.current.latitude, lastPosition.current.longitude,
                latitude, longitude
            );
            
            const timeDeltaSeconds = (timestamp - lastPosition.current.timestamp) / 1000;
            
            if (timeDeltaSeconds > 0 && distanceDelta > 0.001) { // 1 meter threshold
               const calculatedSpeedMps = (distanceDelta * 1000) / timeDeltaSeconds;
               // Prefer calculated speed if device speed is unavailable or seems wrong
               if (speedMps === 0 || calculatedSpeedMps < speedMps * 2) { 
                   speedMps = calculatedSpeedMps;
               }
            }
            
            setTripDistance(prev => prev + distanceDelta);
            setMaxSpeed(prev => Math.max(prev, speedMps * 3.6));
        }

        const speedKmh = speedMps * 3.6;
        const smoothed = smoothSpeed(speedKmh);
        setSpeed(smoothed > 1 ? smoothed : 0);
        
        lastPosition.current = currentPosition;
    };
    
    const handleError = (err: GeolocationPositionError) => {
        setError(`GPS Error: ${err.message}`);
    };

    const startRide = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        watchId.current = navigator.geolocation.watchPosition(handlePositionUpdate, handleError, options);
        
        setIsRiding(true);
        setTripDistance(0);
        setTripDuration(0);
        setMaxSpeed(0);
        setCurrentRide({ dateStart: Date.now(), startTime: Date.now() });

        if (tripDurationInterval.current) clearInterval(tripDurationInterval.current);
        tripDurationInterval.current = setInterval(() => {
            setTripDuration(prev => prev + 1);
        }, 1000);
    };

    const stopRide = useCallback(async () => {
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        if (tripDurationInterval.current) clearInterval(tripDurationInterval.current);

        watchId.current = null;
        setIsRiding(false);
        setSpeed(0);
        lastPosition.current = null;

        if (tripDistance > 0.01) { // Only save rides longer than 10 meters
             const rideData: Ride = {
                dateStart: currentRide.dateStart || Date.now(),
                dateEnd: Date.now(),
                distanceKm: tripDistance,
                avgSpeedKmH: tripDistance > 0 && tripDuration > 0 ? (tripDistance / (tripDuration / 3600)) : 0,
                maxSpeedKmH: maxSpeed,
                fuelUsed: tripDistance / userMileage,
            };
            await db.rides.add(rideData);
        }
    }, [tripDistance, tripDuration, maxSpeed, userMileage, currentRide.dateStart]);
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (isRiding) {
                stopRide();
            }
        };
    }, [isRiding, stopRide]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    if (permissionStatus === 'denied') {
        return (
            <Card className="text-center">
                <h2 className="text-xl font-bold text-light-red dark:text-dark-red">Location Access Denied</h2>
                <p className="mt-2">This application requires location access to function. Please enable location permissions for this site in your browser settings.</p>
            </Card>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card className="flex flex-col items-center justify-center">
                    <Speedometer speed={isRiding ? speed : 0} />
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    <div className="mt-6 flex space-x-4">
                        <Button onClick={startRide} disabled={isRiding} size="lg" className="w-32 bg-light-green dark:bg-dark-green">
                            <i className="fas fa-play mr-2"></i>Start
                        </Button>
                        <Button onClick={stopRide} disabled={!isRiding} size="lg" className="w-32 bg-light-red dark:bg-dark-red">
                            <i className="fas fa-stop mr-2"></i>Stop
                        </Button>
                    </div>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <h3 className="font-bold text-lg mb-4 text-light-accent dark:text-dark-accent">Current Trip</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between"><span>Distance</span><span className="font-mono font-bold">{tripDistance.toFixed(2)} km</span></div>
                        <div className="flex justify-between"><span>Duration</span><span className="font-mono font-bold">{formatDuration(tripDuration)}</span></div>
                        <div className="flex justify-between"><span>Avg Speed</span><span className="font-mono font-bold">{ (tripDistance > 0 && tripDuration > 0 ? (tripDistance / (tripDuration/3600)).toFixed(1) : '0.0')} km/h</span></div>
                        <div className="flex justify-between"><span>Max Speed</span><span className="font-mono font-bold">{maxSpeed.toFixed(1)} km/h</span></div>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold text-lg mb-4 text-light-accent dark:text-dark-accent">Fuel & Range</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between"><span>Remaining Fuel</span><span className="font-mono font-bold">{remainingFuel.toFixed(2)} L</span></div>
                        <div className="flex justify-between"><span>Est. Range</span><span className="font-mono font-bold text-2xl text-light-green dark:text-dark-green">{estimatedRange.toFixed(0)} km</span></div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;