import React, { useState } from "react";
import {
  FormControl,
  CircularProgress,
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

interface User {
  userId: string;
  email: string;
  userName?: string;
  fullName?: string;
}

interface UserSelectorDropdownProps {
  value: string;
  onChange: (userId: string, userEmail: string, userName?: string) => void;
  users: User[];
  isLoading?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  excludeUserIds?: string[];
}

const UserSelectorDropdown: React.FC<UserSelectorDropdownProps> = ({
  value,
  onChange,
  users,
  isLoading = false,
  error,
  label = "Chọn người dùng",
  placeholder = "Tìm kiếm người dùng...",
  disabled = false,
  excludeUserIds = [],
}) => {
  const [open, setOpen] = useState(false);

  // Filter users that are not already excluded
  const availableUsers = users.filter(
    (user) => !excludeUserIds.includes(user.userId)
  );

  // Find currently selected user
  const selectedUser =
    availableUsers.find((user) => user.userId === value) || null;

  const getDisplayName = (user: User) => {
    if (user.fullName && user.fullName.trim()) {
      return user.fullName;
    }
    if (user.userName && user.userName.trim()) {
      return user.userName;
    }
    return user.email || `User ${user.userId.substring(0, 8)}...`;
  };

  const getDisplayEmail = (user: User) => {
    return user.email || "Email không có sẵn";
  };

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: User | null
  ) => {
    if (newValue) {
      onChange(
        newValue.userId,
        newValue.email,
        newValue.fullName || newValue.userName
      );
    } else {
      onChange("", "", "");
    }
  };

  if (error) {
    return (
      <FormControl fullWidth error>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </FormControl>
    );
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedUser}
      onChange={handleChange}
      options={availableUsers}
      loading={isLoading}
      disabled={disabled}
      getOptionLabel={(option) => getDisplayName(option)}
      isOptionEqualToValue={(option, value) => option.userId === value.userId}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box
            key={key}
            component="li"
            {...otherProps}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" noWrap>
                {getDisplayName(option)}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {getDisplayEmail(option)}
              </Typography>
            </Box>
          </Box>
        );
      }}
      noOptionsText={
        isLoading
          ? "Đang tải..."
          : availableUsers.length === 0
          ? "Không có người dùng khả dụng"
          : "Không tìm thấy người dùng"
      }
      sx={{ mb: 1 }}
    />
  );
};

export default UserSelectorDropdown;
