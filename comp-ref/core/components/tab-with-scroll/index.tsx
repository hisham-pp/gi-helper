import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import {
  StyledContentPaper,
  StyledNavItem,
  StyledSection,
  StyledSidebarPaper,
} from './styled-components';
import { ScrollableNavProps } from './types';

const ScrollableNav: React.FC<ScrollableNavProps> = ({
  sections,
  contentHeight = 'calc(100vh - 32vh)',
  scrollOffset = 250,
  disableBodyScroll = true,
}) => {
  const [activeComponent, setActiveComponent] = useState<string | null>(
    sections.length > 0 ? sections[0].id : null,
  );

  const sectionRefs = useRef(sections.map(() => React.createRef<HTMLElement>()));
  const contentRef = useRef<HTMLDivElement | null>(null);
  const manualScroll = useRef(false);
  const isInitialMount = useRef(true);

  const handleClick = useCallback(
    (id: string) => {
      manualScroll.current = true;
      const section = document.getElementById(id);
      if (contentRef.current && section) {
        contentRef.current.scrollTo({ top: section.offsetTop - scrollOffset, behavior: 'smooth' });
      }
      setActiveComponent(id);

      setTimeout(() => {
        manualScroll.current = false;
      }, 700);
    },
    [scrollOffset],
  );

  const componentSections = useMemo(() => {
    return sections.map((section) => (
      <StyledSection
        key={section.id}
        ref={sectionRefs.current[sections.indexOf(section)]}
        id={section.id}
      >
        {section.component}
      </StyledSection>
    ));
  }, [sections]);

  const navItems = useMemo(() => {
    return sections.map((section) => (
      <StyledNavItem
        key={section.id}
        active={activeComponent === section.id}
        onClick={() => handleClick(section.id)}
      >
        {section.title}
      </StyledNavItem>
    ));
  }, [activeComponent, sections, handleClick]);

  useEffect(() => {
    if (disableBodyScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [disableBodyScroll]);

  useEffect(() => {
    const options = { root: null, rootMargin: '0px', threshold: 0.5 };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isInitialMount.current) {
        return;
      }
      if (!manualScroll.current) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveComponent(entry.target.id);
          }
        });
      }
    };

    const observer = new IntersectionObserver(observerCallback, options);
    const currentSectionRefs = sectionRefs.current;
    currentSectionRefs.forEach((ref) => ref.current && observer.observe(ref.current));

    // Allow observer to work after initial mount
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 500);

    return () => {
      clearTimeout(timer);
      currentSectionRefs.forEach((ref) => ref.current && observer.unobserve(ref.current));
    };
  }, [sections]);

  return (
    <Box sx={{ display: 'flex', height: contentHeight }}>
      <StyledSidebarPaper>
        <nav>
          <ul style={{ padding: 0, margin: 0 }}>{navItems}</ul>
        </nav>
      </StyledSidebarPaper>
      <StyledContentPaper ref={contentRef}>{componentSections}</StyledContentPaper>
    </Box>
  );
};

export default memo(ScrollableNav);
