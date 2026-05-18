'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ImportSectionCard, PreviewTable } from '@/components/onboarding-wizard';
import { HRMS_ENDPOINT } from '@/constant/api-endpoints';
import Icon from '@/core/components/icon';
import api from '@/libs/interceptors/api';
import { MasterConfig, MasterConfigColumn } from '@/types/masters-config';
import { validateFile } from '@/utils/onboarding-validators';
import { OnboardPayloadTransformer } from '@/utils/OnboardPayloadTransformer';

export interface GenericMasterImportStepProps {
  config: MasterConfig;
  onStepComplete?: () => void;
}

interface LocalPreviewData {
  data: Record<string, unknown>[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
}

/**
 * Generic Master Import Step Component
 *
 * New Flow:
 * 1. User uploads CSV file
 * 2. Frontend reads and parses CSV locally
 * 3. Shows preview of parsed data
 * 4. User approves the preview
 * 5. Frontend sends parsed data as JSON POST payload to API
 *
 * Reusable component for importing any master data (departments, designations, shifts, etc.)
 * Eliminates code duplication across individual step components by providing:
 * - Local CSV file reading and parsing
 * - Standard preview table display
 * - Direct API data submission
 *
 * Each master configures its specific requirements through the MasterConfig interface
 */
export const GenericMasterImportStep: React.FC<GenericMasterImportStepProps> = ({
  config,
  onStepComplete,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [localPreview, setLocalPreview] = useState<LocalPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<Record<string, unknown>[]>([]);
  const [loadingExistingData, setLoadingExistingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null);
  const [editingData, setEditingData] = useState<Record<string, unknown> | null>(null);
  const [editingNewRow, setEditingNewRow] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<string | number | null>(null);
  const [deletingRow, setDeletingRow] = useState(false);
  const [selectOptions, setSelectOptions] = useState<
    Record<string, { id: string | number; name: string }[]>
  >({});

  const currentSection = config.section;
  const ITEMS_PER_PAGE = 10;

  /**
   * Get active config - support both legacy format and mode-based format
   */
  const activeConfig = React.useMemo(() => {
    const configWithModes = config as unknown as {
      modes?: {
        minimal: {
          columns: MasterConfigColumn[];
          csvColumns: string[];
          requiredFields: string[];
        };
      };
    };
    if (configWithModes.modes) {
      return configWithModes.modes.minimal; // Default to minimal mode
    }
    return {
      columns: config.columns || [],
      csvColumns: config.csvColumns || [],
      requiredFields: config.requiredFields || [],
    };
  }, [config]);

  /**
   * Helper function to fetch existing master data from API with pagination and search
   */
  const fetchExistingData = useCallback(
    async (page: number, search: string) => {
      setLoadingExistingData(true);
      try {
        const endpointMap: Record<string, string> = {
          departments: `${HRMS_ENDPOINT}/api/v1/masters/departments`,
          designations: `${HRMS_ENDPOINT}/api/v1/masters/designations`,
          divisions: `${HRMS_ENDPOINT}/api/v1/masters/divisions`,
          branches: `${HRMS_ENDPOINT}/api/v1/masters/branches`,
          qualifications: `${HRMS_ENDPOINT}/api/v1/masters/qualifications`,
          skills: `${HRMS_ENDPOINT}/api/v1/masters/skills`,
          shifts: `${HRMS_ENDPOINT}/api/v1/masters/shifts`,
          employees: `${HRMS_ENDPOINT}/api/v1/hrms/employees`,
          salaryComponents: `${HRMS_ENDPOINT}/api/v1/masters/salary-components`,
          leaves: `${HRMS_ENDPOINT}/api/v1/masters/configurations/leave-types`,
          holidays: `${HRMS_ENDPOINT}/api/v1/masters/configurations/holidays`,
        };

        const endpoint = endpointMap[currentSection];
        if (!endpoint) {
          throw new Error(`No API endpoint configured for section: ${currentSection}`);
        }

        // Build query parameters for pagination and search
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('size', String(ITEMS_PER_PAGE));
        if (search.trim()) {
          params.append('search', search);
        }

        const urlWithParams = `${endpoint}?${params.toString()}`;
        const response = await api.get(urlWithParams);
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        const total = response.data?.total || data.length;

        setExistingData(data);
        setTotalItems(total);
      } catch (error) {
        console.warn(`Failed to fetch existing ${currentSection} data:`, error);
        setExistingData([]);
        setTotalItems(0);
      } finally {
        setLoadingExistingData(false);
      }
    },
    [currentSection],
  );

  /**
   * Refresh existing data (used after successful import)
   */
  const refreshExistingData = useCallback(async () => {
    await fetchExistingData(1, '');
  }, [fetchExistingData]);

  /**
   * Fetch select options for a given column from API
   */
  const fetchSelectOptions = useCallback(
    async (column: (typeof activeConfig.columns)[0]) => {
      if (!column.selectApiEndpoint) return;

      const fullEndpoint = column.selectApiEndpoint.startsWith('http')
        ? column.selectApiEndpoint
        : `${HRMS_ENDPOINT}${column.selectApiEndpoint}`;

      const cacheKey = column.selectApiEndpoint;
      if (selectOptions[cacheKey]) {
        return; // Already fetched
      }

      try {
        const response = await api.get(fullEndpoint);
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];

        const options = data.map((item: Record<string, unknown>) => ({
          id: item[column.selectValueField || 'id'],
          name: String(item[column.selectLabelField || 'name']),
        }));

        setSelectOptions((prev) => ({
          ...prev,
          [cacheKey]: options,
        }));
      } catch (error) {
        console.warn(`Failed to fetch select options for ${column.selectApiEndpoint}:`, error);
      }
    },
    [selectOptions, activeConfig],
  );

  /**
   * Fetch existing master data from API on component mount
   */
  useEffect(() => {
    fetchExistingData(1, '');
    // Fetch select options for columns that need them
    activeConfig.columns.forEach((column: (typeof activeConfig.columns)[0]) => {
      if (column.fieldType === 'select' && column.selectApiEndpoint) {
        fetchSelectOptions(column);
      }
    });
  }, [fetchExistingData, fetchSelectOptions, activeConfig]);

  /**
   * Fetch data when page changes (pagination)
   */
  useEffect(() => {
    if (currentPage > 0) {
      fetchExistingData(currentPage, searchQuery);
    }
  }, [currentPage, searchQuery, fetchExistingData]);

  /**
   * Reset to page 1 when search query changes
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /**
   * Convert time to 12-hour AM/PM format (hh:mm A)
   * Examples: "11:00 AM" → "11:00 AM", "14:00" → "02:00 PM", "09:00" → "09:00 AM"
   */
  const convertTimeToUTC = (time: unknown): string => {
    if (typeof time !== 'string') return '';

    const trimmed = time.trim();

    // If already in hh:mm AM/PM format, return as is
    if (trimmed.match(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)) {
      return trimmed;
    }

    // Handle 24-hour format HH:mm (e.g., "09:00", "18:00")
    if (trimmed.match(/^\d{2}:\d{2}$/)) {
      const match = trimmed.match(/^(\d{2}):(\d{2})$/);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        let period = 'AM';

        if (hours >= 12) {
          period = 'PM';
          if (hours > 12) {
            hours -= 12;
          }
        } else if (hours === 0) {
          hours = 12;
        }

        return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
      }
    }

    // Handle HH:mm:ss format, convert to 12-hour
    if (trimmed.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const match = trimmed.match(/^(\d{2}):(\d{2}):/);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        let period = 'AM';

        if (hours >= 12) {
          period = 'PM';
          if (hours > 12) {
            hours -= 12;
          }
        } else if (hours === 0) {
          hours = 12;
        }

        return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
      }
    }

    // Return original if can't parse
    return time;
  };

  /**
   * Transform data based on section type
   * Converts CSV string values to correct API data types
   */
  const transformRowData = (
    row: Record<string, unknown>,
    section: string,
  ): Record<string, unknown> => {
    const transformed = { ...row };

    // Shift-specific transformations
    if (section === 'shifts') {
      // Convert time fields to 12-hour AM/PM format (hh:mm A)
      const timeFields = [
        'utcStartTime',
        'utcEndTime',
        'utcBreakHourFromTime',
        'utcBreakHourToTime',
      ];
      timeFields.forEach((field) => {
        if (field in transformed && transformed[field]) {
          transformed[field] = convertTimeToUTC(transformed[field]);
        }
      });

      // Convert dayOffs from comma-separated string to array (or empty array if empty)
      if (typeof transformed.dayOffs === 'string') {
        const trimmedDayOffs = transformed.dayOffs.trim();
        if (trimmedDayOffs.length === 0) {
          transformed.dayOffs = [];
        } else {
          transformed.dayOffs = trimmedDayOffs
            .split(',')
            .map((day) => day.trim().toUpperCase())
            .filter((day) => day.length > 0);
        }
      }

      // Ensure bufferTimeLimit is a number
      if (transformed.bufferTimeLimit !== undefined && transformed.bufferTimeLimit !== null) {
        transformed.bufferTimeLimit = Number(transformed.bufferTimeLimit);
      }

      // Ensure minimumOvertimeHoursInMinutes is a number (default to 0 if empty)
      if (
        !transformed.minimumOvertimeHoursInMinutes ||
        transformed.minimumOvertimeHoursInMinutes === ''
      ) {
        transformed.minimumOvertimeHoursInMinutes = 0;
      } else {
        transformed.minimumOvertimeHoursInMinutes = Number(
          transformed.minimumOvertimeHoursInMinutes,
        );
      }

      // Handle optional numeric fields that can be null/empty
      const optionalNumericFields = [
        'minimumWorkHoursInMinutes',
        'maximumWorkHoursInMinutes',
        'gracePeriodInMinutes',
      ];
      optionalNumericFields.forEach((field) => {
        if (field in transformed) {
          const value = transformed[field];
          if (value === '' || value === null || value === undefined) {
            transformed[field] = null;
          } else {
            transformed[field] = Number(value);
          }
        }
      });

      // Ensure all boolean fields are actual booleans
      const booleanFields = ['disableHalfDayLeave', 'isStartEndShift', 'isActive'];
      booleanFields.forEach((field) => {
        if (field in transformed) {
          const value = transformed[field];
          if (typeof value === 'string') {
            transformed[field] = value.toLowerCase() === 'true' || value === '1';
          }
        }
      });
    }

    return transformed;
  };

  /**
   * Parse a CSV line respecting quoted values
   * Handles comma-separated values inside quotes (e.g., "val1,val2,val3")
   */
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes ("")
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Found a field separator
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last field
    if (current || values.length > 0) {
      values.push(current.trim().replace(/^"|"$/g, ''));
    }

    return values;
  };

  /**
   * Parse CSV string to array of objects
   * Maps CSV columns to the configured column names
   */
  const parseCSV = (csvContent: string): Record<string, unknown>[] => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain header and at least one data row');
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    const data: Record<string, unknown>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      // Parse CSV line respecting quoted values
      const values = parseCSVLine(line);
      const row: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to convert to appropriate type
        if (value === 'true') row[header] = true;
        else if (value === 'false') row[header] = false;
        else if (!isNaN(Number(value)) && value !== '') row[header] = Number(value);
        else row[header] = value;
      });

      // Apply section-specific transformations
      const transformedRow = transformRowData(row, currentSection);
      data.push(transformedRow);
    }

    return data;
  };

  /**
   * Handle file upload - read locally and create preview
   */
  const handleFileUpload = (file: File) => {
    const fileValid = validateFile(file);
    if (!fileValid.valid) return;

    setLoading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const parsedData = parseCSV(csvContent);

        // Create preview from parsed data
        const preview: LocalPreviewData = {
          data: parsedData,
          totalRows: parsedData.length,
          validRows: parsedData.length, // Assume all valid for now
          errorRows: 0,
          warningRows: 0,
        };

        setLocalPreview(preview);
        setShowPreview(true);
        setLoading(false);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to parse CSV');
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  /**
   * Handle template download with sample data
   */
  const handleDownloadTemplate = (): void => {
    try {
      // Use active config for CSV columns
      const columns = activeConfig.csvColumns;

      if (!columns) {
        throw new Error('No CSV columns defined for this master');
      }

      // Generate realistic sample data based on master type
      const sampleDataMap: Record<string, Record<string, unknown>[]> = {
        departments: [
          {
            id: 1,
            name: 'Human Resources',
            isActive: true,
          },
          {
            id: 2,
            name: 'Information Technology',
            isActive: true,
          },
          { id: 3, name: 'Finance', isActive: true },
        ],
        designations: [
          {
            name: 'Manager',
            jobDescription: '',
          },
          { name: 'Employee', jobDescription: '' },
          { name: 'Director', jobDescription: '' },
        ],
        shifts: [
          {
            shiftName: 'Day Shift',
            shiftType: 'Fixed',
            utcStartTime: '09:00 AM',
            utcEndTime: '06:00 PM',
            utcBreakHourFromTime: '01:00 PM',
            utcBreakHourToTime: '02:00 PM',
            firstHalfInMinutes: 240,
            secondHalfInMinutes: 240,
            minimumWorkHoursInMinutes: null,
            maximumWorkHoursInMinutes: null,
            minimumOvertimeHoursInMinutes: 120,
            maximumOvertimeHoursInMinutes: 480,
            gracePeriodInMinutes: null,
            bufferTimeInMinutes: 15,
            bufferTimeLimit: 3,
            preShiftWindowMinutes: 60,
            dayOffs: 'SUNDAY,MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
            disableHalfDayLeave: false,
            isStartEndShift: true,
            shiftColor: '#eed744',
            isActive: true,
          },
        ],
        salaryComponents: [
          {
            code: 'BASIC',
            name: 'Basic Salary',
            type: 'earning',
            calculationType: 'fixed',
            taxExemption: false,
            status: 'active',
          },
          {
            code: 'HRA',
            name: 'House Rent Allowance',
            type: 'earning',
            calculationType: 'percentage',
            taxExemption: true,
            status: 'active',
          },
          {
            code: 'PF',
            name: 'Provident Fund',
            type: 'deduction',
            calculationType: 'percentage',
            taxExemption: false,
            status: 'active',
          },
        ],
        leaves: [
          {
            code: 'EL',
            name: 'Earned Leave',
            maxDaysPerYear: 20,
            carryforwardAllowed: true,
            encashmentAllowed: true,
            status: 'active',
          },
          {
            code: 'CL',
            name: 'Casual Leave',
            maxDaysPerYear: 10,
            carryforwardAllowed: false,
            encashmentAllowed: false,
            status: 'active',
          },
          {
            code: 'SL',
            name: 'Sick Leave',
            maxDaysPerYear: 7,
            carryforwardAllowed: false,
            encashmentAllowed: false,
            status: 'active',
          },
        ],
        holidays: [
          {
            date: '2025-01-26',
            name: 'Republic Day',
            type: 'national',
            applicableLocations: 'all',
            status: 'active',
          },
          {
            date: '2025-03-08',
            name: 'Maha Shivaratri',
            type: 'regional',
            applicableLocations: 'India',
            status: 'active',
          },
          {
            date: '2025-04-14',
            name: 'Ambedkar Jayanti',
            type: 'national',
            applicableLocations: 'all',
            status: 'active',
          },
        ],
        employees: [
          {
            employeeCode: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            phone: '9876543210',
            dateOfBirth: '1990-05-15',
            department: 'HR',
            designation: 'Manager',
            shift: 'Day Shift',
            baseSalary: 50000,
            pan: 'ABCDE1234F',
            bankAccount: '1234567890',
          },
          {
            employeeCode: 'EMP002',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            phone: '9876543211',
            dateOfBirth: '1992-08-20',
            department: 'IT',
            designation: 'Employee',
            shift: 'Day Shift',
            baseSalary: 35000,
            pan: 'FGHIJ5678K',
            bankAccount: '0987654321',
          },
        ],
      };

      const sampleData = sampleDataMap[currentSection] || [];

      // Create CSV content with header
      const headers = columns.join(',');

      // Convert data rows to CSV format
      const rows = sampleData.map((row) =>
        columns
          .map((col: string) => {
            const value = row[col] || '';
            const stringValue = String(value);
            // Escape quotes and wrap in quotes
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(','),
      );

      const csvContent = [headers, ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${config.section}_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  /**
   * Handle confirm import action
   * Sends parsed CSV data as JSON POST payload to the API
   */
  const handleConfirmImport = async () => {
    if (!localPreview || !localPreview.data.length) {
      setErrorMessage('No data to import');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Map section to API endpoint
      const endpointMap: Record<string, string> = {
        departments: `${HRMS_ENDPOINT}/api/v1/masters/departments`,
        designations: `${HRMS_ENDPOINT}/api/v1/masters/designations`,
        divisions: `${HRMS_ENDPOINT}/api/v1/masters/divisions`,
        branches: `${HRMS_ENDPOINT}/api/v1/masters/branches`,
        qualifications: `${HRMS_ENDPOINT}/api/v1/masters/qualifications`,
        skills: `${HRMS_ENDPOINT}/api/v1/masters/skills`,
        shifts: `${HRMS_ENDPOINT}/api/v1/masters/shifts`,
        employees: `${HRMS_ENDPOINT}/api/v1/hrms/employees`,
        salaryComponents: `${HRMS_ENDPOINT}/api/v1/masters/salary-components`,
        leaves: `${HRMS_ENDPOINT}/api/v1/masters/configurations/leave-types`,
        holidays: `${HRMS_ENDPOINT}/api/v1/masters/configurations/holidays`,
      };

      const endpoint = endpointMap[currentSection];
      if (!endpoint) {
        throw new Error(`No API endpoint configured for section: ${currentSection}`);
      }

      // Send each row as a separate POST request
      const results = [];
      const errorDetails: string[] = [];

      for (let idx = 0; idx < localPreview.data.length; idx++) {
        const row = localPreview.data[idx];
        try {
          // Transform payload based on section
          const payload = OnboardPayloadTransformer.transform(row, currentSection);

          const response = await api.post(endpoint, payload);
          results.push({ success: true, data: response.data });
        } catch (error) {
          let errorMsg = 'Unknown error';

          // Extract detailed error message from API response
          if (error instanceof Error) {
            errorMsg = error.message;
          }

          // Try to get error details from axios response
          if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as {
              response?: { data?: { message?: string; error?: string } };
            };
            const apiMessage =
              axiosError.response?.data?.message || axiosError.response?.data?.error;
            if (apiMessage) {
              errorMsg = apiMessage;
            }
          }

          const rowLabel = row['name'] || row['shiftName'] || row['code'] || `Row ${idx + 1}`;
          errorDetails.push(`${rowLabel}: ${errorMsg}`);
          results.push({ success: false, error, errorMsg });
        }
      }

      // Check if all requests succeeded
      const allSucceeded = results.every((r) => r.success);
      if (allSucceeded) {
        setShowPreview(false);
        setLocalPreview(null);
        setErrorMessage(null);
        // Refresh existing master data list to show newly created records
        await refreshExistingData();
        onStepComplete?.();
      } else {
        const failedCount = results.filter((r) => !r.success).length;
        const detailedErrors = errorDetails.slice(0, 3).join('\n');
        const moreErrors =
          errorDetails.length > 3 ? `\n... and ${errorDetails.length - 3} more error(s)` : '';
        setErrorMessage(
          `Import completed with ${failedCount} error(s):\n\n${detailedErrors}${moreErrors}`,
        );
        // Refresh to show any successfully created records
        await refreshExistingData();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = localPreview && localPreview.errorRows > 0;
  const canImport = localPreview && !hasErrors;

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  /**
   * Handle page change
   */
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle search query change
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  /**
   * Clear search query
   */
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  /**
   * Handle edit button click
   */
  const handleEditRow = (row: Record<string, unknown>) => {
    setEditingRowId((row.id as string | number) || (row.name as string | number));
    setEditingData({ ...row });
    setEditingNewRow(false);
  };

  /**
   * Handle add new row
   */
  const handleAddNewRow = () => {
    const newRow: Record<string, unknown> = {};
    activeConfig.columns.forEach((col: (typeof activeConfig.columns)[0]) => {
      newRow[col.key] = '';
    });
    setEditingRowId('new-' + Date.now());
    setEditingData(newRow);
    setEditingNewRow(true);
  };

  /**
   * Handle input change in edit mode
   */
  const handleEditChange = (key: string, value: unknown) => {
    if (editingData) {
      setEditingData({ ...editingData, [key]: value });
    }
  };

  /**
   * Handle save edited row
   */
  const handleSaveEdit = async () => {
    if (!editingData) return;
    setSavingEdit(true);
    setErrorMessage(null); // Clear previous error messages on new attempt
    try {
      const endpointMap: Record<string, string> = {
        departments: `${HRMS_ENDPOINT}/api/v1/masters/departments`,
        designations: `${HRMS_ENDPOINT}/api/v1/masters/designations`,
        divisions: `${HRMS_ENDPOINT}/api/v1/masters/divisions`,
        branches: `${HRMS_ENDPOINT}/api/v1/masters/branches`,
        qualifications: `${HRMS_ENDPOINT}/api/v1/masters/qualifications`,
        skills: `${HRMS_ENDPOINT}/api/v1/masters/skills`,
        shifts: `${HRMS_ENDPOINT}/api/v1/masters/shifts`,
        employees: `${HRMS_ENDPOINT}/api/v1/hrms/employees`,
        salaryComponents: `${HRMS_ENDPOINT}/api/v1/masters/salary-components`,
        leaves: `${HRMS_ENDPOINT}/api/v1/masters/configurations/leave-types`,
        holidays: `${HRMS_ENDPOINT}/api/v1/masters/configurations/holidays`,
      };

      const endpoint = endpointMap[currentSection];
      if (!endpoint) {
        throw new Error(`No API endpoint configured for section: ${currentSection}`);
      }

      const payload = OnboardPayloadTransformer.transform(editingData, currentSection);

      if (editingNewRow) {
        // Create new record
        await api.post(endpoint, payload);
      } else {
        // Update existing record with PATCH (partial update)
        const id = editingData.id;
        await api.patch(`${endpoint}/${id}`, payload);
      }

      setEditingRowId(null);
      setEditingData(null);
      setEditingNewRow(false);
      await refreshExistingData();
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      setErrorMessage(errorMsg);
    } finally {
      setSavingEdit(false);
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingData(null);
    setEditingNewRow(false);
  };

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (row: Record<string, unknown>) => {
    setRowToDelete((row.id as string | number) || null);
    setDeleteDialogOpen(true);
  };

  /**
   * Helper function to extract detailed error message from API response
   */
  const extractErrorMessage = (error: unknown): string => {
    let errorMessage = 'Failed to save record';

    // Check if it's an axios error with response
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          statusText?: string;
          data?: {
            message?: string;
            error?: string;
            errors?: string | Record<string, string[]>;
            details?: string;
          };
        };
        message?: string;
      };

      const response = axiosError.response;
      if (response) {
        // Try to extract meaningful error message from response data
        if (response.data?.message) {
          errorMessage = response.data.message;
        } else if (response.data?.error) {
          errorMessage = response.data.error;
        } else if (response.data?.details) {
          errorMessage = response.data.details;
        } else if (response.data?.errors) {
          // Handle validation errors
          const errors = response.data.errors;
          if (typeof errors === 'string') {
            errorMessage = errors;
          } else if (typeof errors === 'object') {
            // Flatten nested error object to readable format
            const errorMessages = Object.entries(errors)
              .map(([field, msgs]) => {
                const messages = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                return `${field}: ${messages}`;
              })
              .join('; ');
            errorMessage = errorMessages || errorMessage;
          }
        } else if (response.status === 422) {
          errorMessage = 'Validation failed. Please check your input and try again.';
        } else if (response.status === 409) {
          errorMessage = 'This record already exists. Please use a different name or value.';
        } else if (response.status === 404) {
          errorMessage = 'Record not found. It may have been deleted.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (response.statusText) {
          errorMessage = response.statusText;
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return errorMessage;
  };

  /**
   * Helper function to format cell display value
   * For select fields, displays the label instead of the ID
   */
  const formatCellValue = (column: (typeof activeConfig.columns)[0], value: unknown): unknown => {
    if (column.fieldType === 'select' && value) {
      const cacheKey = column.selectApiEndpoint || '';
      const options = selectOptions[cacheKey] || [];
      const option = options.find((opt) => opt.id === value);
      return option ? option.name : value;
    }
    return value;
  };

  const renderInputComponent = (
    column: (typeof activeConfig.columns)[0],
    value: unknown,
    onChange: (value: unknown) => void,
    disabled?: boolean,
  ) => {
    const fieldType = column.fieldType || 'string';

    switch (fieldType) {
      case 'boolean':
      case 'checkbox':
        return (
          <Checkbox
            checked={typeof value === 'string' ? value.toLowerCase() === 'true' : !!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
        );

      case 'number':
        return (
          <TextField
            size='small'
            fullWidth
            type='number'
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            disabled={disabled}
            inputProps={{ step: '1' }}
          />
        );

      case 'email':
        return (
          <TextField
            size='small'
            fullWidth
            type='email'
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'date':
        return (
          <TextField
            size='small'
            fullWidth
            type='date'
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'time':
        return (
          <TextField
            size='small'
            fullWidth
            type='time'
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'select': {
        const cacheKey = column.selectApiEndpoint || '';
        const options = selectOptions[cacheKey] || [];
        return (
          <Select
            size='small'
            fullWidth
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          >
            <MenuItem value=''>
              <em>Select {column.label}</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        );
      }

      case 'text':
        return (
          <TextField
            size='small'
            fullWidth
            multiline
            rows={3}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'string':
      default:
        return (
          <TextField
            size='small'
            fullWidth
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  /**
   * Handle confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    setDeletingRow(true);
    setErrorMessage(null); // Clear previous error messages on new attempt
    try {
      const endpointMap: Record<string, string> = {
        departments: `${HRMS_ENDPOINT}/api/v1/masters/departments`,
        designations: `${HRMS_ENDPOINT}/api/v1/masters/designations`,
        divisions: `${HRMS_ENDPOINT}/api/v1/masters/divisions`,
        branches: `${HRMS_ENDPOINT}/api/v1/masters/branches`,
        qualifications: `${HRMS_ENDPOINT}/api/v1/masters/qualifications`,
        skills: `${HRMS_ENDPOINT}/api/v1/masters/skills`,
        shifts: `${HRMS_ENDPOINT}/api/v1/masters/shifts`,
        employees: `${HRMS_ENDPOINT}/api/v1/hrms/employees`,
        salaryComponents: `${HRMS_ENDPOINT}/api/v1/masters/salary-components`,
        leaves: `${HRMS_ENDPOINT}/api/v1/masters/configurations/leave-types`,
        holidays: `${HRMS_ENDPOINT}/api/v1/masters/configurations/holidays`,
      };

      const endpoint = endpointMap[currentSection];
      if (!endpoint) {
        throw new Error(`No API endpoint configured for section: ${currentSection}`);
      }

      await api.delete(`${endpoint}/${rowToDelete}`);
      setDeleteDialogOpen(false);
      setRowToDelete(null);
      await refreshExistingData();
    } catch (error) {
      const errorMsg = extractErrorMessage(error).replace('save record', 'delete record');
      setErrorMessage(errorMsg);
    } finally {
      setDeletingRow(false);
    }
  };

  return (
    <Box>
      {/* Title */}
      <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
        {config.label}
      </Typography>

      {/* Description Alert */}
      <Alert severity='info' icon={<Icon icon='mdi:information-variant' />} sx={{ mb: 3 }}>
        {config.description}
      </Alert>

      {/* Error Message Alert */}
      {errorMessage && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Upload Section */}
      {!showPreview && (
        <ImportSectionCard
          title={`Import ${config.label}`}
          description={`Upload CSV file with ${config.label.toLowerCase()}`}
          loading={loading}
          onUpload={handleFileUpload}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}

      {/* Preview Section */}
      {showPreview && localPreview && (
        <>
          <PreviewTable
            data={(localPreview.data as Record<string, unknown>[]) || []}
            columns={activeConfig.columns}
            errorCount={localPreview.errorRows}
            warningCount={localPreview.warningRows}
            successCount={localPreview.validRows}
            totalRows={localPreview.totalRows}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <Button variant='outlined' onClick={() => setShowPreview(false)} disabled={loading}>
              Upload Different File
            </Button>

            <Button
              variant='contained'
              onClick={handleConfirmImport}
              disabled={!canImport || loading}
              endIcon={<Icon icon='mdi:arrow-right' />}
            >
              {loading ? 'Importing...' : 'Confirm & Import'}
            </Button>
          </Box>
        </>
      )}

      {/* Existing Master Data Section */}
      <Box sx={{ mt: 5, mb: 4 }}>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
          Existing {config.label}
        </Typography>

        {/* Search Box */}
        {(totalItems > 0 || searchQuery) && (
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder={`Search ${config.label.toLowerCase()}...`}
              size='small'
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='mdi:magnify' />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position='end'>
                    <Button
                      size='small'
                      onClick={handleClearSearch}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <Icon icon='mdi:close' />
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f9f9f9',
                },
              }}
            />
            {searchQuery && (
              <Typography
                variant='caption'
                sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
              >
                Found {totalItems} matching record(s)
              </Typography>
            )}
          </Box>
        )}

        {/* Add New Row Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant='outlined'
            startIcon={<Icon icon='mdi:plus' />}
            onClick={handleAddNewRow}
            disabled={editingRowId !== null || loadingExistingData}
          >
            Add New {config.label}
          </Button>
        </Box>

        {loadingExistingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : totalItems > 0 || editingNewRow ? (
          <>
            <TableContainer component={Card} sx={{ mb: 3, overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    {activeConfig.columns.map((column: (typeof activeConfig.columns)[0]) => (
                      <TableCell key={column.key} sx={{ fontWeight: 600, minWidth: '150px' }}>
                        {column.label}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600, minWidth: '150px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* New Row Being Added (at the top) */}
                  {editingNewRow && editingData && (
                    <TableRow sx={{ backgroundColor: '#f0f4ff' }}>
                      {activeConfig.columns.map((column: (typeof activeConfig.columns)[0]) => (
                        <TableCell key={`new-${column.key}`} sx={{ minWidth: '150px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {renderInputComponent(
                              column,
                              editingData[column.key],
                              (value) => handleEditChange(column.key, value),
                              savingEdit,
                            )}
                          </Box>
                        </TableCell>
                      ))}
                      <TableCell sx={{ minWidth: '150px' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size='small'
                            onClick={handleSaveEdit}
                            disabled={savingEdit}
                            title='Save'
                          >
                            <Box sx={{ color: 'success.main' }}>
                              <Icon icon='mdi:check' />
                            </Box>
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={handleCancelEdit}
                            disabled={savingEdit}
                            title='Cancel'
                          >
                            <Box sx={{ color: 'error.main' }}>
                              <Icon icon='mdi:close' />
                            </Box>
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Existing Data Rows */}
                  {existingData.map((row, rowIndex) => {
                    const isEditing = editingRowId === (row.id || row.name);
                    return (
                      <TableRow
                        key={rowIndex}
                        sx={{
                          backgroundColor: isEditing ? '#f0f4ff' : 'inherit',
                          '&:hover': { backgroundColor: isEditing ? '#f0f4ff' : '#fafafa' },
                        }}
                      >
                        {activeConfig.columns.map((column: (typeof activeConfig.columns)[0]) => (
                          <TableCell key={`${rowIndex}-${column.key}`} sx={{ minWidth: '150px' }}>
                            {isEditing && editingData ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {renderInputComponent(
                                  column,
                                  editingData[column.key],
                                  (value) => handleEditChange(column.key, value),
                                  savingEdit,
                                )}
                              </Box>
                            ) : (
                              <>
                                {column.formatter
                                  ? column.formatter(row[column.key])
                                  : column.fieldType === 'select'
                                    ? String(formatCellValue(column, row[column.key]) || '-')
                                    : column.fieldType === 'boolean'
                                      ? typeof row[column.key] === 'string'
                                        ? (row[column.key] as string).toLowerCase() === 'true'
                                          ? '✓ Yes'
                                          : '✗ No'
                                        : row[column.key]
                                          ? '✓ Yes'
                                          : '✗ No'
                                      : String(row[column.key] || '-')}
                              </>
                            )}
                          </TableCell>
                        ))}
                        <TableCell sx={{ minWidth: '150px' }}>
                          {isEditing ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size='small'
                                onClick={handleSaveEdit}
                                disabled={savingEdit}
                                title='Save'
                              >
                                <Box sx={{ color: 'success.main' }}>
                                  <Icon icon='mdi:check' />
                                </Box>
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={handleCancelEdit}
                                disabled={savingEdit}
                                title='Cancel'
                              >
                                <Box sx={{ color: 'error.main' }}>
                                  <Icon icon='mdi:close' />
                                </Box>
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size='small'
                                onClick={() => handleEditRow(row)}
                                disabled={editingRowId !== null}
                                title='Edit'
                              >
                                <Icon icon='mdi:pencil' />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => handleDeleteClick(row)}
                                disabled={editingRowId !== null}
                                title='Delete'
                              >
                                <Box sx={{ color: 'error.main' }}>
                                  <Icon icon='mdi:trash-can' />
                                </Box>
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}
            >
              <Box>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                  Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
                  {Math.min(endIndex, totalItems)} of {totalItems} record(s)
                </Typography>
                {searchQuery && (
                  <Typography
                    variant='caption'
                    sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}
                  >
                    (Filtered from {totalItems} total)
                  </Typography>
                )}
              </Box>

              <Pagination
                count={Math.max(1, totalPages)}
                page={currentPage}
                onChange={handlePageChange}
                color='primary'
                showFirstButton
                showLastButton
                size='small'
                disabled={totalPages <= 1}
              />
            </Box>
          </>
        ) : !editingNewRow ? (
          <Alert severity='info' icon={<Icon icon='mdi:information-variant' />}>
            {searchQuery
              ? `No ${config.label.toLowerCase()} found matching "${searchQuery}". Try a different search term.`
              : `No existing ${config.label.toLowerCase()} found. Upload a CSV file to add new records.`}
          </Alert>
        ) : null}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          <Box component='span' sx={{ mr: 1, verticalAlign: 'middle' }}>
            <Icon icon='mdi:alert-circle' />
          </Box>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete this record? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deletingRow}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={deletingRow}
          >
            {deletingRow ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer Information */}
      <Card sx={{ mt: 4, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
            📋 Required Fields
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {activeConfig.requiredFields.map((field: string) => (
              <Typography key={field} variant='caption' sx={{ color: 'text.secondary' }}>
                <strong>{field}</strong>
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GenericMasterImportStep;
