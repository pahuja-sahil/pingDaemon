import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Play,
  Globe,
  Calendar
} from 'lucide-react';
import type { Monitor } from '../../types/monitor.types';
import { formatRelativeTime, getDomainFromUrl } from '../../utils/formatters';
import Card from '../common/Card';
import Button from '../common/Button';
import StatusBadge from './StatusBadge';
import IntervalBadge from './IntervalBadge';
import Modal from '../common/Modal';

interface MonitorCardProps {
  monitor: Monitor;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCheckNow: (id: string) => void;
  isLoading?: boolean;
}

const MonitorCard = ({ monitor, onToggle, onDelete, onCheckNow, isLoading }: MonitorCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    onDelete(monitor.id);
    setShowDeleteModal(false);
  };

  const handleToggle = () => {
    onToggle(monitor.id);
  };

  const handleCheckNow = () => {
    onCheckNow(monitor.id);
  };

  return (
    <>
      <Card 
        hoverable 
        className="p-4 md:p-6 relative group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {getDomainFromUrl(monitor.url)}
              </h3>
            </div>
            
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm group/link"
            >
              <span className="truncate max-w-[200px]">{monitor.url}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            <AnimatePresence>
              {showActions && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  
                  {/* Actions Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border dark:border-gray-700 z-20"
                  >
                    <div className="py-1">
                      <Link
                        to={`/monitors/${monitor.id}/edit`}
                        onClick={() => setShowActions(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Monitor
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleToggle();
                          setShowActions(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {monitor.is_enabled ? (
                          <>
                            <PowerOff className="w-4 h-4" />
                            Disable Monitor
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4" />
                            Enable Monitor
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          handleCheckNow();
                          setShowActions(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        disabled={!monitor.is_enabled}
                      >
                        <Play className="w-4 h-4" />
                        Check Now
                      </button>
                      
                      <hr className="my-1 border-gray-200 dark:border-gray-600" />
                      
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActions(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Monitor
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status and Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={monitor.current_status} />
            <IntervalBadge interval={monitor.interval} size="sm" />
          </div>

          {/* Monitor Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`ml-2 font-medium ${
                monitor.is_enabled 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {monitor.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Threshold:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {monitor.failure_threshold} failures
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatRelativeTime(monitor.updated_at)}</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center rounded-lg">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Monitor"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the monitor for{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {getDomainFromUrl(monitor.url)}
            </span>?
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All monitoring data for this URL will be permanently deleted.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Monitor
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MonitorCard;