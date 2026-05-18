import { useRouter } from 'next/navigation';
import React, { memo, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import permissionKeys from '@/constant/permission-keys';
import { ROUTES } from '@/constant/routes';
import AppMenu from '@/core/components/app-menu';
import Icon from '@/core/components/icon';
import useAuth from '@/hooks/use-auth';
import { useMixpanelTracking } from '@/hooks/useMixpanelTracking';
import { imgPath } from '@/utils/file-utils';
import { getInitials } from '@/utils/string-utils';
import ChangePasswordForm from '@/views/auth/ChangePasswordForm';
import { StyledAvatar } from '@/views/private/dashboard/widgets/styled-components';
import { ProfileBadge } from './styled-components';

const { companyProfile, profile } = ROUTES;
const { companyProfileView } = permissionKeys.master.company;

const UserDropdown: React.FC = () => {
  const { logout, user } = useAuth();
  const { push } = useRouter();
  const { trackButtonClick, trackEvent } = useMixpanelTracking();

  const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false);

  const [imageError, setImageError] = useState(false);

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.photo]);

  const getProfileAvatar = useMemo(() => {
    const getUserNameInitials = getInitials(user?.name || '');
    const profileImageSrc = user?.photo ? imgPath(user?.photo) : null;

    // Show initials if no photo or if image failed to load
    const shouldShowInitials = !user?.photo || !profileImageSrc || imageError;

    return shouldShowInitials ? (
      <StyledAvatar hasImage={false}>{getUserNameInitials}</StyledAvatar>
    ) : (
      <StyledAvatar
        alt={user?.name || 'User'}
        src={profileImageSrc}
        hasImage={true}
        imgProps={{
          onError: () => setImageError(true),
        }}
      />
    );
  }, [user, imageError]);
  const toggelPasswordDrawer = () => {
    setPasswordDrawerOpen(!passwordDrawerOpen);
  };

  const userInfoHeader = useMemo(
    () => (
      <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
          {user?.name || 'User'}
        </Typography>
        {user?.employeeNumber && (
          <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
            {user.employeeNumber}
          </Typography>
        )}
        {user?.company?.name && (
          <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
            {user.company.name}
          </Typography>
        )}
      </Box>
    ),
    [user],
  );

  return (
    <React.Fragment>
      <AppMenu
        renderMenuIcon={<ProfileBadge>{getProfileAvatar}</ProfileBadge>}
        options={[
          {
            content: userInfoHeader,
            closeOnClick: false,
          },
          {
            text: 'Profile',
            icon: <Icon icon='bx:user' />,
            menuItemProps: {
              onClick: () => {
                trackButtonClick('User Dropdown - Profile');
                push(profile?.root?.path);
              },
            },
          },
          {
            text: 'Company Profile',
            icon: <Icon icon='iconoir:profile-circle' />,
            menuItemProps: {
              onClick: () => {
                trackButtonClick('User Dropdown - Company Profile');
                push(companyProfile?.root?.path);
              },
            },
            permissionKeys: [companyProfileView],
          },
          {
            text: 'Change Password',
            icon: <Icon icon='carbon:password' />,
            menuItemProps: {
              onClick: () => {
                trackButtonClick('User Dropdown - Change Password');
                toggelPasswordDrawer();
              },
            },
          },
          { divider: true },
          {
            text: 'Sign out',
            icon: <Icon icon='bx:power-off' />,
            menuItemProps: {
              onClick: () => {
                trackEvent('User Logout', { userName: user?.name, userEmail: user?.email });
                logout();
              },
            },
          },
        ]}
      />
      {passwordDrawerOpen && (
        <ChangePasswordForm open={passwordDrawerOpen} onClose={toggelPasswordDrawer} />
      )}
    </React.Fragment>
  );
};

export default memo(UserDropdown);
