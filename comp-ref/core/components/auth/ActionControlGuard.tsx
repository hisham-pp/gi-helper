import { usePathname, useRouter } from 'next/navigation';
import { FC, ReactNode, useEffect, useMemo } from 'react';
import { RouteItem, RouteObject, ROUTES } from '@/constant/routes';
import AuthLayoutComponent from '@/core/layout/auth-layout/AuthLayout';
import { EmployeeStatus } from '@/enums/employee';
import useAuth from '@/hooks/use-auth';
import { usePermission } from '@/hooks/use-permission';
import AuthLoading from '@/views/auth/AuthLoading';

type AclGuardProps = {
  children: ReactNode;
};

function findRouteByPath(routeObj: RouteObject, currentPath: string): RouteItem | null {
  for (const key in routeObj) {
    const value = routeObj[key];

    if (typeof value === 'object') {
      if (value.path === currentPath) {
        return value as RouteItem;
      }

      const result = findRouteByPath(value as RouteObject, currentPath);

      if (result) return result;
    }
  }

  return null;
}

const ONBOARDING_PATH = '/my-onboarding';

const ActionControlGuard: FC<AclGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { havePermission } = usePermission();

  const routeObject = useMemo(() => findRouteByPath(ROUTES, pathname), [pathname]);

  // Redirect to onboarding if employee has pending onboarding status
  useEffect(() => {
    if (!loading && user) {
      const isPendingOnboarding =
        user.status === EmployeeStatus.ONBOARDING_IN_PROGRESS ||
        user.status === EmployeeStatus.SUBMITTED ||
        user.status === EmployeeStatus.UNDER_HR_REVIEW;
      const isOnOnboardingPage = pathname === ONBOARDING_PATH;

      if (isPendingOnboarding && !isOnOnboardingPage) {
        router.replace(ONBOARDING_PATH);
      }
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return <AuthLoading />;
  }

  // Show loading while redirecting to onboarding
  const isOnboardingStatus =
    user.status === EmployeeStatus.ONBOARDING_IN_PROGRESS ||
    user.status === EmployeeStatus.SUBMITTED ||
    user.status === EmployeeStatus.UNDER_HR_REVIEW;
  if (isOnboardingStatus && pathname !== ONBOARDING_PATH) {
    return <AuthLoading />;
  }

  if (!routeObject?.permissionKey) {
    return <>{children}</>;
  }

  if (user?.role?.permissions) {
    if (havePermission(routeObject?.permissionKey || '')) {
      return <>{children}</>;
    }
  }

  return (
    <AuthLayoutComponent>
      <h2>You are not authorized</h2>
    </AuthLayoutComponent>
  );
};

export default ActionControlGuard;
