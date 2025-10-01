/**
 * The Logfather Vue Application
 * "The frontend that makes offers you can't refuse."
 */

// Main Vue Application
const logfatherApp = new Vue({
  el: '#app',
  data: {
    // Connection status
    isOnline: false,
    loading: false,
    
    // Search and filters
    searchQuery: '',
    filters: {
      level: '',
      startDate: '',
      endDate: ''
    },
    
    // Results
    logEntries: [],
    searchResults: {
      totalCount: 0,
      totalPages: 0
    },
    
    // Stats
    stats: {
      totalEntries: 0,
      lastIndexTime: null
    },
    
    // Pagination
    currentPage: 1,
    pageSize: 100,
    
    // Sorting
    sortField: 'timestamp',
    sortOrder: 'desc',
    
    // UI state
    expandedMessages: new Set(),
    
    // Debounce timer
    searchDebounceTimer: null
  },
  
  computed: {
    totalPages() {
      return this.searchResults.totalPages || 1;
    }
  },
  

  
  methods: {
    /**
     * Debounced search to avoid too many API calls
     */
    debouncedSearch() {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.performSearch(1);
      }, 300);
    },
    /**
     * Reset all user settings to defaults
     */
    resetUserSettings() {
      this.searchQuery = '';
      this.filters = {
        level: '',
        startDate: '',
        endDate: ''
      };
      this.currentPage = 1;
      this.pageSize = 100;
      this.sortField = 'timestamp';
      this.sortOrder = 'desc';
      this.expandedMessages = new Set();
      console.log('User settings reset to defaults');
    },

    /**
     * Initialize the application
     */
    async init() {
      console.log('The Logfather is awakening...');
      
      // Reset all user settings on page load
      this.resetUserSettings();
      
      await this.checkHealth();
      await this.loadStats();
      
      // Ensure logs are indexed before performing initial search
      try {
        const refreshResponse = await fetch('/logs/api/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            this.stats = refreshData.data.stats;
            this.stats.lastIndexTime = refreshData.data.lastScanTime;
            console.log('Logs refreshed during initialization');
          }
        }
      } catch (error) {
        console.warn('Failed to refresh logs during initialization:', error.message);
      }
      
      await this.performSearch();
    },
    
      /**
   * Check if the service is online
   */
  async checkHealth() {
    try {
      const response = await fetch('/logs/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.isOnline = data.status === 'alive';
      console.log('The Logfather is online:', data.tagline);
    } catch (error) {
      this.isOnline = false;
      console.error('The Logfather is not responding:', error.message);
    }
  },
    
      /**
   * Load statistics from the server
   */
  async loadStats() {
    try {
      const response = await fetch('/logs/api/stats');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success) {
        this.stats = data.data;
      }
    } catch (error) {
      console.error('Failed to load stats:', error.message);
    }
  },
    
      /**
   * Perform search with current query and filters
   */
  async performSearch(page) {
    // Reset to page 1 if no page specified or if it's an event object
    if (!page || typeof page === 'object') {
      page = 1;
    }
    this.loading = true;
    this.currentPage = page;
    
    try {
      const params = new URLSearchParams({
        q: this.searchQuery,
        page: page,
        pageSize: this.pageSize,
        sortBy: this.sortField,
        sortOrder: this.sortOrder
      });
      
      // Add filters if they have values
      if (this.filters.level) params.append('level', this.filters.level);
      if (this.filters.startDate) params.append('startDate', this.filters.startDate);
      if (this.filters.endDate) params.append('endDate', this.filters.endDate);
      
      const url = `/logs/api/logs?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        // Force Vue reactivity by creating new array references
        this.logEntries = [...data.data.entries];
        this.searchResults = { 
          totalCount: data.data.pagination.totalCount,
          totalPages: data.data.pagination.totalPages
        };
        this.currentPage = data.data.pagination.currentPage;
        this.stats.lastIndexTime = data.meta.lastScanTime;
        
        console.log(`Found ${this.searchResults.totalCount} entries`);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search failed:', error.message);
      this.showError('Search failed: ' + error.message);
      // Only clear results if it's a real error, not just no results
      if (error.message.includes('HTTP 404') || error.message.includes('HTTP 500')) {
        this.logEntries = [];
        this.searchResults = { totalCount: 0, totalPages: 0 };
        this.currentPage = 1;
      }
    } finally {
      this.loading = false;
    }
  },
    
      /**
   * Refresh logs from files
   */
  async refreshLogs() {
    this.loading = true;
    
    try {
      const response = await fetch('/logs/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        this.stats = data.data.stats;
        this.stats.lastIndexTime = data.data.lastScanTime;
        
        // Perform search again to get updated results
        await this.performSearch(1);
        
        console.log('Logs refreshed successfully');
      } else {
        throw new Error(data.message || 'Refresh failed');
      }
    } catch (error) {
      console.error('Refresh failed:', error.message);
      this.showError('Refresh failed: ' + error.message);
    } finally {
      this.loading = false;
    }
  },
    
    /**
     * Clear all filters and search
     */
    clearFilters() {
      this.searchQuery = '';
      this.filters = {
        level: '',
        startDate: '',
        endDate: ''
      };
      this.performSearch(1);
    },
    
    /**
     * Sort results by field
     */
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        this.sortField = field;
        this.sortOrder = 'desc';
      }
      this.performSearch(this.currentPage);
    },
    
    /**
     * Go to specific page
     */
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.performSearch(page);
      }
    },
    
    /**
     * Toggle message expansion for long messages
     */
    toggleMessageExpand(entryId) {
      if (this.expandedMessages.has(entryId)) {
        this.expandedMessages.delete(entryId);
      } else {
        this.expandedMessages.add(entryId);
      }
      // Force reactivity update
      this.expandedMessages = new Set(this.expandedMessages);
    },
    
    /**
     * Format datetime for display
     */
    formatDateTime(timestamp) {
      if (!timestamp) return 'Unknown';
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    },
    
    /**
     * Get filename from full path
     */
    getFileName(filePath) {
      if (!filePath) return '';
      return filePath.split('/').pop() || filePath;
    },
    
    /**
     * Highlight search terms in text
     */
    highlightSearch(text) {
      if (!this.searchQuery || !text) return text;
      
      const query = this.searchQuery.trim();
      if (!query) return text;
      
      // Split query into terms
      const terms = query.split(/\s+/).filter(term => term.length > 0);
      let highlightedText = text;
      
      terms.forEach(term => {
        const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
      });
      
      return highlightedText;
    },
    
    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    /**
     * Show error message (simple console logging for now)
     */
    showError(message) {
      console.error('The Logfather error:', message);
      // In a real app, you might want to show a toast or modal
    },
    
  },
  
  /**
   * Component lifecycle hooks
   */
  async mounted() {
    await this.init();

  },
  
});


console.log('The Logfather frontend has been initialized. "We tail everything."');