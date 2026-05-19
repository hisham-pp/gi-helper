"use client";

import ListItemButton, {
  type ListItemButtonProps,
} from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";

import Translations from "@/components/core/translations";

import type { NavigationButtonProps } from "./types";

export default function NavigationButton({
  active = false,
  component,
  disabled = false,
  href,
  icon,
  label,
  onClick,
}: NavigationButtonProps) {
  const theme = useTheme();

  const sharedProps = {
    disabled,
    onClick,
    selected: active,
    sx: {
      mb: 0.5,
      color: active ? "primary.main" : "text.secondary",
      "&.Mui-selected": {
        bgcolor: alpha(theme.palette.primary.main, 0.14),
        color: "primary.main",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.2),
        },
      },
      "&:hover": {
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        color: "text.primary",
      },
    },
  } satisfies ListItemButtonProps;

  const content = (
    <>
      {icon && (
        <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
          {icon}
        </ListItemIcon>
      )}
      <ListItemText
        primary={
          <Typography
            component="span"
            sx={{ fontSize: 14, fontWeight: active ? 800 : 700 }}
          >
            <Translations text={label} />
          </Typography>
        }
      />
    </>
  );

  if (component && href) {
    return (
      <ListItemButton component={component} href={href} {...sharedProps}>
        {content}
      </ListItemButton>
    );
  }

  return <ListItemButton {...sharedProps}>{content}</ListItemButton>;
}
