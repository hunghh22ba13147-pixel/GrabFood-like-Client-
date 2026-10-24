export function getAuthErrorMessage(error: unknown): string {
  const value = error as { code?: string; message?: string } | null;
  const code = value?.code ?? value?.message ?? '';
  if (code.includes('firebase/not-configured')) return 'Chưa có cấu hình Firebase của nhóm. Hãy thêm cấu hình vào file .env.local.';
  if (code.includes('auth/email-already-in-use')) return 'Email này đã có tài khoản. Hãy đăng nhập.';
  if (code.includes('auth/invalid-email')) return 'Email chưa đúng định dạng.';
  if (code.includes('auth/weak-password')) return 'Mật khẩu cần có ít nhất 6 ký tự.';
  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) return 'Email hoặc mật khẩu chưa đúng.';
  if (code.includes('auth/too-many-requests')) return 'Bạn thử quá nhiều lần. Hãy chờ một lúc rồi thử lại.';
  if (code.includes('auth/network-request-failed')) return 'Không kết nối được Firebase. Kiểm tra Internet rồi thử lại.';
  if (code.includes('auth/operation-not-allowed')) return 'Firebase chưa bật đăng nhập bằng Email/Password.';
  if (code.includes('auth/email-already-verified')) return 'Email này đã được xác minh. Bạn có thể đăng nhập.';
  return 'Có lỗi khi xác thực tài khoản. Hãy kiểm tra cấu hình Firebase rồi thử lại.';
}
