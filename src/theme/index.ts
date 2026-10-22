export const colors = {
  primary: '#00B14F',
  primaryDark: '#008A3E',
  primaryLight: '#E6F7EE',
  bg: '#F6F7F8',
  card: '#FFFFFF',
  text: '#1F2933',
  muted: '#7B8794',
  border: '#E4E7EB',
  danger: '#E5484D',
  star: '#FFB400',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const shadow = {
  shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 }, elevation: 2,
};
export const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
