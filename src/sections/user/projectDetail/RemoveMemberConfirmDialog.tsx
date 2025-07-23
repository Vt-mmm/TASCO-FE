import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { Warning, PersonRemove, Close } from "@mui/icons-material";

interface Props {
  open: boolean;
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isRemoving?: boolean;
}

const RemoveMemberConfirmDialog: React.FC<Props> = ({
  open,
  memberName,
  onConfirm,
  onCancel,
  isRemoving = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(44, 44, 44, 0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#d32f2f",
        }}
      >
        <Warning sx={{ color: "#d32f2f" }} />
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 600, color: "#d32f2f" }}
        >
          Xác nhận loại thành viên
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "#2C2C2C",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Bạn có chắc chắn muốn loại{" "}
            <strong style={{ color: "#d32f2f" }}>"{memberName}"</strong> khỏi dự
            án không?
          </Typography>
        </Box>

        <Alert
          severity="warning"
          sx={{
            borderRadius: 2,
            backgroundColor: "#fff3e0",
            border: "1px solid #ffcc02",
            "& .MuiAlert-icon": {
              color: "#ed6c02",
            },
          }}
        >
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Thành viên này sẽ không thể truy cập dự án
            nữa và cần được mời lại nếu muốn tham gia.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          startIcon={<Close />}
          disabled={isRemoving}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 500,
            borderColor: "#e0e0e0",
            color: "#666666",
            "&:hover": {
              borderColor: "#bdbdbd",
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Hủy
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<PersonRemove />}
          disabled={isRemoving}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 500,
            backgroundColor: "#d32f2f",
            "&:hover": {
              backgroundColor: "#c62828",
            },
          }}
        >
          {isRemoving ? "Đang loại..." : "Loại khỏi dự án"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveMemberConfirmDialog;
