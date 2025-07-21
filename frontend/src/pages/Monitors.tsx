import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  X
} from 'lucide-react';
import { useMonitors } from '../hooks/useMonitors';
import { useToast } from '../hooks/useToast';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import MonitorCard from '../components/monitors/MonitorCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Monitor } from '../types/monitor.types';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'status' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'enabled' | 'disabled' | 'healthy' | 'unhealthy' | 'degraded' | 'unknown';

const Monitors = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { 
    monitors, 
    isLoading, 
    error, 
    refetch, 
    toggleMonitor, 
    deleteMonitor, 
    checkMonitor 
  } = useMonitors();
  const { toast } = useToast();

  const handleToggleMonitor = async (id: string) => {
    try {
      await toggleMonitor.mutateAsync(id);
      toast.success('Monitor status updated');
    } catch (error) {
      toast.error('Failed to update monitor status');
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    try {
      await deleteMonitor.mutateAsync(id);
      toast.success('Monitor deleted successfully');
    } catch (error) {
      toast.error('Failed to delete monitor');
    }
  };

  const handleCheckNow = async (id: string) => {
    try {
      await checkMonitor.mutateAsync(id);
      toast.success('Monitor check initiated');
    } catch (error) {
      toast.error('Failed to check monitor');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Monitors refreshed');
  };

  // Filter and sort monitors
  const filteredAndSortedMonitors = monitors
    ?.filter((monitor: Monitor) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          monitor.url.toLowerCase().includes(searchLower) ||
          monitor.name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'enabled' && !monitor.is_enabled) return false;
        if (filterStatus === 'disabled' && monitor.is_enabled) return false;
        if (['healthy', 'unhealthy', 'degraded', 'unknown'].includes(filterStatus) && 
            monitor.current_status !== filterStatus) return false;
      }

      return true;
    })
    ?.sort((a: Monitor, b: Monitor) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name || a.url;
          bValue = b.name || b.url;
          break;
        case 'status':
          aValue = a.current_status;
          bValue = b.current_status;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
        default:
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }) || [];


  if (error) {
    return (
      <Layout showSidebar={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Card className="p-6 md:p-8">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Failed to load monitors. Please try again.
              </p>
              <Button onClick={handleRefresh} variant="primary">
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Monitors
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                Manage and monitor your website endpoints
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
              
              <Link to="/monitors/add">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Add Monitor</span>
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search monitors by URL or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Filter Toggle */}
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary"
                  size="sm"
                  className={showFilters ? 'ring-2 ring-blue-500' : ''}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Filters</span>
                </Button>

                {/* View Mode */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-l-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-r-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <div className="flex flex-wrap gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="all">All Status</option>
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                          <option value="healthy">Healthy</option>
                          <option value="unhealthy">Unhealthy</option>
                          <option value="degraded">Degraded</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sort By
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortBy)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            <option value="updated_at">Last Updated</option>
                            <option value="created_at">Created Date</option>
                            <option value="name">Name</option>
                            <option value="status">Status</option>
                          </select>
                          
                          <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {sortOrder === 'asc' ? (
                              <SortAsc className="w-4 h-4" />
                            ) : (
                              <SortDesc className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Results Info */}
        {monitors && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-4"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedMonitors.length} of {monitors.length} monitors
              {searchTerm && (
                <span> for "{searchTerm}"</span>
              )}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-12"
          >
            <LoadingSpinner size="lg" />
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && (!monitors || monitors.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 md:p-8">
              <EmptyState
                icon={<Plus className="w-full h-full" />}
                title="No monitors yet"
                description="Get started by adding your first website monitor. We'll check its availability and notify you of any issues."
                action={{
                  label: 'Add Your First Monitor',
                  onClick: () => window.location.href = '/monitors/add',
                  variant: 'primary',
                }}
              />
            </Card>
          </motion.div>
        )}

        {/* No Search Results */}
        {!isLoading && monitors && monitors.length > 0 && filteredAndSortedMonitors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 md:p-8">
              <EmptyState
                icon={<Search className="w-full h-full" />}
                title="No monitors found"
                description={`No monitors match your current search and filter criteria. Try adjusting your search term or filters.`}
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  },
                  variant: 'secondary',
                }}
              />
            </Card>
          </motion.div>
        )}

        {/* Monitors Grid/List */}
        {!isLoading && filteredAndSortedMonitors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAndSortedMonitors.map((monitor: Monitor, index: number) => (
              <motion.div
                key={monitor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MonitorCard
                  monitor={monitor}
                  onToggle={handleToggleMonitor}
                  onDelete={handleDeleteMonitor}
                  onCheckNow={handleCheckNow}
                  isLoading={
                    toggleMonitor.isPending || 
                    deleteMonitor.isPending || 
                    checkMonitor.isPending
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Monitors;