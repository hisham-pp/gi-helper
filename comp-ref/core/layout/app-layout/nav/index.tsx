import { usePathname } from 'next/navigation';
import { memo, useContext, useEffect, useMemo, useRef } from 'react';
import navItems from '@/constant/nav-items';
import { SettingsContext } from '@/context/SettingsContext';
import type { NavGroup as NavGroupType, NavLink } from '../../types';
import NavGroup from './nav-group';
import NavItem from './NavItem';
import { NavContainer, NavScrollContainer } from './styled-components';

// Virtual nav item for onboarding employees (not in navItems constant)
const ONBOARDING_NAV_ITEM = {
  id: 9999,
  title: 'My Onboarding',
  path: '/my-onboarding',
  icon: 'material-symbols:assignment',
};

interface NavProps {
  navCollapsed?: boolean;
}

const Nav = ({ navCollapsed = false }: NavProps) => {
  const pathname = usePathname();
  const { initializeExpandedGroups, selectedNavId, setSelectedNavId } = useContext(SettingsContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isOnboardingPage = pathname === '/my-onboarding';

  // Find the selected nav item or detect from current pathname
  const selectedNavItem = useMemo(() => {
    // If on onboarding page, show onboarding nav item
    if (isOnboardingPage) return ONBOARDING_NAV_ITEM;

    // If a nav is explicitly selected, use it
    if (selectedNavId !== null) {
      return navItems.find((item) => item.id === selectedNavId);
    }

    // Otherwise, find the nav item that matches current pathname
    for (const item of navItems) {
      // Check if this item's path matches
      if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) {
        return item;
      }

      // Check if any child's path matches
      if ((item as NavGroupType).children?.length) {
        const matchingChild = (item as NavGroupType).children?.find(
          (child) =>
            child.path && (pathname === child.path || pathname.startsWith(child.path + '/')),
        );
        if (matchingChild) {
          return item;
        }
      }
    }

    return null;
  }, [selectedNavId, pathname, isOnboardingPage]);

  // Auto-select nav based on pathname if not already selected
  useEffect(() => {
    if (selectedNavId === null && selectedNavItem?.id) {
      setSelectedNavId(selectedNavItem.id);
    }
  }, [selectedNavId, selectedNavItem, setSelectedNavId]);

  useEffect(() => {
    const getActiveGroupIds = () => {
      const activeGroups: number[] = [];

      navItems.forEach((item) => {
        if ((item as NavGroupType).children?.length) {
          const hasActiveChild = (item as NavGroupType).children?.some(
            (child) =>
              child.path && (pathname === child.path || pathname.startsWith(child.path + '/')),
          );

          if (hasActiveChild && item.id) {
            activeGroups.push(item.id);
          }
        }
      });

      return activeGroups;
    };

    const activeGroupIds = getActiveGroupIds();
    initializeExpandedGroups(activeGroupIds);
  }, [pathname, initializeExpandedGroups]);

  // Prevent scroll propagation - parent .nav-wrapper handles scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Only handle touch events to prevent affecting main content
    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Scroll to active item when sidebar expands
  useEffect(() => {
    if (!navCollapsed) {
      // Small delay to allow the sidebar to expand and items to render
      const timer = setTimeout(() => {
        const navScrollContainer = scrollContainerRef.current;
        if (!navScrollContainer) return;

        // The actual scrollable container is .nav-wrapper (parent)
        const scrollContainer = navScrollContainer.closest('.nav-wrapper') as HTMLElement;
        if (!scrollContainer) return;

        // Find the active nav item using data attribute
        const activeItem = navScrollContainer.querySelector('[data-active="true"]') as HTMLElement;
        if (activeItem) {
          // Calculate scroll position to center the active item within the container
          const containerHeight = scrollContainer.clientHeight;
          const itemOffsetTop =
            activeItem.getBoundingClientRect().top - navScrollContainer.getBoundingClientRect().top;
          const itemHeight = activeItem.clientHeight;
          const scrollTo = itemOffsetTop - containerHeight / 2 + itemHeight / 2;

          scrollContainer.scrollTop = Math.max(0, scrollTo);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [navCollapsed]);

  const resolveItem = (item: NavLink | NavGroupType) => {
    if ((item as NavGroupType).children?.length) {
      return <NavGroup group={item} navCollapsed={navCollapsed} />;
    }

    return <NavItem item={item} navCollapsed={navCollapsed} />;
  };

  // Only show the selected nav item in the sidebar
  const itemsToRender = selectedNavItem ? [selectedNavItem] : [];

  return (
    <NavScrollContainer ref={scrollContainerRef}>
      {itemsToRender.map((item, i) => (
        <NavContainer key={`item-${item?.id}-${i}`}>{resolveItem(item)}</NavContainer>
      ))}
    </NavScrollContainer>
  );
};

export default memo(Nav);
