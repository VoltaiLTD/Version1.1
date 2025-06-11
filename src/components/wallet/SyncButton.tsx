import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';

const SyncButton: React.FC = () => {
  const { syncData, syncStatus } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = async () => {
    if (!syncStatus.isOnline) return;
    
    setIsSyncing(true);
    try {
      await syncData();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing || !syncStatus.isOnline}
      isLoading={isSyncing}
      variant={syncStatus.isOnline ? 'primary' : 'outline'}
      className="w-full"
    >
      <RefreshCw className={`h-5 w-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Now'}
    </Button>
  );
};

export default SyncButton;