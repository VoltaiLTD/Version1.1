import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTimeAgo } from '../../utils/formatters';

const SyncStatus: React.FC = () => {
  const { syncStatus } = useApp();
  const { isOnline, lastSynced, pendingTransactionsCount } = syncStatus;
  
  return (
    <div className="flex items-center text-sm">
      {isOnline ? (
        <div className="flex items-center text-success-500">
          <Wifi className="h-4 w-4 mr-1" />
          <span>Online</span>
        </div>
      ) : (
        <div className="flex items-center text-warning-500">
          <WifiOff className="h-4 w-4 mr-1" />
          <span>Offline</span>
        </div>
      )}
      
      {lastSynced && (
        <div className="ml-4 flex items-center text-neutral-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Synced {getTimeAgo(lastSynced)}</span>
        </div>
      )}
      
      {pendingTransactionsCount > 0 && (
        <div className="ml-4 text-accent-500">
          {pendingTransactionsCount} pending
        </div>
      )}
    </div>
  );
};

export default SyncStatus;