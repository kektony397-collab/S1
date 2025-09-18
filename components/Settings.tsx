
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { db } from '../services/db';
import { Refuel } from '../types';
import { DEFAULT_MILEAGE_KMPL } from '../constants';

const Settings: React.FC = () => {
  const [litres, setLitres] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [pricePerLitre, setPricePerLitre] = useState(0);
  const [message, setMessage] = useState('');
  const [userMileage, setUserMileage] = useState<string>(`${DEFAULT_MILEAGE_KMPL}`);

  useEffect(() => {
    const savedMileage = localStorage.getItem('userMileage');
    if (savedMileage) {
      setUserMileage(savedMileage);
    }
  }, []);

  useEffect(() => {
    const l = parseFloat(litres);
    const c = parseFloat(totalCost);
    if (l > 0 && c > 0) {
      setPricePerLitre(c / l);
    } else {
      setPricePerLitre(0);
    }
  }, [litres, totalCost]);

  const handleAddRefuel = async (e: React.FormEvent) => {
    e.preventDefault();
    const litresNum = parseFloat(litres);
    const totalCostNum = parseFloat(totalCost);

    if (litresNum > 0 && totalCostNum > 0) {
      const newRefuel: Refuel = {
        date: Date.now(),
        litres: litresNum,
        totalCost: totalCostNum,
        pricePerLitre: totalCostNum / litresNum,
      };
      await db.refuels.add(newRefuel);
      setMessage('Refuel added successfully!');
      setLitres('');
      setTotalCost('');
      setTimeout(() => setMessage(''), 3000);
    } else {
        setMessage('Please enter valid numbers for litres and cost.');
        setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMileage(e.target.value);
  };

  const saveMileage = () => {
    const mileageNum = parseFloat(userMileage);
    if (mileageNum > 0) {
        localStorage.setItem('userMileage', `${mileageNum}`);
        setMessage('Mileage saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    } else {
        setMessage('Please enter a valid mileage.');
        setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete ALL ride and refuel history? This action cannot be undone.")) {
        db.rides.clear();
        db.refuels.clear();
        setMessage("All data has been cleared.");
        setTimeout(() => setMessage(''), 3000);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Add Refuel</h2>
        <form onSubmit={handleAddRefuel} className="space-y-4">
          <div>
            <label htmlFor="litres" className="block text-sm font-medium mb-1">Litres Filled</label>
            <input
              id="litres"
              type="number"
              step="0.01"
              value={litres}
              onChange={(e) => setLitres(e.target.value)}
              className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="e.g., 10.5"
            />
          </div>
          <div>
            <label htmlFor="totalCost" className="block text-sm font-medium mb-1">Total Cost (₹)</label>
            <input
              id="totalCost"
              type="number"
              step="0.01"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="e.g., 1050.25"
            />
          </div>
          {pricePerLitre > 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Price: ₹{pricePerLitre.toFixed(2)} / Litre
            </div>
          )}
          <Button type="submit" className="w-full">Add Refuel Entry</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">Fuel Efficiency</h2>
         <div>
            <label htmlFor="mileage" className="block text-sm font-medium mb-1">Your Average Mileage (km/L)</label>
            <div className="flex items-center space-x-2">
                <input
                  id="mileage"
                  type="number"
                  step="0.1"
                  value={userMileage}
                  onChange={handleMileageChange}
                  className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder={`Default: ${DEFAULT_MILEAGE_KMPL}`}
                />
                <Button onClick={saveMileage}>Save</Button>
            </div>
          </div>
      </Card>
      
      <Card>
        <h2 className="text-2xl font-bold mb-4">Data Management</h2>
        <Button onClick={handleClearData} variant="danger" className="w-full">
            <i className="fas fa-trash-alt mr-2"></i>Clear All History Data
        </Button>
      </Card>

      {message && (
        <div className="fixed bottom-4 right-4 bg-light-green dark:bg-dark-green text-white py-2 px-4 rounded-lg shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
};

export default Settings;
