'use client';

import React from 'react';
import { Box, Typography, TypographyProps } from '@mui/material';
import { DepartmentSection } from '@/types/master/department-section';

interface SectionPathDisplayProps {
  /** The department section to display the path for */
  section?: DepartmentSection | null;
  /** Optional: Include department name in the path */
  includeDepartment?: boolean;
  /** Optional: Custom separator between path segments */
  separator?: string;
  /** Optional: Typography variant */
  variant?: TypographyProps['variant'];
  /** Optional: Custom color */
  color?: TypographyProps['color'];
  /** Optional: Placeholder text when no section */
  placeholder?: string;
}

/**
 * Displays a department section hierarchy as a slash-separated path.
 * Example: "Engineering / Backend / API Team"
 *
 * @example
 * <SectionPathDisplay section={employee.departmentSection} includeDepartment />
 * // Output: "Engineering / Backend / API Team"
 *
 * @example
 * <SectionPathDisplay section={employee.departmentSection} separator=" > " />
 * // Output: "Backend > API Team"
 */
const SectionPathDisplay: React.FC<SectionPathDisplayProps> = ({
  section,
  includeDepartment = false,
  separator = ' / ',
  variant = 'body2',
  color = 'text.secondary',
  placeholder = '-',
}) => {
  /**
   * Build the path array by traversing up the parent chain
   */
  const buildPath = React.useCallback((): string[] => {
    if (!section) return [];

    const path: string[] = [];

    // Add department name if requested
    if (includeDepartment && section.department?.name) {
      path.push(section.department.name);
    }

    // Build section path by traversing parent chain
    const sectionPath: string[] = [];
    let currentSection: DepartmentSection | undefined = section;

    while (currentSection) {
      if (currentSection.name) {
        sectionPath.unshift(currentSection.name);
      }
      currentSection = currentSection.parent;
    }

    return [...path, ...sectionPath];
  }, [section, includeDepartment]);

  const pathSegments = buildPath();

  if (pathSegments.length === 0) {
    return (
      <Typography variant={variant} color={color}>
        {placeholder}
      </Typography>
    );
  }

  return (
    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <Typography component='span' variant={variant} color={color}>
            {segment}
          </Typography>
          {index < pathSegments.length - 1 && (
            <Typography component='span' variant={variant} color='text.disabled' sx={{ mx: 0.5 }}>
              {separator.trim()}
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default SectionPathDisplay;
