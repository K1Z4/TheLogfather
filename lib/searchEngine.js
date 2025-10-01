/**
 * Search Engine Module - The Logfather
 * "We find what you're looking for. Always."
 */

/**
 * In-memory search engine for log entries
 */
class LogSearchEngine {
  constructor() {
    this.entries = [];
    this.indexedTerms = new Map();
    this.lastIndexTime = null;
  }

  /**
   * Index log entries for fast searching
   * @param {Array<Object>} entries - Log entries to index
   */
  indexEntries(entries) {
    this.entries = [...entries];
    this.indexedTerms.clear();
    
    entries.forEach((entry, index) => {
      this.indexEntry(entry, index);
    });
    
    this.lastIndexTime = new Date();
  }

  /**
   * Index a single log entry
   * @param {Object} entry - Log entry to index
   * @param {number} index - Entry index in array
   */
  indexEntry(entry, index) {
    const searchableText = this.getSearchableText(entry);
    const terms = this.extractTerms(searchableText);
    
    terms.forEach(term => {
      if (!this.indexedTerms.has(term)) {
        this.indexedTerms.set(term, new Set());
      }
      this.indexedTerms.get(term).add(index);
    });
  }

  /**
   * Extract searchable text from log entry
   * @param {Object} entry - Log entry
   * @returns {string} Searchable text
   */
  getSearchableText(entry) {
    return [
      entry.message || '',
      entry.level || '',
      entry.sourceFile || '',
      entry.raw || ''
    ].join(' ').toLowerCase();
  }

  /**
   * Extract search terms from text
   * @param {string} text - Text to extract terms from
   * @returns {Array<string>} Array of search terms
   */
  extractTerms(text) {
    // Split on word boundaries and filter out short terms
    return text
      .split(/\W+/)
      .filter(term => term.length >= 2)
      .map(term => term.toLowerCase());
  }

  /**
   * Search log entries
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Object} Search results with entries and metadata
   */
  search(query, options = {}) {
    const {
      level = null,
      startDate = null,
      endDate = null,
      sourceFile = null,
      page = 1,
      pageSize = 100,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options;

    let results = this.entries;

    // Text search
    if (query && query.trim()) {
      const searchIndices = this.performTextSearch(query.trim());
      results = searchIndices.map(index => this.entries[index]);
    }

    // Apply filters
    results = this.applyFilters(results, {
      level,
      startDate,
      endDate
    });

    // Sort results
    results = this.sortResults(results, sortBy, sortOrder);

    // Calculate pagination
    const totalCount = results.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalCount);
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      entries: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      searchMeta: {
        query,
        searchTime: this.lastIndexTime,
        resultsFound: totalCount
      }
    };
  }

  /**
   * Perform text search using indexed terms
   * @param {string} query - Search query
   * @returns {Array<number>} Array of matching entry indices
   */
  performTextSearch(query) {
    const queryTerms = this.extractTerms(query.toLowerCase());
    
    if (queryTerms.length === 0) {
      return Array.from({ length: this.entries.length }, (_, i) => i);
    }

    // Find entries that match any term (OR logic)
    const matchingIndices = new Set();
    
    queryTerms.forEach(term => {
      // Exact match
      if (this.indexedTerms.has(term)) {
        this.indexedTerms.get(term).forEach(index => {
          matchingIndices.add(index);
        });
      }
      
      // Partial match (for prefix searching)
      this.indexedTerms.forEach((indices, indexedTerm) => {
        if (indexedTerm.includes(term)) {
          indices.forEach(index => {
            matchingIndices.add(index);
          });
        }
      });
    });

    return Array.from(matchingIndices);
  }

  /**
   * Apply filters to search results
   * @param {Array<Object>} entries - Entries to filter
   * @param {Object} filters - Filter criteria
   * @returns {Array<Object>} Filtered entries
   */
  applyFilters(entries, filters) {
    return entries.filter(entry => {
      // Level filter
      if (filters.level && entry.level !== filters.level) {
        return false;
      }

      // Date range filters
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (entry.timestamp < startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (entry.timestamp > endDate) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort search results
   * @param {Array<Object>} entries - Entries to sort
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Array<Object>} Sorted entries
   */
  sortResults(entries, sortBy, sortOrder) {
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    
    return entries.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * multiplier;
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * multiplier;
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier;
      }
      
      // Fallback comparison
      return String(aValue).localeCompare(String(bValue)) * multiplier;
    });
  }

  /**
   * Get statistics about indexed entries
   * @returns {Object} Index statistics
   */
  getIndexStats() {
    const levelCounts = {};
    const sourceFileCounts = {};
    
    this.entries.forEach(entry => {
      // Count by level
      levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;
      
      // Count by source file
      const filename = entry.sourceFile.split('/').pop() || entry.sourceFile;
      sourceFileCounts[filename] = (sourceFileCounts[filename] || 0) + 1;
    });

    return {
      totalEntries: this.entries.length,
      totalTerms: this.indexedTerms.size,
      lastIndexTime: this.lastIndexTime,
      levelCounts,
      sourceFileCounts
    };
  }

  /**
   * Clear the search index
   */
  clearIndex() {
    this.entries = [];
    this.indexedTerms.clear();
    this.lastIndexTime = null;
  }
}

export { LogSearchEngine };